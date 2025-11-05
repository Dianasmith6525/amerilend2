import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { getGoogleUserInfo } from "./google-oauth";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Manus OAuth callback
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });

  // Google OAuth callback
  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const error = getQueryParam(req, "error");

    if (error) {
      console.log("[Google OAuth] User cancelled or error:", error);
      res.redirect(302, "/login?error=google_auth_cancelled");
      return;
    }

    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    try {
      console.log("[Google OAuth] Processing callback with code");
      
      // Get user info from Google
      const googleUser = await getGoogleUserInfo(code);
      console.log("[Google OAuth] User info retrieved:", { email: googleUser.email });

      if (!googleUser.email_verified) {
        console.log("[Google OAuth] Email not verified");
        res.redirect(302, "/login?error=email_not_verified");
        return;
      }

      // Create or get user
      let user = await db.getUserByEmail(googleUser.email);
      
      if (!user) {
        console.log("[Google OAuth] Creating new user");
        await db.upsertUser({
          email: googleUser.email,
          openId: `google_${googleUser.sub}`,
          name: googleUser.name,
          loginMethod: "google",
          role: "user",
        });
        user = await db.getUserByEmail(googleUser.email);
      } else {
        console.log("[Google OAuth] User already exists");
        // Update last signed in
        await db.upsertUser({
          email: googleUser.email,
          openId: user.openId,
          name: googleUser.name,
          loginMethod: "google",
          lastSignedIn: new Date(),
        });
      }

      if (!user) {
        throw new Error("Failed to create or retrieve user");
      }

      // Create session
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: googleUser.name,
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      console.log(`[Google OAuth] Session created for ${user.email}`);
      
      // Redirect to the callback page which will redirect to dashboard
      res.redirect(302, "/auth/google/callback?success=true");
    } catch (error) {
      console.error("[Google OAuth] Callback error:", error);
      res.redirect(302, "/login?error=google_auth_failed");
    }
  });
}
