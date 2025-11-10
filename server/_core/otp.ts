/**
 * OTP (One-Time Password) authentication module
 * Handles OTP generation, validation, and delivery for signup/login
 */

import { getDb } from "../db";
import { otpCodes } from "../../drizzle/schema";
import { eq, and, gt, desc } from "drizzle-orm";
import { sendEmailOTP, sendSMSOTP } from "./notification";

/**
 * Generate a 6-digit OTP code
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create and store an OTP code for email verification
 */
export async function createOTP(
  email: string, 
  code: string,
  purpose: "signup" | "login" | "password_reset", 
  expiresAt: Date
): Promise<string> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Invalidate any existing OTP codes for this email/purpose
  await db
    .update(otpCodes)
    .set({ verified: 1 }) // Mark as verified to prevent reuse
    .where(
      and(
        eq(otpCodes.email, email),
        eq(otpCodes.purpose, purpose as any),
        eq(otpCodes.verified, 0)
      )
    );

  // Create new OTP
  await db.insert(otpCodes).values({
    email,
    code,
    purpose: purpose as any,
    expiresAt,
    verified: 0,
    attempts: 0,
  });

  return code;
}

/**
 * Verify an OTP code
 */
export async function verifyOTP(
  email: string,
  code: string,
  purpose: "signup" | "login" | "password_reset"
): Promise<{ valid: boolean; error?: string } | boolean> {
  const db = await getDb();
  if (!db) {
    return { valid: false, error: "Database not available" };
  }

  // Find the most recent unverified OTP for this email/purpose
  const results = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.email, email),
        eq(otpCodes.purpose, purpose as any),
        eq(otpCodes.verified, 0),
        gt(otpCodes.expiresAt, new Date())
      )
    )
    .orderBy(desc(otpCodes.createdAt))
    .limit(1);

  if (results.length === 0) {
    return purpose === "password_reset" ? false : { valid: false, error: "No valid OTP found or OTP expired" };
  }

  const otpRecord = results[0];

  // Check if too many attempts
  if (otpRecord.attempts >= 5) {
    return purpose === "password_reset" ? false : { valid: false, error: "Too many failed attempts. Please request a new code." };
  }

  // Increment attempts
  await db
    .update(otpCodes)
    .set({ attempts: otpRecord.attempts + 1 })
    .where(eq(otpCodes.id, otpRecord.id));

  // Verify code (trim whitespace to handle any formatting issues)
  const trimmedCode = code.trim();
  if (otpRecord.code !== trimmedCode) {
    return purpose === "password_reset" ? false : { valid: false, error: "Invalid code" };
  }

  // Mark as verified
  await db
    .update(otpCodes)
    .set({ verified: 1 })
    .where(eq(otpCodes.id, otpRecord.id));

  return purpose === "password_reset" ? true : { valid: true };
}

/**
 * Send OTP via email using SendGrid
 */
export async function sendOTPEmail(
  email: string,
  code: string,
  purpose: "signup" | "login" | "password_reset"
): Promise<void> {
  try {
    await sendEmailOTP({
      to: email,
      code,
      expiryMinutes: 10,
    });
  } catch (error) {
    console.error("[OTP] Failed to send email:", error);
    // Fallback: log to console for development
    console.log(`
═══════════════════════════════════════
  OTP CODE FOR ${purpose.toUpperCase()}
═══════════════════════════════════════
  Email: ${email}
  Code: ${code}
  Expires in: 10 minutes
═══════════════════════════════════════
    `);
  }
}

/**
 * Send OTP via SMS using Twilio
 */
export async function sendOTPSMS(
  phoneNumber: string,
  code: string,
  purpose: "signup" | "login"
): Promise<void> {
  try {
    await sendSMSOTP({
      to: phoneNumber,
      code,
      expiryMinutes: 10,
    });
  } catch (error) {
    console.error("[OTP] Failed to send SMS:", error);
    // Fallback: log to console for development
    console.log(`
═══════════════════════════════════════
  SMS OTP CODE FOR ${purpose.toUpperCase()}
═══════════════════════════════════════
  Phone: ${phoneNumber}
  Code: ${code}
  Expires in: 10 minutes
═══════════════════════════════════════
    `);
  }
}

/**
 * Clean up expired OTP codes (should be run periodically)
 */
export async function cleanupExpiredOTPs(): Promise<void> {
  const db = await getDb();
  if (!db) {
    return;
  }

  // Mark OTPs older than 1 hour as verified to prevent reuse
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  await db
    .update(otpCodes)
    .set({ verified: 1 })
    .where(
      and(
        eq(otpCodes.verified, 0),
        gt(otpCodes.expiresAt, oneHourAgo)
      )
    );
}
