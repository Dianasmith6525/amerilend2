import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { getGoogleUserInfo } from "./google-oauth";
import { 
  exchangeFacebookCodeForToken, 
  getFacebookUserProfile,
  getFacebookAuthUrl
} from "./facebook-oauth";
import { 
  exchangeAppleCodeForToken, 
  decodeAppleIdToken,
  getAppleAuthUrl
} from "./apple-oauth";
import {
  exchangeMicrosoftCodeForToken,
  getMicrosoftUserProfile,
  getMicrosoftAuthUrl
} from "./microsoft-oauth";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // OAuth URL endpoints for frontend to fetch authorization URLs
  app.get("/api/auth/facebook/url", (req: Request, res: Response) => {
    try {
      const url = getFacebookAuthUrl();
      res.json({ url });
    } catch (error) {
      console.error("[Facebook OAuth] Failed to generate URL:", error);
      res.status(500).json({ error: "Failed to generate Facebook OAuth URL" });
    }
  });

  app.get("/api/auth/apple/url", (req: Request, res: Response) => {
    try {
      const url = getAppleAuthUrl();
      res.json({ url });
    } catch (error) {
      console.error("[Apple OAuth] Failed to generate URL:", error);
      res.status(500).json({ error: "Failed to generate Apple OAuth URL" });
    }
  });

  app.get("/api/auth/microsoft/url", (req: Request, res: Response) => {
    try {
      const url = getMicrosoftAuthUrl();
      res.json({ url });
    } catch (error) {
      console.error("[Microsoft OAuth] Failed to generate URL:", error);
      res.status(500).json({ error: "Failed to generate Microsoft OAuth URL" });
    }
  });

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

  // Facebook OAuth callback
  app.get("/api/auth/facebook/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const error = getQueryParam(req, "error");

    if (error) {
      console.log("[Facebook OAuth] User cancelled or error:", error);
      res.redirect(302, "/login?error=facebook_auth_cancelled");
      return;
    }

    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    try {
      console.log("[Facebook OAuth] Processing callback with code");

      // Exchange code for access token
      const tokenResponse = await exchangeFacebookCodeForToken(code);

      // Get user info from Facebook
      const facebookUser = await getFacebookUserProfile(tokenResponse.access_token);
      console.log("[Facebook OAuth] User info retrieved:", { email: facebookUser.email });

      if (!facebookUser.email) {
        console.log("[Facebook OAuth] Email not provided");
        res.redirect(302, "/login?error=email_required");
        return;
      }

      // Create or get user
      let user = await db.getUserByEmail(facebookUser.email);

      if (!user) {
        console.log("[Facebook OAuth] Creating new user");
        await db.upsertUser({
          email: facebookUser.email,
          openId: `facebook_${facebookUser.id}`,
          name: facebookUser.name,
          loginMethod: "facebook",
          role: "user",
        });
        user = await db.getUserByEmail(facebookUser.email);
      } else {
        console.log("[Facebook OAuth] User already exists");
        // Update last signed in
        await db.upsertUser({
          email: facebookUser.email,
          openId: user.openId,
          name: facebookUser.name,
          loginMethod: "facebook",
          lastSignedIn: new Date(),
        });
      }

      if (!user) {
        throw new Error("Failed to create or retrieve user");
      }

      // Create session
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: facebookUser.name,
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      console.log(`[Facebook OAuth] Session created for ${user.email}`);

      // Redirect to success page
      res.redirect(302, "/auth/facebook/callback?success=true");
    } catch (error) {
      console.error("[Facebook OAuth] Callback error:", error);
      res.redirect(302, "/login?error=facebook_auth_failed");
    }
  });

  // Apple OAuth callback
  app.post("/api/auth/apple/callback", async (req: Request, res: Response) => {
    const { code, user: appleUserJson, id_token: idToken } = req.body;

    if (!code && !idToken) {
      res.status(400).json({ error: "code or id_token is required" });
      return;
    }

    try {
      console.log("[Apple OAuth] Processing callback");

      let email: string | undefined;
      let name: string | undefined;
      let appleId: string | undefined;

      // If we have id_token, decode it (contains user info)
      if (idToken) {
        const decodedToken = decodeAppleIdToken(idToken);
        email = decodedToken.email;
        appleId = decodedToken.user;
        name = decodedToken.name?.firstName ? `${decodedToken.name.firstName} ${decodedToken.name.lastName || ""}`.trim() : undefined;
      }

      // If we have code, exchange for token
      if (code && !email) {
        const tokenResponse = await exchangeAppleCodeForToken(code);
        if (tokenResponse.id_token) {
          const decodedToken = decodeAppleIdToken(tokenResponse.id_token);
          email = decodedToken.email;
          appleId = decodedToken.user;
          name = decodedToken.name?.firstName ? `${decodedToken.name.firstName} ${decodedToken.name.lastName || ""}`.trim() : undefined;
        }
      }

      // Also check user data from POST body
      if (appleUserJson) {
        const userData = JSON.parse(appleUserJson);
        if (userData.name) {
          const firstName = userData.name.firstName || "";
          const lastName = userData.name.lastName || "";
          name = `${firstName} ${lastName}`.trim();
        }
      }

      if (!email) {
        console.log("[Apple OAuth] Email not provided");
        res.redirect(302, "/login?error=email_required");
        return;
      }

      if (!appleId) {
        throw new Error("Apple user ID not found");
      }

      // Create or get user
      let user = await db.getUserByEmail(email);

      if (!user) {
        console.log("[Apple OAuth] Creating new user");
        await db.upsertUser({
          email,
          openId: `apple_${appleId}`,
          name,
          loginMethod: "apple",
          role: "user",
        });
        user = await db.getUserByEmail(email);
      } else {
        console.log("[Apple OAuth] User already exists");
        // Update last signed in
        await db.upsertUser({
          email,
          openId: user.openId,
          name,
          loginMethod: "apple",
          lastSignedIn: new Date(),
        });
      }

      if (!user) {
        throw new Error("Failed to create or retrieve user");
      }

      // Create session
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      console.log(`[Apple OAuth] Session created for ${user.email}`);

      // Redirect to success page
      res.redirect(302, "/auth/apple/callback?success=true");
    } catch (error) {
      console.error("[Apple OAuth] Callback error:", error);
      res.redirect(302, "/login?error=apple_auth_failed");
    }
  });

  // Microsoft OAuth callback
  app.get("/api/auth/microsoft/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const error = getQueryParam(req, "error");

    if (error) {
      console.log("[Microsoft OAuth] User cancelled or error:", error);
      res.redirect(302, "/login?error=microsoft_auth_cancelled");
      return;
    }

    if (!code) {
      res.status(400).json({ error: "Authorization code is required" });
      return;
    }

    try {
      console.log("[Microsoft OAuth] Processing callback with code");

      // Exchange code for access token
      const tokenResponse = await exchangeMicrosoftCodeForToken(code);

      // Get user info from Microsoft
      const microsoftUser = await getMicrosoftUserProfile(tokenResponse.access_token);
      console.log("[Microsoft OAuth] User info retrieved:", { email: microsoftUser.mail });

      const email = microsoftUser.mail || microsoftUser.userPrincipalName;

      if (!email) {
        console.log("[Microsoft OAuth] Email not provided");
        res.redirect(302, "/login?error=email_required");
        return;
      }

      // Create or get user
      let user = await db.getUserByEmail(email);

      if (!user) {
        console.log("[Microsoft OAuth] Creating new user");
        await db.upsertUser({
          email,
          openId: `microsoft_${microsoftUser.id}`,
          name: microsoftUser.displayName,
          loginMethod: "microsoft",
          role: "user",
        });
        user = await db.getUserByEmail(email);
      } else {
        console.log("[Microsoft OAuth] User already exists");
        // Update last signed in
        await db.upsertUser({
          email,
          openId: user.openId,
          name: microsoftUser.displayName,
          loginMethod: "microsoft",
          lastSignedIn: new Date(),
        });
      }

      if (!user) {
        throw new Error("Failed to create or retrieve user");
      }

      // Create session
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: microsoftUser.displayName,
        expiresInMs: ONE_YEAR_MS,
      });

      // Set cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      console.log(`[Microsoft OAuth] Session created for ${user.email}`);

      // Redirect to success page
      res.redirect(302, "/auth/microsoft/callback?success=true");
    } catch (error) {
      console.error("[Microsoft OAuth] Callback error:", error);
      res.redirect(302, "/login?error=microsoft_auth_failed");
    }
  });
}
