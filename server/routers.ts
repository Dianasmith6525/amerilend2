import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
// import { adminBankRouter } from "./_core/adminBankRouter"; // Module not found
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { createOTP, verifyOTP, sendOTPEmail } from "./_core/otp";
import { createAuthorizeNetTransaction, getAcceptJsConfig } from "./_core/authorizenet";
import { createStripePaymentIntent, getStripePublishableKey } from "./_core/stripe";
import { createCryptoCharge, checkCryptoPaymentStatus, getSupportedCryptos, convertUSDToCrypto } from "./_core/crypto-payment";
import { legalAcceptances, loanApplications } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { generateSupportResponse, getSuggestedQuestions, trackSupportConversation } from "./_core/aiSupport";
import { getGoogleAuthUrl, getGoogleUserInfo } from "./_core/google-oauth";
import { sdk } from "./_core/sdk";
import { sendEmail, sendLoanStatusEmailEnhanced, sendWelcomeEmail, sendEmailVerification } from "./_core/notification";
import { ENV } from "./_core/env";
import { generateApplicationReferenceNumber } from "./_core/refNumber";
import { sanitizeInputMiddleware } from "./_core/sanitizeMiddleware";
import { generateReceiptPDF, generateTextReceipt } from "./_core/receiptGenerator";
import { createRateLimitMiddleware, RateLimits } from "./_core/rateLimiting";
import { validatePassword, DEFAULT_PASSWORD_REQUIREMENTS } from "./_core/passwordPolicy";

/**
 * Helper: Send payment receipt via email with PDF attachment
 */
async function sendPaymentReceipt(payment: any, application: any, customerEmail: string, customerName: string) {
  try {
    const receiptData = {
      payment,
      customerName,
      customerEmail,
      applicationId: application.referenceNumber || `#${application.id}`,
      loanAmount: application.requestedAmount,
      loanType: application.loanType,
    };

    // Generate PDF receipt
    const pdfBuffer = await generateReceiptPDF(receiptData);
    
    // Generate text version for email body
    const textReceipt = generateTextReceipt(receiptData);

    // Send email with PDF attachment
    await sendEmail({
      to: customerEmail,
      subject: `Payment Receipt - AmeriLend Application ${receiptData.applicationId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c5282;">Payment Confirmation</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you for your payment! Your payment has been successfully processed.</p>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #2d3748;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0;"><strong>Amount Paid:</strong></td>
                <td style="padding: 8px 0; text-align: right;">$${(payment.amount / 100).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Payment Method:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${payment.paymentMethod === 'card' ? 'Credit/Debit Card' : 'Cryptocurrency'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Application ID:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${receiptData.applicationId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Date:</strong></td>
                <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString('en-US')}</td>
              </tr>
            </table>
          </div>

          <p>A detailed PDF receipt is attached to this email for your records.</p>
          
          <p style="margin-top: 30px;">Your loan application is now being processed. You will receive updates on your application status via email.</p>
          
          <p style="color: #718096; font-size: 14px; margin-top: 40px;">
            <strong>Important:</strong> The processing fee is non-refundable regardless of loan approval status. 
            Loan approval is subject to credit check and verification of submitted information.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          
          <p style="color: #718096; font-size: 12px; text-align: center;">
            AmeriLend - Loan Processing Services<br>
            For questions, please contact: support@amerilendloan.com
          </p>
        </div>
      `,
      text: textReceipt,
      attachments: [{
        filename: `AmeriLend-Receipt-${payment.id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    });

    console.log(`[Receipt] Sent payment receipt to ${customerEmail} for payment #${payment.id}`);
  } catch (error) {
    console.error('[Receipt] Error sending payment receipt:', error);
    // Don't throw - payment succeeded, receipt is bonus
  }
}

export const appRouter = router({
  system: systemRouter,
  // adminBank: adminBankRouter, // Module not found
  
  // Authentication router
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  
  // Google OAuth router
  googleAuth: router({
    // Get Google OAuth URL
    getAuthUrl: publicProcedure.query(() => {
      try {
        console.log('[Google OAuth] Generating auth URL');
        
        // Check if Google OAuth is configured
        if (!ENV.GOOGLE_CLIENT_ID || !ENV.GOOGLE_CLIENT_SECRET || !ENV.GOOGLE_CALLBACK_URL) {
          console.error('[Google OAuth] Missing environment variables:', {
            hasClientId: !!ENV.GOOGLE_CLIENT_ID,
            hasClientSecret: !!ENV.GOOGLE_CLIENT_SECRET,
            hasCallbackUrl: !!ENV.GOOGLE_CALLBACK_URL,
          });
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Google OAuth not configured",
          });
        }
        
        const url = getGoogleAuthUrl();
        console.log('[Google OAuth] Auth URL generated successfully');
        return { url };
      } catch (error) {
        console.error('[Google OAuth] Error generating auth URL:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate Google auth URL",
        });
      }
    }),
    
    // Handle Google OAuth callback
    callback: publicProcedure
      .input(z.object({
        code: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        console.log('[Google OAuth] Starting callback with code:', input.code.substring(0, 10) + '...');
        
        try {
          // Validate environment variables first
          if (!ENV.GOOGLE_CLIENT_ID || !ENV.GOOGLE_CLIENT_SECRET || !ENV.GOOGLE_CALLBACK_URL) {
            console.error('[Google OAuth] Missing environment variables in callback');
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Google OAuth not configured",
            });
          }
          
          // Get user info from Google
          console.log('[Google OAuth] Exchanging code for user info');
          const googleUser = await getGoogleUserInfo(input.code);
          console.log('[Google OAuth] User info retrieved:', { email: googleUser.email, verified: googleUser.email_verified });
          
          if (!googleUser.email_verified) {
            console.log('[Google OAuth] Email not verified');
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Email not verified with Google",
            });
          }
          
          // Create or get user
          console.log('[Google OAuth] Checking if user exists:', googleUser.email);
          let user = await db.getUserByEmail(googleUser.email);
          
          if (!user) {
            console.log('[Google OAuth] Creating new user');
            // Create new user
            await db.upsertUser({
              email: googleUser.email,
              openId: `google_${googleUser.sub}`,
              role: "user",
            });
            user = await db.getUserByEmail(googleUser.email);
            console.log('[Google OAuth] User created:', user?.email);
          } else {
            console.log('[Google OAuth] User already exists:', user.email);
          }
          
          if (!user) {
            console.log('[Google OAuth] Failed to create/get user');
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create user",
            });
          }
          
          // Create session
          console.log('[Google OAuth] Creating session token');
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: googleUser.name,
          });
          console.log('[Google OAuth] Session token created');
          
          // Set cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
          console.log('[Google OAuth] Cookie set');
          
          console.log(`[Google OAuth] Session created for ${user.email}`);
          return { success: true, user: { email: user.email, name: googleUser.name } };
        } catch (error) {
          console.error('[Google OAuth] Error in callback:', error);
          
          // Ensure we always return a proper error response
          if (error instanceof TRPCError) {
            throw error;
          }
          
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Google authentication failed",
          });
        }
      }),
  }),

  // OTP Authentication router
  otp: router({  
    // Request OTP code for signup or login
    requestCode: publicProcedure
      .use(createRateLimitMiddleware(RateLimits.OTP))
      .use(sanitizeInputMiddleware())
      .input(z.object({
        email: z.string().email(),
        purpose: z.enum(["signup", "login"]),
      }))
      .mutation(async ({ input }) => {
        try {
          console.log(`[OTP] Requesting code for ${input.email} (${input.purpose})`);
          // Generate a random 6-digit code
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
          await createOTP(input.email, code, input.purpose, expiresAt);
          console.log(`[OTP] Generated code: ${code}`);
          await sendOTPEmail(input.email, code, input.purpose);
          console.log(`[OTP] Email sent successfully`);
          return { success: true };
        } catch (error) {
          console.error('[OTP] Error:', error);
          throw error;
        }
      }),

    // Verify OTP code
    verifyCode: publicProcedure
      .use(createRateLimitMiddleware(RateLimits.AUTH))
      .use(sanitizeInputMiddleware())
      .input(z.object({
        email: z.string().email(),
        code: z.string().length(6),
        purpose: z.enum(["signup", "login"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await verifyOTP(input.email, input.code, input.purpose);
        // verifyOTP returns an object with { valid: boolean, error?: string }
        if (typeof result === 'object' && !result.valid) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: result.error || "Invalid code" 
          });
        }

        // Create or get user
        let user = await db.getUserByEmail(input.email);
        
        if (!user) {
          // Create new user for signup
          await db.upsertUser({
            email: input.email,
            openId: input.email, // Use email as openId for OTP users
            role: "user",
          });
          user = await db.getUserByEmail(input.email);
        }

        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          });
        }

        // Create session
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.email || undefined,
        });
        
        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        console.log(`[OTP] Session created for ${user.email}`);
        return { success: true, user };
      }),

    // Request password reset OTP
    requestPasswordReset: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Check if user exists
          const user = await db.getUserByEmail(input.email);
          if (!user) {
            // Don't reveal if user exists or not for security
            return { success: true };
          }

          // Generate a random 6-digit code
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
          await createOTP(input.email, code, "password_reset", expiresAt);
          
          console.log(`[OTP] Password reset code for ${input.email}: ${code}`);
          await sendOTPEmail(input.email, code, "password_reset");
          
          return { success: true };
        } catch (error) {
          console.error('[OTP] Password reset error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to send password reset code"
          });
        }
      }),

    // Reset password with OTP
    resetPassword: publicProcedure
      .input(z.object({
        email: z.string().email(),
        code: z.string().length(6),
        newPassword: z.string().min(8),
      }))
      .mutation(async ({ input }) => {
        try {
          // Validate password strength
          const passwordValidation = validatePassword(input.newPassword, DEFAULT_PASSWORD_REQUIREMENTS, {
            email: input.email,
          });
          
          if (!passwordValidation.isValid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: passwordValidation.errors[0] || "Password does not meet security requirements"
            });
          }

          // Verify OTP
          const result = await verifyOTP(input.email, input.code, "password_reset");
          if (typeof result === 'object' && !result.valid) {
            throw new TRPCError({ 
              code: "BAD_REQUEST", 
              message: result.error || "Invalid or expired code" 
            });
          }

          // Get user
          const user = await db.getUserByEmail(input.email);
          if (!user) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found"
            });
          }

          // Hash new password
          const bcrypt = await import('bcryptjs');
          const passwordHash = await bcrypt.hash(input.newPassword, 10);
          
          // Update password
          await db.updateUserPassword(user.id, passwordHash);
          
          console.log(`[OTP] Password reset successful for ${input.email}`);
          return { success: true };
        } catch (error: any) {
          console.error('[OTP] Reset password error:', error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to reset password"
          });
        }
      }),
  }),

  // Password Authentication router
  password: router({
    // Register with email and password
    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(8, "Password must be at least 8 characters"),
      }))
      .mutation(async ({ input, ctx }) => {
        const { email, password } = input;

        // Validate password strength
        const passwordValidation = validatePassword(password, DEFAULT_PASSWORD_REQUIREMENTS, {
          email,
        });
        
        if (!passwordValidation.isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: passwordValidation.errors[0] || "Password does not meet security requirements"
          });
        }

        // Check if user already exists
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User already exists",
          });
        }

        // Hash password
        const bcrypt = await import("bcryptjs");
        const passwordHash = await bcrypt.hash(password, 10);

        // Generate verification token and OTP code
        const crypto = await import("crypto");
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const otpCode = Math.random().toString().slice(2, 8);

        // Create user (unverified)
        await db.upsertUser({
          email,
          openId: email, // Use email as openId for password users
          passwordHash,
          loginMethod: "password",
          role: "user",
          emailVerified: 0, // Mark as unverified
        });

        const user = await db.getUserByEmail(email);
        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          });
        }

        // Set verification token
        try {
          await db.setEmailVerificationToken(user.id, verificationToken, 30); // 30 minute expiry
        } catch (error) {
          console.error('[Password] Failed to set verification token:', error);
        }

        // Store OTP code for verification
        try {
          await createOTP(
            email,
            otpCode,
            'signup',
            new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
          );
        } catch (error) {
          console.error('[Password] Failed to create OTP code:', error);
        }

        // Send verification email with both token and OTP (non-blocking)
        try {
          if (user.email) {
            const displayName = user.name || undefined;
            await sendEmailVerification(user.email as string, verificationToken, otpCode, displayName as string | undefined);
          }
        } catch (emailError) {
          console.error('[Password] Verification email failed:', emailError);
          // Don't fail the signup if email fails
        }

        console.log(`[Password] Account created for ${user.email} - verification required`);
        return { 
          success: true, 
          user: {
            ...user,
            emailVerified: 0, // Return unverified status
          },
          requiresVerification: true,
        };
      }),

    // Login with email and password
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const { email, password } = input;

          // Get user
          const user = await db.getUserByEmail(email);
          if (!user || !user.passwordHash) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid email or password",
            });
          }

          // Verify password
          const bcrypt = await import("bcryptjs");
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid email or password",
            });
          }

          // Create session
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: user.email || undefined,
          });
          
          // Set cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

          console.log(`[Password] Login successful for ${user.email}`);
          return { success: true, user };
        } catch (error) {
          console.error("[Password Login] Error:", error);
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Login failed",
          });
        }
      }),

    // Request password reset (sends OTP to email)
    requestPasswordReset: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const { email } = input;

        // Check if user exists
        const user = await db.getUserByEmail(email);
        if (!user) {
          // For security, don't reveal if user exists
          // Just return success but don't send email
          console.log(`[Password Reset] User not found: ${email}`);
          return { success: true };
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Store OTP
        await createOTP(email, code, "password_reset", expiresAt);

        // Determine if this is a password reset or password setup
        const isPasswordSetup = !user.passwordHash;
        const emailSubject = isPasswordSetup 
          ? "Set Your Password - AmeriLend" 
          : "Password Reset Code - AmeriLend";
        const emailTitle = isPasswordSetup 
          ? "Set Your Password" 
          : "Password Reset Request";
        const emailMessage = isPasswordSetup
          ? "You requested to set a password for your account. Use the code below to create your password:"
          : "You requested to reset your password. Use the code below to reset your password:";

        // Send email with reset code
        await sendEmail({
          to: email,
          subject: emailSubject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0033A0;">${emailTitle}</h2>
              <p>${emailMessage}</p>
              <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                ${code}
              </div>
              <p>This code will expire in 15 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="color: #666; font-size: 12px;">
                <strong>AmeriLend</strong><br>
                This is an automated message, please do not reply.
              </p>
            </div>
          `,
        });

        console.log(`[Password Reset] Code sent to ${email} (${isPasswordSetup ? 'setup' : 'reset'})`);
        return { success: true };
      }),

    // Verify reset code and set new password
    resetPassword: publicProcedure
      .input(z.object({
        email: z.string().email(),
        code: z.string().length(6),
        newPassword: z.string().min(8, "Password must be at least 8 characters"),
      }))
      .mutation(async ({ input }) => {
        const { email, code, newPassword } = input;

        // Verify OTP
        const isValid = await verifyOTP(email, code, "password_reset");
        if (!isValid) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired reset code",
          });
        }

        // Get user
        const user = await db.getUserByEmail(email);
        if (!user) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "User not found",
          });
        }

        // Hash new password
        const bcrypt = await import("bcryptjs");
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.updateUserPassword(user.id, passwordHash);

        // Delete used OTP (OTPs auto-expire, so this is optional)
        // await deleteOTP(email, "password_reset");

        console.log(`[Password Reset] Password reset successful for ${email}`);
        return { success: true };
      }),
  }),

  // Email Verification router
  emailVerification: router({
    // Verify email with token
    verifyToken: publicProcedure
      .input(z.object({
        token: z.string().min(32),
      }))
      .mutation(async ({ input }) => {
        try {
          console.log(`[Email Verification] Verifying token: ${input.token.substring(0, 10)}...`);
          
          const verified = await db.verifyEmailByToken(input.token);
          
          if (!verified) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid or expired verification token",
            });
          }

          console.log(`[Email Verification] ✅ Email verified via token`);
          return { success: true, message: "Email verified successfully!" };
        } catch (error: any) {
          console.error("[Email Verification] Token verification error:", error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Email verification failed",
          });
        }
      }),

    // Verify email with OTP code
    verifyOTP: publicProcedure
      .input(z.object({
        email: z.string().email(),
        code: z.string().length(6),
      }))
      .mutation(async ({ input }) => {
        try {
          console.log(`[Email Verification] Verifying OTP for ${input.email}`);

          // Verify OTP code (using existing OTP verification)
          const result = await verifyOTP(input.email, input.code, "signup");
          if (typeof result === 'object' && !result.valid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: result.error || "Invalid or expired code",
            });
          }

          // Mark email as verified
          const verified = await db.verifyEmailByOTP(input.email, input.code);
          
          if (!verified) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to verify email",
            });
          }

          console.log(`[Email Verification] ✅ Email verified via OTP for ${input.email}`);
          return { success: true, message: "Email verified successfully!" };
        } catch (error: any) {
          console.error("[Email Verification] OTP verification error:", error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Email verification failed",
          });
        }
      }),

    // Resend verification email
    resend: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        try {
          console.log(`[Email Verification] Resending verification email to ${input.email}`);

          const user = await db.getUserByEmail(input.email);
          if (!user) {
            // Don't reveal if user exists for security
            return { success: true };
          }

          // If already verified, no need to resend
          if (user.emailVerified === 1) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Email already verified",
            });
          }

          // Generate new verification token and OTP
          const crypto = await import("crypto");
          const verificationToken = crypto.randomBytes(32).toString('hex');
          const otpCode = Math.random().toString().slice(2, 8);

          // Update verification token
          await db.setEmailVerificationToken(user.id, verificationToken, 30);

          // Create new OTP
          await createOTP(input.email, otpCode, "signup", new Date(Date.now() + 30 * 60 * 1000));

          // Send verification email
          await sendEmailVerification(user.email as string, verificationToken, otpCode, user.name as string | undefined);

          console.log(`[Email Verification] ✅ Verification email resent to ${input.email}`);
          return { success: true, message: "Verification email sent" };
        } catch (error: any) {
          console.error("[Email Verification] Resend error:", error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to resend verification email",
          });
        }
      }),

    // Check if email is verified
    isVerified: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .query(async ({ input }) => {
        try {
          const user = await db.getUserByEmail(input.email);
          if (!user) {
            return { verified: false };
          }

          return { verified: user.emailVerified === 1 };
        } catch (error) {
          console.error("[Email Verification] Check verification error:", error);
          return { verified: false };
        }
      }),
  }),

  // Loan application router
  loans: router({
    // Verify email address with token (for loan applications)
    verifyEmail: publicProcedure
      .input(z.object({
        applicationId: z.number(),
        token: z.string().min(32)
      }))
      .mutation(async ({ input }) => {
        const verified = await db.verifyEmailToken(input.applicationId, input.token);
        
        if (!verified) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid or expired verification token"
          });
        }

        return { 
          success: true, 
          message: "Email verified successfully! You can now access your dashboard." 
        };
      }),

    // Resend verification email
    resendVerification: protectedProcedure
      .input(z.object({
        applicationId: z.number()
      }))
      .mutation(async ({ ctx, input }) => {
        // Get the application
        const application = await db.getLoanApplicationById(input.applicationId);
        
        if (!application) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Application not found"
          });
        }

        // Verify ownership
        if (application.userId !== ctx.user.id && ctx.user.role !== 'admin') {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have permission to resend verification for this application"
          });
        }

        // Check if already verified
        if (application.emailVerified === 1) {
          return {
            success: true,
            message: "Email is already verified"
          };
        }

        // Generate new verification token
        const verificationToken = await db.generateEmailVerificationToken(input.applicationId);
        const verificationLink = `http://localhost:5173/verify-email/${verificationToken}`;

        // Send verification email
        const emailTemplate = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #0033A0 0%, #0055CC 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #FFA500; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Verify Your Email Address</h1>
              </div>
              <div class="content">
                <p>Hello,</p>
                <p>Thank you for applying with <strong>AmeriLend</strong>! To complete your application and access your dashboard, please verify your email address.</p>
                <p style="text-align: center;">
                  <a href="${verificationLink}" class="button">Verify Email Address</a>
                </p>
                <p><small>Or copy and paste this link into your browser:</small><br>
                <a href="${verificationLink}">${verificationLink}</a></p>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <p>If you didn't create an account with AmeriLend, please ignore this email.</p>
              </div>
              <div class="footer">
                <p>© 2025 AmeriLend, LLC. All Rights Reserved.</p>
                <p>Questions? Call us at (945) 212-1609</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await sendEmail({
          to: application.email,
          subject: 'Verify Your Email - AmeriLend',
          html: emailTemplate
        });

        return {
          success: true,
          message: "Verification email sent! Please check your inbox."
        };
      }),

    // Submit a new loan application
    submit: protectedProcedure
      .use(createRateLimitMiddleware(RateLimits.LOAN_SUBMISSION))
      .use(sanitizeInputMiddleware())
      .input(z.object({
        fullName: z.string().min(1),
        middleInitial: z.string().length(1),
        email: z.string().email(),
        phone: z.string().min(7),
        dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/),
        idType: z.enum(["drivers_license", "passport", "state_id", "military_id"]),
        idNumber: z.string().min(5),
        maritalStatus: z.enum(["single", "married", "divorced", "widowed", "domestic_partnership"]),
        dependents: z.number().int().nonnegative(),
        citizenshipStatus: z.enum(["us_citizen", "permanent_resident"]),
        priorBankruptcy: z.number().int().min(0).max(1), // 0 = no, 1 = yes
        bankruptcyDate: z.string().optional(),
        street: z.string().min(1),
        city: z.string().min(1),
        state: z.string().length(2),
        zipCode: z.string().min(5),
        employmentStatus: z.enum(["employed", "self_employed", "unemployed", "retired"]),
        employer: z.string().optional(),
        monthlyIncome: z.number().int().positive(),
        loanType: z.enum(["personal", "installment", "short_term", "auto", "home_equity", "heloc", "student", "business", "debt_consolidation", "mortgage", "private_money", "title", "credit_builder", "signature", "peer_to_peer"]),
        requestedAmount: z.number().int().positive().max(10000000), // max $100,000 in cents
        loanPurpose: z.string().min(10, "Loan purpose must be at least 10 characters"),
        // Agreement and preference fields (client-side only, logged but not stored directly)
        preferredContact: z.enum(["email", "phone", "sms"]).optional().default("email"),
        creditCheckConsent: z.boolean(),
        termsConsent: z.boolean(),
        privacyConsent: z.boolean(),
        loanAgreementConsent: z.boolean(),
        esignConsent: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role === "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Administrators cannot submit loan applications."
          });
        }

        // Verify all agreements are accepted
        if (!input.creditCheckConsent || !input.termsConsent || !input.privacyConsent || 
            !input.loanAgreementConsent || !input.esignConsent) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "All agreements must be accepted"
          });
        }

        // Validate bankruptcy date if bankruptcy is true
        if (input.priorBankruptcy && !input.bankruptcyDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bankruptcy date is required"
          });
        }

        // ==========================================
        // FRAUD DETECTION & VALIDATION LAYER
        // ==========================================

        // 1. Check for SSN duplicates
        const existingSSN = await db.checkSSNDuplicate(input.ssn);
        if (existingSSN) {
          console.warn(`[FRAUD] Duplicate SSN attempt: ${input.ssn} (User ${ctx.user.id})`);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "An application with this Social Security Number is already being processed"
          });
        }

        // 2. Check for recent applications from same user
        const recentApps = await db.checkRecentApplications(ctx.user.id, 24);
        if (recentApps.length > 0) {
          console.warn(`[FRAUD] Multiple applications within 24h: User ${ctx.user.id} has ${recentApps.length} recent applications`);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You can only submit one application per 24 hours"
          });
        }

        // 3. Validate suspicious SSN patterns
        if (db.isSuspiciousSSN(input.ssn)) {
          console.warn(`[FRAUD] Suspicious SSN pattern: ${input.ssn} (User ${ctx.user.id})`);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "The Social Security Number provided is invalid"
          });
        }

        // 4. Validate phone number
        if (!db.isValidPhone(input.phone)) {
          console.warn(`[FRAUD] Invalid phone number: ${input.phone} (User ${ctx.user.id})`);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "The phone number provided is invalid"
          });
        }

        // 5. Check for disposable email
        if (db.isDisposableEmail(input.email)) {
          console.warn(`[FRAUD] Disposable email attempted: ${input.email} (User ${ctx.user.id})`);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Please use a valid, permanent email address"
          });
        }

        // 6. Calculate fraud score
        const fraudAnalysis = db.calculateFraudScore({
          ssn: input.ssn,
          dateOfBirth: input.dateOfBirth,
          monthlyIncome: input.monthlyIncome,
          requestedAmount: input.requestedAmount,
          loanPurpose: input.loanPurpose,
          priorBankruptcy: input.priorBankruptcy === 1, // Convert 0/1 to boolean
          bankruptcyDate: input.bankruptcyDate
        });

        // Log fraud score
        console.log(`[FRAUD_SCORE] User ${ctx.user.id}: Score ${fraudAnalysis.score}/100, Flags: ${fraudAnalysis.flags.join(", ")}`);

        // Auto-reject if fraud score > 80
        if (fraudAnalysis.score > 80) {
          console.error(`[FRAUD] Application rejected - high fraud score ${fraudAnalysis.score}: User ${ctx.user.id}`);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Your application could not be processed at this time"
          });
        }

        // Log the submission
        console.log(`[LoanApplication] User ${ctx.user.id} submitted application, preferred contact: ${input.preferredContact}, fraud_score: ${fraudAnalysis.score}`);

        // Create loan application (excluding agreement fields)
        const { preferredContact, creditCheckConsent, termsConsent, privacyConsent, loanAgreementConsent, esignConsent, ...loanData } = input;
        
        // Generate unique application reference number
        const applicationReferenceNumber = generateApplicationReferenceNumber();
        
        const result = await db.createLoanApplication({
          userId: ctx.user.id,
          applicationReferenceNumber,
          ...loanData,
        });

        // Send "application submitted" email
        try {
          const user = ctx.user;
          // The result from insert returns an object with lastInsertRowid or insertId depending on driver
          const applicationId = (result as any).insertId || (result as any)[0]?.id;
          
          if (user?.email) {
            // Send application confirmation email
            await sendLoanStatusEmailEnhanced({
              email: user.email,
              status: "submitted",
              loanId: applicationReferenceNumber,
              recipientName: user.name || "Applicant",
              loanAmount: input.requestedAmount,
              loanType: input.loanType,
            });
            console.log(`[Email] Sent "submitted" notification to ${user.email}`);
            
            // Generate email verification token and send verification email
            if (applicationId) {
              const verificationToken = await db.generateEmailVerificationToken(applicationId);
              const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}&applicationId=${applicationId}`;
              
              const emailHtml = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <h2 style="color: #2c3e50;">Verify Your Email</h2>
                  <p>Hi ${input.fullName},</p>
                  <p>Thank you for submitting your loan application! To proceed, please verify your email address by clicking the button below.</p>
                  
                  <div style="margin: 30px 0;">
                    <a href="${verificationLink}" style="background-color: #0033A0; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                      Verify Email Address
                    </a>
                  </div>
                  
                  <p>Or copy this link: <a href="${verificationLink}">${verificationLink}</a></p>
                  
                  <p style="color: #999; font-size: 12px; margin-top: 30px;">
                    This verification link will expire in 24 hours.
                  </p>
                </div>
              `;
              
              await sendEmail({
                to: user.email,
                subject: 'Verify Your Email - AmeriLend Loan Application',
                html: emailHtml,
              });
              console.log(`[Email] ✅ Email verification link sent to ${user.email}`);
            }
          }
        } catch (emailError) {
          console.error("[Email] Failed to send submission or verification email:", emailError);
          // Don't fail the application submission if email fails
        }

        // Send notification to all admins about new loan application
        try {
          const adminUsers = await db.getAdminUsers();
          console.log(`[Email] Notifying ${adminUsers.length} admin(s) about new application`);
          
          for (const admin of adminUsers) {
            if (admin.email) {
              await sendEmail({
                to: admin.email,
                subject: `New Loan Application - ${input.fullName}`,
                html: `
                  <!DOCTYPE html>
                  <html>
                  <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  </head>
                  <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
                    <table role="presentation" style="width: 100%; border-collapse: collapse;">
                      <tr>
                        <td align="center" style="padding: 40px 0;">
                          <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <tr>
                              <td style="padding: 40px 30px;">
                                <h1 style="color: #0033A0; margin: 0 0 20px 0; font-size: 24px;">New Loan Application Submitted</h1>
                                
                                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
                                  <h2 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">Application Details</h2>
                                  
                                  <table style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                      <td style="padding: 8px 0; color: #666666; font-size: 14px;">Reference Number:</td>
                                      <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: bold;">${applicationReferenceNumber}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0; color: #666666; font-size: 14px;">Applicant Name:</td>
                                      <td style="padding: 8px 0; color: #333333; font-size: 14px; font-weight: bold;">${input.fullName}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0; color: #666666; font-size: 14px;">Email:</td>
                                      <td style="padding: 8px 0; color: #333333; font-size: 14px;">${input.email}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0; color: #666666; font-size: 14px;">Phone:</td>
                                      <td style="padding: 8px 0; color: #333333; font-size: 14px;">${input.phone}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0; color: #666666; font-size: 14px;">Loan Type:</td>
                                      <td style="padding: 8px 0; color: #333333; font-size: 14px; text-transform: capitalize;">${input.loanType.replace(/_/g, ' ')}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0; color: #666666; font-size: 14px;">Requested Amount:</td>
                                      <td style="padding: 8px 0; color: #0033A0; font-size: 16px; font-weight: bold;">$${(input.requestedAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0; color: #666666; font-size: 14px;">Loan Purpose:</td>
                                      <td style="padding: 8px 0; color: #333333; font-size: 14px;">${input.loanPurpose}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0; color: #666666; font-size: 14px;">Monthly Income:</td>
                                      <td style="padding: 8px 0; color: #333333; font-size: 14px;">$${(input.monthlyIncome / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr>
                                      <td style="padding: 8px 0; color: #666666; font-size: 14px;">Employment Status:</td>
                                      <td style="padding: 8px 0; color: #333333; font-size: 14px; text-transform: capitalize;">${input.employmentStatus.replace(/_/g, ' ')}</td>
                                    </tr>
                                  </table>
                                </div>

                                <p style="color: #666666; font-size: 14px; line-height: 20px; margin: 20px 0;">
                                  This application requires your review and approval. Please login to the admin dashboard to review the complete application details and take appropriate action.
                                </p>

                                <table role="presentation" style="margin: 20px 0;">
                                  <tr>
                                    <td align="center" style="background-color: #0033A0; border-radius: 4px;">
                                      <a href="http://localhost:3001/dashboard" 
                                         style="display: inline-block; padding: 12px 24px; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: bold;">
                                        Review Application
                                      </a>
                                    </td>
                                  </tr>
                                </table>

                                <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
                                <p style="color: #999999; font-size: 11px; line-height: 16px; margin: 0;">
                                  AmeriLend Admin Notification<br>
                                  This is an automated message, please do not reply to this email.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </body>
                  </html>
                `,
                text: `
New Loan Application Submitted

Application Details:
- Reference Number: ${applicationReferenceNumber}
- Applicant Name: ${input.fullName}
- Email: ${input.email}
- Phone: ${input.phone}
- Loan Type: ${input.loanType.replace(/_/g, ' ')}
- Requested Amount: $${(input.requestedAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Loan Purpose: ${input.loanPurpose}
- Monthly Income: $${(input.monthlyIncome / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Employment Status: ${input.employmentStatus.replace(/_/g, ' ')}

Please login to the admin dashboard to review this application.
                `.trim()
              });
              console.log(`[Email] Sent new application notification to admin: ${admin.email}`);
            }
          }
        } catch (adminEmailError) {
          console.error("[Email] Failed to send admin notifications:", adminEmailError);
          // Don't fail the application submission if admin email fails
        }

        return { success: true, applicationReferenceNumber };
      }),

    // Get user's loan applications
    myApplications: protectedProcedure.query(async ({ ctx }) => {
      const applications = await db.getLoanApplicationsByUserId(ctx.user.id);
      
      // Convert numeric fields to strings to work around tRPC/SuperJSON serialization issues
      return applications.map(app => ({
        ...app,
        requestedAmount: String(Math.round(Number(app.requestedAmount || 0))),
        approvedAmount: app.approvedAmount ? String(Math.round(Number(app.approvedAmount))) : null,
        monthlyIncome: String(Math.round(Number(app.monthlyIncome || 0))),
        processingFeeAmount: app.processingFeeAmount ? String(Math.round(Number(app.processingFeeAmount))) : null,
        emailVerified: app.emailVerified || 0, // Include email verification status
      }));
    }),

    // Get user's documents for their applications
    myDocuments: protectedProcedure.query(async ({ ctx }) => {
      // Get all user's applications
      const applications = await db.getLoanApplicationsByUserId(ctx.user.id);
      
      // Get documents for all applications
      const allDocuments = [];
      for (const app of applications) {
        const docs = await db.getSubmittedDocumentsByApplicationId(app.id);
        allDocuments.push(...docs.map(doc => ({
          ...doc,
          applicationId: app.id,
          applicationReference: app.referenceNumber,
        })));
      }
      
      return allDocuments;
    }),

    // Get single loan application by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationById(input.id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }
        // Users can only view their own applications, admins can view all
        if (ctx.user.role !== "admin" && application.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        // Fetch documents for this application
        const documents = await db.getSubmittedDocumentsByApplicationId(application.id);
        return {
          ...application,
          documents
        };
      }),

    getByReference: protectedProcedure
      .input(z.object({ referenceNumber: z.string() }))
      .query(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationByReferenceNumber(input.referenceNumber);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }
        // Users can only view their own applications, admins can view all
        if (ctx.user.role !== "admin" && application.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        // Fetch documents for this application
        const documents = await db.getSubmittedDocumentsByApplicationId(application.id);
        return {
          ...application,
          documents
        };
      }),

    // Public: Track application by reference number (no login required)
    trackByReference: publicProcedure
      .input(z.object({ referenceNumber: z.string() }))
      .query(async ({ input }) => {
        const application = await db.getLoanApplicationByReferenceNumber(input.referenceNumber);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }
        // Return only non-sensitive fields for public tracking
        return {
          id: application.id,
          referenceNumber: application.referenceNumber,
          status: application.status,
          applicantName: application.applicantName || application.firstName + " " + application.lastName,
          loanAmount: application.loanAmount,
          appliedAt: application.createdAt,
          updatedAt: application.updatedAt,
          notes: application.notes,
        };
      }),

    // Test: Simple number serialization
    testNumbers: protectedProcedure.query(async () => {
      return {
        number1: 450000,
        number2: 1500000,
        number3: 500000,
      };
    }),

    // Admin: Get all loan applications WITH DOCUMENTS
    adminList: protectedProcedure.query(async ({ ctx }) => {
      console.log('[adminList] Called by user:', ctx.user.email, 'role:', ctx.user.role);
      if (ctx.user.role !== "admin") {
        console.log('[adminList] Access denied - not admin');
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      try {
        const applications = await db.getAllLoanApplications();
        console.log('[adminList] Got applications count:', applications.length);
        
        // Fetch documents for each application
        const applicationsWithDocs = await Promise.all(
          applications.map(async (app) => {
            const documents = await db.getSubmittedDocumentsByApplicationId(app.id);
            return {
              ...app,
              documents,
            };
          })
        );
        
        if (applicationsWithDocs.length > 0) {
          console.log('[adminList] First app with docs:', {
            id: applicationsWithDocs[0].id,
            fullName: applicationsWithDocs[0].fullName,
            documentCount: applicationsWithDocs[0].documents?.length || 0,
          });
        }
        
        // Convert all numeric fields to explicit integers and strings to work around serialization
        const result = applicationsWithDocs.map(app => ({
          ...app,
          requestedAmount: String(Math.round(Number(app.requestedAmount || 0))),
          approvedAmount: app.approvedAmount ? String(Math.round(Number(app.approvedAmount))) : null,
          monthlyIncome: String(Math.round(Number(app.monthlyIncome || 0))),
          processingFeeAmount: app.processingFeeAmount ? String(Math.round(Number(app.processingFeeAmount))) : null,
        }));
        
        console.log('[adminList] First app serialized:', {
          id: result[0]?.id,
          name: result[0]?.fullName,
          requested: result[0]?.requestedAmount,
          documentCount: result[0]?.documents?.length || 0,
        });
        
        return result;
      } catch (error) {
        console.error('[adminList] Error fetching applications:', error);
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: error instanceof Error ? error.message : "Failed to fetch applications" 
        });
      }
    }),

    // Admin: Approve loan application
    adminApprove: protectedProcedure
      .input(z.object({
        id: z.number(),
        approvedAmount: z.number().int().positive(),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const application = await db.getLoanApplicationById(input.id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Calculate processing fee
        const feeConfig = await db.getActiveFeeConfiguration();
        let processingFeeAmount: number;

        if (feeConfig?.calculationMode === "percentage") {
          // Percentage mode: basis points (200 = 2.00%)
          processingFeeAmount = Math.round((input.approvedAmount * feeConfig.percentageRate) / 10000);
        } else if (feeConfig?.calculationMode === "fixed") {
          // Fixed fee mode
          processingFeeAmount = feeConfig.fixedFeeAmount;
        } else {
          // Default to 2% if no config exists
          processingFeeAmount = Math.round((input.approvedAmount * 200) / 10000);
        }

        await db.updateLoanApplicationStatus(input.id, "approved", {
          approvedAmount: input.approvedAmount,
          processingFeeAmount,
          adminNotes: input.adminNotes,
          approvedAt: new Date(),
        });

        // Send "application approved" email
        try {
          const user = await db.getUserById(application.userId);
          if (user?.email) {
            await sendLoanStatusEmailEnhanced({
              email: user.email,
              status: "approved",
              loanId: String(application.id),
              recipientName: user.name || "Applicant",
              loanAmount: application.requestedAmount,
              approvalAmount: input.approvedAmount,
              additionalInfo: `You applied for $${(application.requestedAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}. Your approved amount is $${(input.approvedAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}. Please pay the processing fee of $${(processingFeeAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} to proceed.`,
            });
            console.log(`[Email] Sent "approved" notification to ${user.email}`);
          }
        } catch (emailError) {
          console.error("[Email] Failed to send approval notification:", emailError);
          // Don't fail the approval if email fails
        }

        return { success: true, processingFeeAmount };
      }),

    // Admin: Reject loan application
    adminReject: protectedProcedure
      .input(z.object({
        id: z.number(),
        rejectionReason: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const application = await db.getLoanApplicationById(input.id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        await db.updateLoanApplicationStatus(input.id, "rejected", {
          rejectionReason: input.rejectionReason,
        });

        // Send "application declined" email
        try {
          const user = await db.getUserById(application.userId);
          if (user?.email) {
            await sendLoanStatusEmailEnhanced({
              email: user.email,
              status: "declined",
              loanId: String(application.id),
              recipientName: user.name || "Applicant",
              declineReason: input.rejectionReason,
            });
            console.log(`[Email] Sent "declined" notification to ${user.email}`);
          }
        } catch (emailError) {
          console.error("[Email] Failed to send decline notification:", emailError);
          // Don't fail the rejection if email fails
        }

        return { success: true };
      }),

    // Admin: Request more information from applicant
    adminRequestInfo: protectedProcedure
      .input(z.object({
        id: z.number(),
        message: z.string().trim().min(10, "Please share the details you need from the applicant."),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const application = await db.getLoanApplicationById(input.id);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        const timestamp = new Date();
        const formattedNote = `[${timestamp.toLocaleString()}] Requested additional information: ${input.message}`;
        const updatedAdminNotes = application.adminNotes
          ? `${application.adminNotes.trim()}\n\n${formattedNote}`
          : formattedNote;

        await db.updateLoanApplicationStatus(input.id, "under_review", {
          adminNotes: updatedAdminNotes,
          rejectionReason: null,
        });

        try {
          const userRecord = await db.getUserById(application.userId);
          if (userRecord?.email) {
            await sendLoanStatusEmailEnhanced({
              email: userRecord.email,
              status: "more_info",
              loanId: application.applicationReferenceNumber ?? String(application.id),
              recipientName: userRecord.name || "Applicant",
              loanAmount: application.requestedAmount,
              loanType: application.loanType,
              additionalInfo: input.message,
            });
            console.log(`[Email] Sent "more_info" notification to ${userRecord.email}`);
          }
        } catch (emailError) {
          console.error("[Email] Failed to send request-more-info notification:", emailError);
        }

        return { success: true };
      }),
  }),

  // Fraud monitoring router (admin only)
  fraud: router({
    // Get flagged applications pending review
    getFlagged: protectedProcedure
      .input(z.object({
        minScore: z.number().int().min(0).max(100).optional().default(50),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return db.getFlaggedApplications(input.minScore);
      }),

    // Get fraud details for a specific application
    getDetails: protectedProcedure
      .input(z.object({ applicationId: z.number() }))
      .query(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        // Implementation will be added in db.ts
        return { message: "Fraud details endpoint" };
      }),

    // Approve flagged application (admin review override)
    approve: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        // Admin has reviewed and approved despite fraud flags
        console.log(`[FRAUD] Admin ${ctx.user.id} approved flagged application ${input.applicationId}`);
        return { success: true };
      }),

    // Reject flagged application
    reject: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        rejectionReason: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        // Admin has rejected due to fraud
        console.log(`[FRAUD] Admin ${ctx.user.id} rejected flagged application ${input.applicationId}`);
        await db.updateLoanApplicationStatus(input.applicationId, "rejected", {
          rejectionReason: input.rejectionReason,
        });
        return { success: true };
      }),
  }),

  // Fee configuration router (admin only)
  feeConfig: router({
    // Get active fee configuration
    getActive: publicProcedure.query(async () => {
      const config = await db.getActiveFeeConfiguration();
      if (!config) {
        // Return default configuration
        return {
          calculationMode: "percentage" as const,
          percentageRate: 200, // 2.00%
          fixedFeeAmount: 575, // $5.75
        };
      }
      return config;
    }),

    // Admin: Update fee configuration
    adminUpdate: protectedProcedure
      .input(z.object({
        calculationMode: z.enum(["percentage", "fixed"]),
        percentageRate: z.number().int().min(150).max(1000).optional(), // 1.5% - 10%
        fixedFeeAmount: z.number().int().min(150).max(1000).optional(), // $1.50 - $10.00
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Validate that the appropriate field is provided
        if (input.calculationMode === "percentage" && !input.percentageRate) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Percentage rate is required for percentage mode" 
          });
        }
        if (input.calculationMode === "fixed" && !input.fixedFeeAmount) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Fixed fee amount is required for fixed mode" 
          });
        }

        await db.createFeeConfiguration({
          calculationMode: input.calculationMode,
          percentageRate: input.percentageRate || 200,
          fixedFeeAmount: input.fixedFeeAmount || 575,
          updatedBy: ctx.user.id,
        });

        return { success: true };
      }),
  }),

  // Payment router
  payments: router({
    // Get Authorize.net Accept.js configuration
    getAuthorizeNetConfig: publicProcedure.query(() => {
      return getAcceptJsConfig();
    }),

    // Process initial processing fee payment (for pending applications)
    processProcessingFee: protectedProcedure
      .input(z.object({
        applicationId: z.string(), // Application reference number
        amount: z.number(), // Amount in dollars (e.g., 202.50)
        cardNumber: z.string(),
        cardholderName: z.string(),
        expiryMonth: z.string(),
        expiryYear: z.string(),
        cvv: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationByReferenceNumber(input.applicationId);
        
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Loan application not found" });
        }
        
        if (application.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        
        // Accept pending, approved, or fee_pending status
        if (!["pending", "approved", "fee_pending"].includes(application.status)) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Processing fee already paid or application not in correct status" 
          });
        }

        // Calculate processing fee based on processingFeeAmount if set, otherwise 4.5% of requested amount
        const processingFeeCents = application.processingFeeAmount || Math.round(application.requestedAmount * 0.045);
        const processingFeeDollars = processingFeeCents / 100;

        // Verify amount matches (allow $0.01 rounding difference)
        if (Math.abs(input.amount - processingFeeDollars) > 0.01) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: `Payment amount does not match processing fee. Expected $${processingFeeDollars.toFixed(2)}, got $${input.amount.toFixed(2)}`
          });
        }

        // Process payment with Authorize.net or test mode
        let paymentSuccess = false;
        let transactionId = "";
        let authCode = "";
        let errorMessage = "";

        // Import payment handlers
        const { isTestModeEnabled, markAsTestPayment, processTestPayment } = await import("./_core/test-payment");
        const { createAuthorizeNetTransaction } = await import("./_core/authorizenet");

        if (isTestModeEnabled()) {
          // Use test mode payment
          const testResult = await processTestPayment({
            amount: processingFeeCents,
            currency: "USD",
            paymentProvider: "authorizenet",
            paymentMethod: "card",
            loanApplicationId: application.id,
            userId: ctx.user.id,
          });
          paymentSuccess = testResult.success;
          transactionId = testResult.paymentIntentId;
          console.log("[TEST MODE] Authorize.Net payment:", testResult.message);
        } else {
          // Process actual Authorize.Net payment
          const opaqueData = {
            dataDescriptor: input.dataDescriptor || "COMMON.ACCEPT.INAPP.PAYMENT",
            dataValue: input.dataValue || "",
          };

          const authResult = await createAuthorizeNetTransaction(
            processingFeeCents,
            opaqueData,
            `Loan processing fee for application ${application.referenceNumber}`
          );

          paymentSuccess = authResult.success;
          transactionId = authResult.transactionId || `TX${Date.now()}`;
          authCode = authResult.authCode || "";

          if (!paymentSuccess) {
            errorMessage = authResult.error || "Payment processing failed";
          }
        }

        if (!paymentSuccess) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: errorMessage || "Payment processing failed" 
          });
        }

        // Create payment record (store in cents)
        const paymentRecord = await db.createPayment({
          loanApplicationId: application.id,
          userId: ctx.user.id,
          amount: processingFeeCents, // Store in cents
          currency: "USD",
          paymentProvider: "authorizenet",
          paymentMethod: "card",
          status: "succeeded",
          paymentIntentId: transactionId,
          cardLast4: input.cardNumber?.slice(-4),
          completedAt: new Date(),
          isTestMode: isTestModeEnabled() ? 1 : 0,
        });

        // Update loan status to fee_paid (processing fee successfully paid)
        await db.updateLoanApplicationStatus(application.id, "fee_paid", {
          processingFeeAmount: processingFeeCents,
        });

        // Send payment receipt email with PDF
        await sendPaymentReceipt(paymentRecord, application, application.email, application.fullName);

        return { 
          success: true,
          paymentId: paymentRecord.id,
          transactionId: transactionId,
        };
      }),

    // Process crypto payment for processing fee
    processCryptoPayment: protectedProcedure
      .use(createRateLimitMiddleware(RateLimits.PAYMENT))
      .input(z.object({
        applicationId: z.string(), // Application reference number
        amount: z.number(),
        cryptoCurrency: z.string(),
        transactionHash: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationByReferenceNumber(input.applicationId);
        
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Loan application not found" });
        }
        
        if (application.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        
        // Accept pending, approved, or fee_pending status
        if (!["pending", "approved", "fee_pending"].includes(application.status)) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Processing fee already paid or application not in correct status"
          });
        }

        // Calculate processing fee based on processingFeeAmount if set, otherwise 4.5% of requested amount
        const processingFeeCents = application.processingFeeAmount || Math.round(application.requestedAmount * 0.045);
        const processingFeeDollars = processingFeeCents / 100;

        // Verify crypto transaction on blockchain
        const { verifyCryptoTransaction } = await import("./_core/crypto-verification");
        const { isTestModeEnabled, processTestPayment } = await import("./_core/test-payment");
        
        let paymentSuccess = false;
        let verificationMessage = "";
        let confirmations = 0;

        if (isTestModeEnabled()) {
          // Use test mode for crypto
          const testResult = await processTestPayment({
            amount: processingFeeCents,
            currency: "USD",
            paymentProvider: "crypto",
            paymentMethod: "crypto",
            loanApplicationId: application.id,
            userId: ctx.user.id,
          });
          paymentSuccess = testResult.success;
          verificationMessage = "[TEST MODE] " + testResult.message;
          console.log(verificationMessage);
        } else {
          // Verify actual crypto transaction
          const { getMyWalletAddress } = await import("./_core/crypto-config");
          const walletAddress = await getMyWalletAddress(input.cryptoCurrency as any);
          
          const verificationResult = await verifyCryptoTransaction(
            input.transactionHash,
            input.cryptoCurrency,
            processingFeeDollars,
            walletAddress
          );

          paymentSuccess = verificationResult.verified;
          confirmations = verificationResult.confirmations;
          verificationMessage = verificationResult.message;

          if (!paymentSuccess) {
            console.warn(`[CRYPTO] Verification failed: ${verificationResult.error}`);
          }
        }

        if (!paymentSuccess) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Crypto payment verification failed. " + verificationMessage
          });
        }

        // Create payment record (store in cents)
        const paymentRecord = await db.createPayment({
          loanApplicationId: application.id,
          userId: ctx.user.id,
          amount: processingFeeCents,
          currency: "USD",
          paymentProvider: "crypto",
          paymentMethod: "crypto" as const,
          status: "succeeded",
          paymentIntentId: input.transactionHash,
          cryptoCurrency: input.cryptoCurrency,
          cryptoTxHash: input.transactionHash,
          completedAt: new Date(),
          isTestMode: isTestModeEnabled() ? 1 : 0,
        });

        // Update loan status to fee_paid (processing fee successfully paid)
        await db.updateLoanApplicationStatus(application.id, "fee_paid", {
          processingFeeAmount: processingFeeCents,
        });

        // Send payment receipt email with PDF
        await sendPaymentReceipt(paymentRecord, application, application.email, application.fullName);

        return { 
          success: true,
          paymentId: paymentRecord.id,
        };
      }),

    // Process card payment via Authorize.net
    processCardPayment: protectedProcedure
      .use(createRateLimitMiddleware(RateLimits.PAYMENT))
      .input(z.object({
        loanApplicationId: z.number(),
        opaqueData: z.object({
          dataDescriptor: z.string(),
          dataValue: z.string(),
        }),
      }))
      .mutation(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationById(input.loanApplicationId);
        
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Loan application not found" });
        }
        
        if (application.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        
        if (application.status !== "approved" && application.status !== "fee_pending") {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Loan must be approved before payment" 
          });
        }
        
        if (!application.processingFeeAmount) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Processing fee not calculated" 
          });
        }

        // Process payment with Authorize.net
        const result = await createAuthorizeNetTransaction(
          application.processingFeeAmount,
          input.opaqueData,
          `Processing fee for loan application #${input.loanApplicationId}`
        );

        if (!result.success) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: result.error || "Payment processing failed" 
          });
        }

        // Create payment record
        const paymentRecord = await db.createPayment({
          loanApplicationId: input.loanApplicationId,
          userId: ctx.user.id,
          amount: application.processingFeeAmount,
          currency: "USD",
          paymentProvider: "authorizenet",
          paymentMethod: "card",
          status: "succeeded",
          paymentIntentId: result.transactionId,
          cardLast4: result.cardLast4,
          cardBrand: result.cardBrand,
          completedAt: new Date(),
        });

        // Update loan status to fee_paid
        await db.updateLoanApplicationStatus(input.loanApplicationId, "fee_paid");

        // Send payment receipt email with PDF
        await sendPaymentReceipt(paymentRecord, application, application.email, application.fullName);

        return { 
          success: true,
          paymentId: paymentRecord.id,
          transactionId: result.transactionId,
          authCode: result.authCode,
        };
      }),

    // Get Stripe publishable key
    getStripeConfig: publicProcedure.query(() => {
      return {
        publishableKey: getStripePublishableKey(),
      };
    }),

    // Process card payment via Stripe
    processStripePayment: protectedProcedure
      .use(createRateLimitMiddleware(RateLimits.PAYMENT))
      .input(z.object({
        loanApplicationId: z.number(),
        paymentIntentId: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationById(input.loanApplicationId);
        
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Loan application not found" });
        }
        
        if (application.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Not authorized" });
        }
        
        if (application.status !== "approved" && application.status !== "fee_pending") {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Loan must be approved before payment" 
          });
        }
        
        if (!application.processingFeeAmount) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Processing fee not calculated" 
          });
        }

        // Create payment record
        const paymentRecord = await db.createPayment({
          loanApplicationId: input.loanApplicationId,
          userId: ctx.user.id,
          amount: application.processingFeeAmount,
          currency: "USD",
          paymentProvider: "stripe",
          paymentMethod: "card",
          status: "succeeded",
          paymentIntentId: input.paymentIntentId,
          cardLast4: "4242", // Would be extracted from Stripe in production
          cardBrand: "visa",
          completedAt: new Date(),
        });

        // Update loan status to fee_paid
        await db.updateLoanApplicationStatus(input.loanApplicationId, "fee_paid");

        // Send payment receipt email with PDF
        await sendPaymentReceipt(paymentRecord, application, application.email, application.fullName);

        return { 
          success: true,
          paymentId: paymentRecord.id,
          paymentIntentId: input.paymentIntentId,
        };
      }),

    // Get supported cryptocurrencies with rates
    getSupportedCryptos: publicProcedure.query(async () => {
      return getSupportedCryptos();
    }),

    // Convert USD amount to crypto
    convertToCrypto: publicProcedure
      .input(z.object({
        usdCents: z.number(),
        currency: z.enum(["BTC", "ETH", "USDT", "USDC"]),
      }))
      .query(async ({ input }) => {
        const amount = await convertUSDToCrypto(input.usdCents, input.currency);
        return { amount };
      }),
    // Create payment intent for processing fee (supports multiple payment methods)
    createIntent: protectedProcedure
      .input(z.object({
        loanApplicationId: z.number(),
        paymentMethod: z.enum(["card", "crypto"]).default("card"),
        paymentProvider: z.enum(["stripe", "authorizenet", "crypto"]).optional(),
        cryptoCurrency: z.enum(["BTC", "ETH", "USDT", "USDC"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationById(input.loanApplicationId);
        
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        if (application.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        
        if (application.status !== "approved") {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Loan must be approved before payment" 
          });
        }
        
        if (!application.processingFeeAmount) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Processing fee not calculated" 
          });
        }

        // Determine payment provider
        const paymentProvider = input.paymentProvider || 
          (input.paymentMethod === "crypto" ? "crypto" : "stripe");

        // For crypto payments, create charge and get payment address
        let cryptoData;
        if (input.paymentMethod === "crypto" && input.cryptoCurrency) {
          const charge = await createCryptoCharge(
            application.processingFeeAmount,
            input.cryptoCurrency,
            `Processing fee for loan #${input.loanApplicationId}`,
            { loanApplicationId: input.loanApplicationId, userId: ctx.user.id }
          );

          if (!charge.success) {
            throw new TRPCError({ 
              code: "INTERNAL_SERVER_ERROR", 
              message: charge.error || "Failed to create crypto payment" 
            });
          }

          cryptoData = {
            cryptoCurrency: input.cryptoCurrency,
            cryptoAddress: charge.paymentAddress,
            cryptoAmount: charge.cryptoAmount,
            paymentIntentId: charge.chargeId,
          };
        }

        // Create payment record
        await db.createPayment({
          loanApplicationId: input.loanApplicationId,
          userId: ctx.user.id,
          amount: application.processingFeeAmount,
          currency: "USD",
          paymentProvider,
          paymentMethod: input.paymentMethod,
          status: "pending",
          ...cryptoData,
        });

        // Update loan status to fee_pending
        await db.updateLoanApplicationStatus(input.loanApplicationId, "fee_pending");

        return { 
          success: true, 
          amount: application.processingFeeAmount,
          ...cryptoData,
        };
      }),

    // Simulate payment confirmation (in production, this would be a webhook)
    confirmPayment: protectedProcedure
      .input(z.object({
        paymentId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const payment = await db.getPaymentById(input.paymentId);
        
        if (!payment) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        if (payment.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Update payment status
        await db.updatePaymentStatus(input.paymentId, "succeeded", {
          completedAt: new Date(),
        });

        // Update loan application status to fee_paid
        await db.updateLoanApplicationStatus(payment.loanApplicationId, "fee_paid");

        return { success: true };
      }),

    // Get payments for a loan application
    getByLoanId: protectedProcedure
      .input(z.object({ loanApplicationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationById(input.loanApplicationId);
        
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        if (application.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.getPaymentsByLoanApplicationId(input.loanApplicationId);
      }),

    // Get user's own payment history
    myPayments: protectedProcedure.query(async ({ ctx }) => {
      try {
        const payments = await db.getPaymentsByUserId(ctx.user.id);
        // Also get loan application details for each payment
        const paymentsWithLoans = await Promise.all(
          payments.map(async (payment: any) => {
            const loan = await db.getLoanApplicationById(payment.loanApplicationId);
            return {
              ...payment,
              loanDetails: loan ? {
                id: loan.id,
                loanType: loan.loanType,
                requestedAmount: loan.requestedAmount,
                approvedAmount: loan.approvedAmount,
                applicationReferenceNumber: loan.applicationReferenceNumber,
              } : null,
            };
          })
        );
        return paymentsWithLoans;
      } catch (error) {
        console.error('[Payments] My payments error:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch payment history"
        });
      }
    }),

    // Admin: List all payments
    list: adminProcedure.query(async () => {
      try {
        const payments = await db.getAllPayments();
        return payments;
      } catch (error) {
        console.error('[Payments] List error:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch payments"
        });
      }
    }),
  }),

  // Disbursement router (admin only)
  disbursements: router({
    // User: Request loan disbursement with method selection
    initiate: protectedProcedure
      .input(z.object({
        loanApplicationId: z.number(),
        
        // Disbursement method
        disbursementMethod: z.enum(["ach", "wire", "check", "paycard"]).default("ach"),
        
        // Bank details (for ACH and Wire)
        accountHolderName: z.string().min(1, "Account holder name is required").optional().or(z.literal("")),
        accountNumber: z.string().min(1, "Account number is required").optional().or(z.literal("")),
        routingNumber: z.string().min(1, "Routing number is required").optional().or(z.literal("")),
        accountType: z.enum(["checking", "savings"]).optional(),
        swiftCode: z.string().optional(),
        bankName: z.string().optional(),
        
        // Check details
        checkMailingAddress: z.string().min(1, "Mailing address is required").optional().or(z.literal("")),
        checkPayeeName: z.string().min(1, "Payee name is required").optional().or(z.literal("")),
      }))
      .mutation(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationById(input.loanApplicationId);
        
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // Verify user owns this application
        if (application.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // CRITICAL: Validate that processing fee has been paid
        if (application.status !== "fee_paid") {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Processing fee must be paid before disbursement" 
          });
        }

        // CRITICAL: Verify that processing fee amount exists
        if (!application.processingFeeAmount || application.processingFeeAmount <= 0) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Invalid processing fee amount" 
          });
        }

        // CRITICAL: Verify that a successful payment record exists
        const payments = await db.getPaymentsByLoanApplicationId(input.loanApplicationId);
        const successfulPayment = payments.find(p => 
          p.status === "succeeded" && 
          p.amount === application.processingFeeAmount
        );

        if (!successfulPayment) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "No successful payment record found for processing fee. Payment must be completed before disbursement." 
          });
        }

        // Verify payment was completed before attempting disbursement
        if (!successfulPayment.completedAt) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Payment completion date not recorded" 
          });
        }

        // Check if disbursement already exists
        const existingDisbursement = await db.getDisbursementByLoanApplicationId(input.loanApplicationId);
        if (existingDisbursement) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Disbursement already initiated for this loan" 
          });
        }

        // Validate disbursement method-specific required fields
        if (input.disbursementMethod === "ach" || input.disbursementMethod === "wire") {
          if (!input.accountHolderName?.trim() || !input.accountNumber?.trim() || !input.routingNumber?.trim()) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `${input.disbursementMethod.toUpperCase()} requires account holder name, account number, and routing number`
            });
          }
        } else if (input.disbursementMethod === "check") {
          if (!input.checkMailingAddress?.trim() || !input.checkPayeeName?.trim()) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Check disbursement requires mailing address and payee name"
            });
          }
        }

        // Calculate estimated delivery date based on method
        const today = new Date();
        let estimatedDeliveryDate = new Date(today);
        
        switch (input.disbursementMethod) {
          case "ach":
            estimatedDeliveryDate.setDate(today.getDate() + 2); // 1-3 days
            break;
          case "wire":
            estimatedDeliveryDate.setDate(today.getDate() + 1); // 1 day
            break;
          case "check":
            estimatedDeliveryDate.setDate(today.getDate() + 7); // 5-7 days
            break;
          case "paycard":
            estimatedDeliveryDate.setDate(today.getDate() + 1); // 1-2 days
            break;
        }

        // Generate reference number
        const referenceNumber = `DISB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create disbursement record
        await db.createDisbursement({
          loanApplicationId: input.loanApplicationId,
          userId: ctx.user.id,
          amount: application.approvedAmount!,
          
          // Method
          disbursementMethod: input.disbursementMethod,
          
          // Bank details
          accountHolderName: input.accountHolderName || null,
          accountNumber: input.accountNumber || null,
          routingNumber: input.routingNumber || null,
          accountType: input.accountType || null,
          swiftCode: input.swiftCode || null,
          bankName: input.bankName || null,
          
          // Check details
          checkMailingAddress: input.checkMailingAddress || null,
          checkPayeeName: input.checkPayeeName || null,
          checkMailedDate: input.disbursementMethod === "check" ? new Date() : null,
          
          // Tracking
          estimatedDeliveryDate: estimatedDeliveryDate,
          referenceNumber,
          
          status: "pending",
          initiatedBy: ctx.user.id,
        });

        // Update loan status to disbursed
        await db.updateLoanApplicationStatus(input.loanApplicationId, "disbursed", {
          disbursedAt: new Date(),
        });

        return { 
          success: true,
          disbursementMethod: input.disbursementMethod,
          estimatedDeliveryDate,
          referenceNumber,
          paymentId: successfulPayment.id,
          paymentCompletedAt: successfulPayment.completedAt,
        };
      }),

    // Admin: Initiate loan disbursement with method selection
    adminInitiate: protectedProcedure
      .input(z.object({
        loanApplicationId: z.number(),
        
        // Disbursement method
        disbursementMethod: z.enum(["ach", "wire", "check", "paycard"]).default("ach"),
        
        // Bank details (for ACH and Wire)
        accountHolderName: z.string().min(1, "Account holder name is required").optional().or(z.literal("")),
        accountNumber: z.string().min(1, "Account number is required").optional().or(z.literal("")),
        routingNumber: z.string().min(1, "Routing number is required").optional().or(z.literal("")),
        accountType: z.enum(["checking", "savings"]).optional(),
        swiftCode: z.string().optional(),
        bankName: z.string().optional(),
        
        // Check details
        checkMailingAddress: z.string().min(1, "Mailing address is required").optional().or(z.literal("")),
        checkPayeeName: z.string().min(1, "Payee name is required").optional().or(z.literal("")),
        
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        const application = await db.getLoanApplicationById(input.loanApplicationId);
        
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }

        // CRITICAL: Validate that processing fee has been paid
        if (application.status !== "fee_paid") {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Processing fee must be paid before disbursement" 
          });
        }

        // CRITICAL: Verify that processing fee amount exists
        if (!application.processingFeeAmount || application.processingFeeAmount <= 0) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Invalid processing fee amount" 
          });
        }

        // CRITICAL: Verify that a successful payment record exists
        const payments = await db.getPaymentsByLoanApplicationId(input.loanApplicationId);
        const successfulPayment = payments.find(p => 
          p.status === "succeeded" && 
          p.amount === application.processingFeeAmount
        );

        if (!successfulPayment) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "No successful payment record found for processing fee. Payment must be completed before disbursement." 
          });
        }

        // Verify payment was completed before attempting disbursement
        if (!successfulPayment.completedAt) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Payment completion date not recorded" 
          });
        }

        // Check if disbursement already exists
        const existingDisbursement = await db.getDisbursementByLoanApplicationId(input.loanApplicationId);
        if (existingDisbursement) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Disbursement already initiated for this loan" 
          });
        }

        // Validate disbursement method-specific required fields
        if (input.disbursementMethod === "ach" || input.disbursementMethod === "wire") {
          if (!input.accountHolderName?.trim() || !input.accountNumber?.trim() || !input.routingNumber?.trim()) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `${input.disbursementMethod.toUpperCase()} requires account holder name, account number, and routing number`
            });
          }
        } else if (input.disbursementMethod === "check") {
          if (!input.checkMailingAddress?.trim() || !input.checkPayeeName?.trim()) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Check disbursement requires mailing address and payee name"
            });
          }
        }

        // Get default bank account for disbursement
        const database = await getDb();
        
        if (!database) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection unavailable"
          });
        }
        
        // TypeScript doesn't narrow the type properly, so we assert non-null
        const db2 = database!;
        
        const bankAccounts = await db2
          .select()
          .from(await import("../drizzle/schema").then(m => m.adminBankAccounts))
          .where(eq((await import("../drizzle/schema").then(m => m.adminBankAccounts)).isDefault, 1))
          .limit(1);

        if (!bankAccounts || bankAccounts.length === 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "No default bank account configured. Please contact administrator."
          });
        }

        const bankAccount = bankAccounts[0];
        const disbursementAmount = application.approvedAmount!;

        // Check if sufficient funds available
        if (bankAccount.availableBalance < disbursementAmount) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `Insufficient funds in bank account. Available: $${(bankAccount.availableBalance / 100).toFixed(2)}, Required: $${(disbursementAmount / 100).toFixed(2)}`
          });
        }

        // Calculate estimated delivery date based on method
        const today = new Date();
        let estimatedDeliveryDate = new Date(today);
        
        switch (input.disbursementMethod) {
          case "ach":
            estimatedDeliveryDate.setDate(today.getDate() + 2); // 1-3 days
            break;
          case "wire":
            estimatedDeliveryDate.setDate(today.getDate() + 1); // 1 day
            break;
          case "check":
            estimatedDeliveryDate.setDate(today.getDate() + 7); // 5-7 days
            break;
          case "paycard":
            estimatedDeliveryDate.setDate(today.getDate() + 1); // 1-2 days
            break;
        }

        // Generate tracking number (unique identifier for user)
        const trackingNumber = `TRK-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        
        // Generate reference number (internal)
        const referenceNumber = `DISB-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        // Create disbursement record with new fields
        const disbursementId = await db.createDisbursement({
          loanApplicationId: input.loanApplicationId,
          userId: application.userId,
          amount: disbursementAmount,
          
          // Method
          disbursementMethod: input.disbursementMethod,
          
          // Bank details
          accountHolderName: input.accountHolderName || null,
          accountNumber: input.accountNumber || null,
          routingNumber: input.routingNumber || null,
          accountType: input.accountType || null,
          swiftCode: input.swiftCode || null,
          bankName: input.bankName || null,
          
          // Check details
          checkMailingAddress: input.checkMailingAddress || null,
          checkPayeeName: input.checkPayeeName || null,
          checkMailedDate: input.disbursementMethod === "check" ? new Date() : null,
          
          // Tracking
          estimatedDeliveryDate: estimatedDeliveryDate,
          trackingNumber,
          referenceNumber,
          
          status: "pending",
          adminNotes: input.adminNotes,
          initiatedBy: ctx.user.id,
        });

        // Deduct from bank account and create transaction record
        const newBalance = bankAccount.currentBalance - disbursementAmount;
        const newAvailableBalance = bankAccount.availableBalance - disbursementAmount;

        await db2.insert(await import("../drizzle/schema").then(m => m.adminBankTransactions)).values({
          accountId: bankAccount.id,
          type: "disbursement",
          amount: -disbursementAmount, // Negative for withdrawal
          balanceBefore: bankAccount.currentBalance,
          balanceAfter: newBalance,
          loanApplicationId: input.loanApplicationId,
          disbursementId: Number(disbursementId),
          description: `Loan disbursement to ${application.fullName} - ${trackingNumber}`,
          referenceNumber: referenceNumber,
          performedBy: ctx.user.id,
        });

        // Update bank account balance
        await db2
          .update(await import("../drizzle/schema").then(m => m.adminBankAccounts))
          .set({
            currentBalance: newBalance,
            availableBalance: newAvailableBalance,
          })
          .where(eq((await import("../drizzle/schema").then(m => m.adminBankAccounts)).id, bankAccount.id));

        // Update loan status to disbursed
        await db.updateLoanApplicationStatus(input.loanApplicationId, "disbursed", {
          disbursedAt: new Date(),
        });

        // Send notification email to user with tracking number
        const userEmail = application.email;
        if (userEmail) {
          await sendEmail({
            to: userEmail,
            subject: "Your Loan Has Been Disbursed!",
            html: `
              <h2>Congratulations! Your loan has been disbursed.</h2>
              <p>Dear ${application.fullName.split(' ')[0]},</p>
              <p>Your loan of <strong>$${(disbursementAmount / 100).toFixed(2)}</strong> has been successfully disbursed via ${input.disbursementMethod.toUpperCase()}.</p>
              <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
              <p><strong>Reference Number:</strong> ${referenceNumber}</p>
              <p><strong>Estimated Delivery:</strong> ${estimatedDeliveryDate.toLocaleDateString()}</p>
              <p>You can use your tracking number to check the status of your disbursement at any time.</p>
              <p>Thank you for choosing our service!</p>
            `,
          });
        }

        return { 
          success: true,
          disbursementMethod: input.disbursementMethod,
          estimatedDeliveryDate,
          referenceNumber,
          trackingNumber, // Give user their tracking number
          paymentId: successfulPayment.id,
          paymentCompletedAt: successfulPayment.completedAt,
        };
      }),

    // Get disbursement by loan application ID
    getByLoanId: protectedProcedure
      .input(z.object({ loanApplicationId: z.number() }))
      .query(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationById(input.loanApplicationId);
        
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        if (application.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        return db.getDisbursementByLoanApplicationId(input.loanApplicationId);
      }),
  }),

  // Legal documents router
  legal: router({
    // Record legal document acceptance
    acceptDocument: protectedProcedure
      .input(z.object({
        documentType: z.enum(["terms_of_service", "privacy_policy", "loan_agreement", "esign_consent"]),
        documentVersion: z.string(),
        loanApplicationId: z.number().optional(),
        ipAddress: z.string().optional(),
        userAgent: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");

        await database.insert(legalAcceptances).values({
          userId: ctx.user.id,
          loanApplicationId: input.loanApplicationId,
          documentType: input.documentType,
          documentVersion: input.documentVersion,
          ipAddress: input.ipAddress,
          userAgent: input.userAgent,
        });

        return { success: true };
      }),

    // Check if user has accepted a specific document
    hasAccepted: protectedProcedure
      .input(z.object({
        documentType: z.enum(["terms_of_service", "privacy_policy", "loan_agreement", "esign_consent"]),
        loanApplicationId: z.number().optional(),
      }))
      .query(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) return false;

        const conditions = [
          eq(legalAcceptances.userId, ctx.user.id),
          eq(legalAcceptances.documentType, input.documentType),
        ];

        if (input.loanApplicationId) {
          conditions.push(eq(legalAcceptances.loanApplicationId, input.loanApplicationId));
        }

        const result = await database
          .select()
          .from(legalAcceptances)
          .where(and(...conditions))
          .limit(1);

        return result.length > 0;
      }),

    // Get all acceptances for current user
    getMyAcceptances: protectedProcedure
      .query(async ({ ctx }) => {
        const database = await getDb();
        if (!database) return [];

        return await database
          .select()
          .from(legalAcceptances)
          .where(eq(legalAcceptances.userId, ctx.user.id));
      }),
  }),

  // User profile router
  users: router({
    // Get current user profile
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user;
    }),

    // Update user profile
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(1).optional(),
        phone: z.string().optional(),
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().length(2).optional(),
        zipCode: z.string().optional(),
        // NEW FIELDS: Allow empty strings and optional validation
        middleInitial: z.string().max(1).optional().or(z.literal("")),
        dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
        ssn: z.string().regex(/^\d{3}-\d{2}-\d{4}$/).optional().or(z.literal("")),
        idType: z.enum(["drivers_license", "passport", "state_id", "military_id"]).optional().or(z.literal("")),
        idNumber: z.string().optional(),
        maritalStatus: z.enum(["single", "married", "divorced", "widowed", "domestic_partnership"]).optional().or(z.literal("")),
        dependents: z.number().int().min(0).optional(),
        citizenshipStatus: z.enum(["us_citizen", "permanent_resident"]).optional().or(z.literal("")),
        employmentStatus: z.enum(["employed", "self_employed", "unemployed", "retired"]).optional().or(z.literal("")),
        employer: z.string().optional(),
        monthlyIncome: z.number().int().min(0).optional(),
        priorBankruptcy: z.number().int().min(0).max(1).optional(),
        bankruptcyDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Update user profile in database
          await db.updateUser(ctx.user.id, {
            name: input.name || ctx.user.name || undefined,
            phone: input.phone || ctx.user.phone || undefined,
            street: input.street || ctx.user.street || undefined,
            city: input.city || ctx.user.city || undefined,
            state: input.state || ctx.user.state || undefined,
            zipCode: input.zipCode || ctx.user.zipCode || undefined,
            // NEW FIELDS:
            middleInitial: input.middleInitial || ctx.user.middleInitial || undefined,
            dateOfBirth: input.dateOfBirth || ctx.user.dateOfBirth || undefined,
            ssn: input.ssn || ctx.user.ssn || undefined,
            idType: input.idType || ctx.user.idType || undefined,
            idNumber: input.idNumber || ctx.user.idNumber || undefined,
            maritalStatus: input.maritalStatus || ctx.user.maritalStatus || undefined,
            dependents: input.dependents !== undefined ? input.dependents : (ctx.user.dependents || 0),
            citizenshipStatus: input.citizenshipStatus || ctx.user.citizenshipStatus || undefined,
            employmentStatus: input.employmentStatus || ctx.user.employmentStatus || undefined,
            employer: input.employer || ctx.user.employer || undefined,
            monthlyIncome: input.monthlyIncome !== undefined ? input.monthlyIncome : (ctx.user.monthlyIncome || 0),
            priorBankruptcy: input.priorBankruptcy !== undefined ? input.priorBankruptcy : (ctx.user.priorBankruptcy || 0),
            bankruptcyDate: input.bankruptcyDate || ctx.user.bankruptcyDate || undefined,
          });

          return { success: true };
        } catch (error) {
          console.error('[User] Profile update error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update profile"
          });
        }
      }),

    // Get user statistics
    getStats: protectedProcedure.query(async ({ ctx }) => {
      try {
        const stats = await db.getUserStats(ctx.user.id);
        return stats;
      } catch (error) {
        console.error('[User] Stats error:', error);
        return {
          totalApplications: 0,
          approvedLoans: 0,
          pendingApplications: 0,
          totalLoaned: 0,
        };
      }
    }),

    // Get user's recent activity
    getActivity: protectedProcedure
      .input(z.object({
        limit: z.number().int().min(1).max(50).optional().default(10),
      }))
      .query(async ({ ctx, input }) => {
        try {
          return await db.getUserActivity(ctx.user.id, input.limit);
        } catch (error) {
          console.error('[User] Activity error:', error);
          return [];
        }
      }),

    // Update notification preferences
    updatePreferences: protectedProcedure
      .input(z.object({
        emailNotifications: z.boolean().optional(),
        smsNotifications: z.boolean().optional(),
        marketingEmails: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          await db.updateUserPreferences(ctx.user.id, input);
          return { success: true };
        } catch (error) {
          console.error('[User] Preferences update error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update preferences"
          });
        }
      }),

    // Get user notification preferences
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await db.getUserPreferences(ctx.user.id);
      } catch (error) {
        console.error('[User] Preferences fetch error:', error);
        return {
          emailNotifications: true,
          smsNotifications: false,
          marketingEmails: false,
        };
      }
    }),

    // Change password
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
        confirmPassword: z.string().min(8),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Import bcryptjs for password hashing
          const bcrypt = await import('bcryptjs');
          
          // Validate new passwords match
          if (input.newPassword !== input.confirmPassword) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "New passwords do not match"
            });
          }

          // Get user from database
          const user = await db.getUserById(ctx.user.id);
          if (!user) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found"
            });
          }

          // Verify current password if user has one
          if (user.passwordHash) {
            const passwordValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
            if (!passwordValid) {
              throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Current password is incorrect"
              });
            }
          }

          // Hash new password
          const salt = await bcrypt.genSalt(10);
          const newPasswordHash = await bcrypt.hash(input.newPassword, salt);

          // Update password
          await db.updateUserPassword(ctx.user.id, newPasswordHash);

          return { success: true, message: "Password updated successfully" };
        } catch (error) {
          console.error('[User] Password change error:', error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to change password"
          });
        }
      }),

    // Change email
    changeEmail: protectedProcedure
      .input(z.object({
        newEmail: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const bcrypt = await import('bcryptjs');

          // Validate new email format
          if (!input.newEmail || input.newEmail.length > 320) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid email address"
            });
          }

          // Check if email already exists
          const existingUser = await db.getUserByEmail(input.newEmail);
          if (existingUser && existingUser.id !== ctx.user.id) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Email already in use"
            });
          }

          // Verify password
          const user = await db.getUserById(ctx.user.id);
          if (!user) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found"
            });
          }

          if (user.passwordHash) {
            const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
            if (!passwordValid) {
              throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Password is incorrect"
              });
            }
          }

          // Send OTP to new email (using existing OTP system)
          const otp = Math.floor(100000 + Math.random() * 900000).toString();
          const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
          await createOTP(input.newEmail, otp, 'password_reset', expiresAt);

          // Send verification email
          await sendEmail({
            to: input.newEmail,
            subject: 'Verify Your New Email Address - AmeriLend',
            html: `
              <h2>Email Verification</h2>
              <p>Enter this code to verify your new email address:</p>
              <h1 style="letter-spacing: 2px; font-family: monospace;">${otp}</h1>
              <p>This code expires in 15 minutes.</p>
              <p>If you didn't request this, please ignore this email.</p>
            `
          });

          return { 
            success: true, 
            message: "Verification code sent to new email address"
          };
        } catch (error) {
          console.error('[User] Email change error:', error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to initiate email change"
          });
        }
      }),

    // Verify and apply new email
    verifyNewEmail: protectedProcedure
      .input(z.object({
        newEmail: z.string().email(),
        otp: z.string().length(6),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Verify OTP
          const otpValid = await verifyOTP(input.newEmail, input.otp, 'password_reset');
          if (!otpValid) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Invalid or expired verification code"
            });
          }

          // Update email
          await db.updateUser(ctx.user.id, { email: input.newEmail });

          return { success: true, message: "Email updated successfully" };
        } catch (error) {
          console.error('[User] Email verification error:', error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to verify email"
          });
        }
      }),

    // Delete account
    deleteAccount: protectedProcedure
      .input(z.object({
        password: z.string().min(1),
        confirmDelete: z.literal(true),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const bcrypt = await import('bcryptjs');

          // Get user
          const user = await db.getUserById(ctx.user.id);
          if (!user) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found"
            });
          }

          // Verify password
          if (user.passwordHash) {
            const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
            if (!passwordValid) {
              throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Password is incorrect"
              });
            }
          }

          // Cascade delete user data
          // Note: This requires ON DELETE CASCADE in foreign keys
          
          // Delete from related tables (in order of dependencies)
          // 1. Delete legal acceptances
          const dbConnection = await getDb();
          if (dbConnection) {
            // Delete legal acceptances
            await dbConnection
              .delete(legalAcceptances)
              .where(eq(legalAcceptances.userId, ctx.user.id));

            // Delete loan applications (and related payments/disbursements via cascade)
            await dbConnection
              .delete(loanApplications)
              .where(eq(loanApplications.userId, ctx.user.id));
          }

          // Finally delete user
          const pool = require('mysql2/promise');
          const connection = await pool.createConnection(process.env.DATABASE_URL || '');
          try {
            await connection.execute('DELETE FROM users WHERE id = ?', [ctx.user.id]);
          } finally {
            await connection.end();
          }

          // Clear session cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });

          return { success: true, message: "Account deleted successfully" };
        } catch (error) {
          console.error('[User] Account deletion error:', error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete account"
          });
        }
      }),
  }),

  // AI Support router
  aiSupport: router({
    // Get AI response to user query
    chat: publicProcedure
      .use(createRateLimitMiddleware(RateLimits.AI_CHAT))
      .input(z.object({
        message: z.string().min(1).max(1000),
        loanApplicationId: z.number().optional(),
        conversationHistory: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const context = {
            userId: ctx.user?.id,
            userEmail: ctx.user?.email || undefined,
            loanApplicationId: input.loanApplicationId,
            conversationHistory: input.conversationHistory,
          };

          const response = await generateSupportResponse(input.message, context);

          // Track conversation for analytics
          await trackSupportConversation(
            ctx.user?.id,
            input.message,
            response.message,
            "chat"
          );

          return response;
        } catch (error) {
          console.error('[AI Support] Chat error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to process your request"
          });
        }
      }),

    // Get suggested questions
    getSuggestions: publicProcedure
      .input(z.object({
        loanApplicationId: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        const context = {
          userId: ctx.user?.id,
          loanApplicationId: input?.loanApplicationId,
        };

        return getSuggestedQuestions(context);
      }),

    // Quick status check
    checkStatus: protectedProcedure
      .input(z.object({
        loanApplicationId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationById(input.loanApplicationId);
        
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND" });
        }
        
        if (application.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }

        // Generate AI explanation of status
        const statusQuery = `What does "${application.status}" status mean for my loan application #${application.id}?`;
        
        const response = await generateSupportResponse(statusQuery, {
          userId: ctx.user.id,
          loanApplicationId: input.loanApplicationId,
        });

        return {
          application,
          aiExplanation: response.message,
          nextSteps: response.suggestions,
        };
      }),

    // PUBLIC: Check application status without login using reference number
    checkStatusPublic: publicProcedure
      .input(z.object({
        applicationReferenceNumber: z.string().regex(/^APP-\d{8}-[A-Z0-9]{9}$/, "Invalid application reference number format"),
        email: z.string().email("Invalid email address"),
      }))
      .mutation(async ({ input }) => {
        try {
          // Find application by reference number
          const db_instance = await getDb();
          if (!db_instance) {
            throw new TRPCError({ 
              code: "INTERNAL_SERVER_ERROR", 
              message: "Database connection failed" 
            });
          }

          // Query to find application by reference number
          const applications = await db_instance
            .select()
            .from(loanApplications)
            .where(eq(loanApplications.applicationReferenceNumber, input.applicationReferenceNumber))
            .limit(1);

          if (applications.length === 0) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Application not found. Please check your reference number."
            });
          }

          const application = applications[0];

          // Verify email matches for security
          if (application.email.toLowerCase() !== input.email.toLowerCase()) {
            throw new TRPCError({
              code: "FORBIDDEN",
              message: "Email does not match our records"
            });
          }

          // Generate AI-powered status explanation
          const statusExplanation = await generateSupportResponse(
            `Tell me about my loan application status. My application reference is ${input.applicationReferenceNumber} and my status is currently "${application.status}". What does this mean and what should I do next?`,
            {
              userEmail: input.email,
              loanApplicationId: application.id,
            }
          );

          // Build response with application details
          const response = {
            referenceNumber: application.applicationReferenceNumber,
            status: application.status,
            fullName: application.fullName,
            email: application.email,
            loanType: application.loanType,
            requestedAmount: application.requestedAmount,
            approvedAmount: application.approvedAmount,
            processingFeeAmount: application.processingFeeAmount,
            createdAt: application.createdAt,
            updatedAt: application.updatedAt,
            approvedAt: application.approvedAt,
            disbursedAt: application.disbursedAt,
            identityVerificationStatus: application.identityVerificationStatus,
            
            // AI-generated explanation
            aiStatusExplanation: statusExplanation.message,
            nextSteps: statusExplanation.suggestions,
            actionRequired: statusExplanation.actionRequired,
          };

          // Track the lookup for analytics
          await trackSupportConversation(
            undefined,
            `Public status check: ${input.applicationReferenceNumber}`,
            `Status: ${application.status}`,
            "status_check"
          );

          return response;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          
          console.error('[AI Support] Public status check error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to retrieve application status"
          });
        }
      }),

    // PUBLIC: Get suggested questions for status check
    getStatusCheckSuggestions: publicProcedure.query(async () => {
      return [
        "What is the status of my loan application?",
        "When will I know if I'm approved?",
        "How long does the approval process take?",
        "What documents do I need to provide?",
        "Can I track my application?",
        "What happens after I'm approved?",
        "How can I contact support?",
      ];
    }),
  }),

  // Referral Program router
  referrals: router({
    // Get or create user's referral code
    getMyCode: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          let code = await db.getUserReferralCode(ctx.user.id);
          
          // If no code exists, create one
          if (!code) {
            code = await db.createReferralCode(ctx.user.id);
          }

          return {
            success: true,
            code: code?.code || null,
            referralCodeId: code?.id || null,
            rewards: {
              referrerAmount: code?.referrerRewardAmount || 0,
              refereeAmount: code?.refereeRewardAmount || 0,
            },
          };
        } catch (error) {
          console.error('[Referrals] Error getting code:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get referral code"
          });
        }
      }),

    // Get referral statistics for current user
    getStats: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const stats = await db.getReferralStats(ctx.user.id);
          return {
            success: true,
            stats,
          };
        } catch (error) {
          console.error('[Referrals] Error getting stats:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get referral stats"
          });
        }
      }),

    // Get all referrals made by current user
    getMyReferrals: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const referrals = await db.getUserReferrals(ctx.user.id);
          return {
            success: true,
            referrals,
            total: referrals.length,
          };
        } catch (error) {
          console.error('[Referrals] Error getting referrals:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get referrals"
          });
        }
      }),

    // Validate referral code (check if it exists and is active)
    validateCode: publicProcedure
      .input(z.object({
        code: z.string().min(1),
      }))
      .query(async ({ input }) => {
        try {
          const referralCode = await db.getReferralCodeByCode(input.code);
          
          if (!referralCode) {
            return {
              valid: false,
              message: "Referral code not found",
            };
          }

          if (referralCode.status !== "active") {
            return {
              valid: false,
              message: "This referral code is no longer active",
            };
          }

          return {
            valid: true,
            code: referralCode.code,
            referralCodeId: referralCode.id,
            referrerRewardAmount: referralCode.referrerRewardAmount,
            refereeRewardAmount: referralCode.refereeRewardAmount,
            totalReferrals: referralCode.totalReferrals,
          };
        } catch (error) {
          console.error('[Referrals] Error validating code:', error);
          return {
            valid: false,
            message: "Error validating referral code",
          };
        }
      }),

    // Record a new referral when signing up with a code
    recordReferral: publicProcedure
      .input(z.object({
        code: z.string(),
        refereeUserId: z.number(),
        ipAddress: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const referralCode = await db.getReferralCodeByCode(input.code);
          
          if (!referralCode) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Referral code not found",
            });
          }

          if (referralCode.status !== "active") {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "This referral code is no longer active",
            });
          }

          const referral = await db.recordReferral(
            referralCode.id,
            referralCode.userId,
            input.refereeUserId,
            "signup",
            input.ipAddress
          );

          if (!referral) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to record referral",
            });
          }

          console.log(`[Referrals] Successfully recorded referral for user ${input.refereeUserId}`);

          return {
            success: true,
            referralId: referral.id,
            message: "Referral recorded successfully",
          };
        } catch (error) {
          console.error('[Referrals] Error recording referral:', error);
          throw error;
        }
      }),

    // Admin: Get all referrals
    adminList: adminProcedure
      .query(async () => {
        try {
          const dbInstance = await getDb();
          if (!dbInstance) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Database connection failed"
            });
          }

          // This would need to be implemented to get all referrals
          // For now, returning empty list
          return {
            success: true,
            referrals: [],
            total: 0,
          };
        } catch (error) {
          console.error('[Referrals] Error getting all referrals:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to get referrals"
          });
        }
      }),
  }),

  // Identity Verification router
  identity: router({
    getSubmittedDocuments: adminProcedure
      .input(z.object({
        status: z.enum(["pending", "approved", "rejected", "needs_reupload", "all"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        const status = input?.status;
        return db.getSubmittedDocumentsForAdmin(status);
      }),

    updateDocumentStatus: adminProcedure
      .input(z.object({
        documentId: z.number(),
        status: z.enum(["pending", "approved", "rejected", "needs_reupload"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.updateSubmittedDocumentVerification(
          input.documentId,
          input.status,
          input.notes,
          ctx.user.id,
        );

        return {
          success: true,
          message: `Document ${input.status} successfully`,
        };
      }),

    updateVerificationStatus: adminProcedure
      .input(z.object({
        loanApplicationId: z.number(),
        status: z.enum(["approved", "rejected"]),
        verificationNotes: z.string().optional(),
        verifierId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const application = await db.getLoanApplicationById(input.loanApplicationId);
        if (!application) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
        }

        // Update the application's identity verification status
        await db.updateLoanApplicationStatus(input.loanApplicationId, application.status, {
          identityVerificationStatus: input.status === "approved" ? "approved" : "rejected",
          verificationNotes: input.verificationNotes,
          verifiedBy: input.verifierId,
          verificationDate: new Date(),
        });

        return {
          success: true,
          message: `Identity ${input.status} successfully`,
        };
      }),

    getPendingVerifications: adminProcedure
      .query(async () => {
        try {
          const applications = await db.getAllLoanApplications();
          
          // Filter for pending identity verifications
          const pendingVerifications = applications.filter((app: any) => 
            app.identityVerificationStatus === "pending"
          );
          
          // Sort by most recent first
          return pendingVerifications.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch pending verifications",
          });
        }
      }),

    getVerificationHistory: adminProcedure
      .query(async () => {
        try {
          const applications = await db.getAllLoanApplications();
          
          // Filter for verified (approved or rejected) identities
          const verified = applications.filter((app: any) => 
            app.identityVerificationStatus !== "pending" && app.verifiedBy
          );
          
          // Sort by verification date (most recent first)
          return verified.sort((a: any, b: any) => {
            const dateA = a.verificationDate ? new Date(a.verificationDate).getTime() : 0;
            const dateB = b.verificationDate ? new Date(b.verificationDate).getTime() : 0;
            return dateB - dateA;
          });
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch verification history",
          });
        }
      }),

    // Get verification statistics
    getStats: adminProcedure
      .query(async () => {
        try {
          const applications = await db.getAllLoanApplications();
          const documents = await db.getSubmittedDocumentsForAdmin("all");
          
          const total = applications.length;
          const pending = applications.filter((a: any) => !a.identityVerificationStatus || a.identityVerificationStatus === "pending").length;
          const approved = applications.filter((a: any) => a.identityVerificationStatus === "approved").length;
          const rejected = applications.filter((a: any) => a.identityVerificationStatus === "rejected").length;
          
          const completionRate = total > 0 ? ((approved + rejected) / total * 100) : 0;
          const approvalRate = total > 0 ? (approved / total * 100) : 0;

          return {
            total,
            pending,
            approved,
            rejected,
            completionRate: Math.round(completionRate * 10) / 10,
            approvalRate: Math.round(approvalRate * 10) / 10,
            avgTimeToVerify: 5, // placeholder
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch verification statistics",
          });
        }
      }),

    // Bulk update document statuses
    bulkUpdateDocuments: adminProcedure
      .input(z.object({
        documentIds: z.array(z.number()),
        status: z.enum(["approved", "rejected", "needs_reupload"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let successCount = 0;
        for (const docId of input.documentIds) {
          try {
            await db.updateSubmittedDocumentVerification(
              docId,
              input.status,
              input.notes,
              ctx.user.id,
            );
            successCount++;
          } catch (error) {
            console.error(`Failed to update document ${docId}:`, error);
          }
        }

        return {
          success: true,
          message: `${successCount} of ${input.documentIds.length} documents updated`,
          successCount,
          totalCount: input.documentIds.length,
        };
      }),

    // Request appeal/resubmission from user
    requestAppeal: protectedProcedure
      .input(z.object({
        applicationId: z.number(),
        message: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const application = await db.getLoanApplicationById(input.applicationId);
          
          if (!application) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Application not found" });
          }

          if (application.userId !== ctx.user.id) {
            throw new TRPCError({ code: "FORBIDDEN", message: "You can only appeal your own applications" });
          }

          if (application.identityVerificationStatus !== "rejected") {
            throw new TRPCError({ 
              code: "BAD_REQUEST", 
              message: "Can only appeal rejected identities" 
            });
          }

          // Create appeal record (in a real system, this would go to a dedicated table)
          console.log(`[APPEAL] User ${ctx.user.id} appealed application ${input.applicationId}`);
          console.log(`[APPEAL_MESSAGE] ${input.message || "No message provided"}`);

          return {
            success: true,
            message: "Appeal submitted. Admins will review and contact you soon.",
            appealId: `APPEAL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "Failed to submit appeal",
          });
        }
      }),

    // Get SLA and performance metrics
    getMetrics: adminProcedure
      .query(async () => {
        try {
          const documents = await db.getSubmittedDocumentsForAdmin("all");
          
          // Calculate average time to verification
          let totalDays = 0;
          let verifiedCount = 0;

          documents?.forEach((doc: any) => {
            if (doc.verifiedAt && doc.uploadedAt) {
              const uploaded = new Date(doc.uploadedAt);
              const verified = new Date(doc.verifiedAt);
              const days = Math.ceil((verified.getTime() - uploaded.getTime()) / (1000 * 60 * 60 * 24));
              totalDays += days;
              verifiedCount++;
            }
          });

          const avgTimeToVerify = verifiedCount > 0 ? Math.round(totalDays / verifiedCount) : 0;
          const oldestPendingDays = documents
            ?.filter((d: any) => !d.verifiedAt)
            .sort((a: any, b: any) => new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime())
            .map((d: any) => {
              const uploaded = new Date(d.uploadedAt);
              const now = new Date();
              return Math.ceil((now.getTime() - uploaded.getTime()) / (1000 * 60 * 60 * 24));
            })[0] || 0;

          return {
            avgTimeToVerify,
            oldestPendingDays,
            documentsProcessed: verifiedCount,
            documentsRemaining: (documents?.length || 0) - verifiedCount,
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch metrics",
          });
        }
      }),
  }),

  // Admin Analytics & Reports router
  analytics: router({
    // Get dashboard overview statistics
    getOverview: adminProcedure.query(async () => {
      try {
        const applications = await db.getAllLoanApplications();
        const payments = await db.getAllPayments();
        const users = await db.getAllUsers();
        
        // Calculate statistics
        const totalApplications = applications.length;
        const approvedApplications = applications.filter((app: any) => app.status === 'approved' || app.status === 'fee_pending' || app.status === 'fee_paid' || app.status === 'disbursed').length;
        const pendingApplications = applications.filter((app: any) => app.status === 'pending' || app.status === 'under_review').length;
        const rejectedApplications = applications.filter((app: any) => app.status === 'rejected').length;
        
        const totalRequested = applications.reduce((sum: number, app: any) => sum + (app.requestedAmount || 0), 0);
        const totalApproved = applications.reduce((sum: number, app: any) => sum + (app.approvedAmount || 0), 0);
        
        const totalRevenue = payments
          .filter((p: any) => p.status === 'succeeded')
          .reduce((sum: number, p: any) => sum + (p.amount || 0), 0);
        
        const approvalRate = totalApplications > 0 ? (approvedApplications / totalApplications * 100) : 0;
        
        return {
          totalApplications,
          approvedApplications,
          pendingApplications,
          rejectedApplications,
          totalRequested,
          totalApproved,
          totalRevenue,
          approvalRate,
          totalUsers: users.length,
          averageLoanAmount: approvedApplications > 0 ? Math.round(totalApproved / approvedApplications) : 0,
        };
      } catch (error) {
        console.error('[Analytics] Overview error:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch analytics overview"
        });
      }
    }),

    // Get application trends over time
    getTrends: adminProcedure
      .input(z.object({
        period: z.enum(['7days', '30days', '90days', '1year']).default('30days'),
      }))
      .query(async ({ input }) => {
        try {
          const applications = await db.getAllLoanApplications();
          
          const now = new Date();
          let daysBack = 30;
          
          switch (input.period) {
            case '7days': daysBack = 7; break;
            case '30days': daysBack = 30; break;
            case '90days': daysBack = 90; break;
            case '1year': daysBack = 365; break;
          }
          
          const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
          
          // Filter applications within period
          const periodApplications = applications.filter((app: any) => 
            new Date(app.createdAt) >= startDate
          );
          
          // Group by date
          const dailyData: Record<string, any> = {};
          
          periodApplications.forEach((app: any) => {
            const date = new Date(app.createdAt).toISOString().split('T')[0];
            
            if (!dailyData[date]) {
              dailyData[date] = { date, total: 0, approved: 0, rejected: 0, pending: 0 };
            }
            
            dailyData[date].total++;
            
            if (app.status === 'approved' || app.status === 'fee_pending' || app.status === 'fee_paid' || app.status === 'disbursed') {
              dailyData[date].approved++;
            } else if (app.status === 'rejected') {
              dailyData[date].rejected++;
            } else {
              dailyData[date].pending++;
            }
          });
          
          return Object.values(dailyData).sort((a: any, b: any) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        } catch (error) {
          console.error('[Analytics] Trends error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch trends data"
          });
        }
      }),

    // Get revenue by payment method
    getRevenueByMethod: adminProcedure.query(async () => {
      try {
        const payments = await db.getAllPayments();
        
        const successfulPayments = payments.filter((p: any) => p.status === 'succeeded');
        
        const byMethod: Record<string, number> = {};
        
        successfulPayments.forEach((payment: any) => {
          const method = payment.paymentMethod || 'unknown';
          byMethod[method] = (byMethod[method] || 0) + (payment.amount || 0);
        });
        
        return Object.entries(byMethod).map(([method, amount]) => ({
          method,
          amount,
          count: successfulPayments.filter((p: any) => p.paymentMethod === method).length,
        }));
      } catch (error) {
        console.error('[Analytics] Revenue by method error:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch revenue data"
        });
      }
    }),
  }),

  // Admin User Management router
  adminUsers: router({
    // List all users with filtering
    list: adminProcedure
      .input(z.object({
        role: z.enum(['all', 'user', 'admin']).default('all'),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        try {
          let users = await db.getAllUsers();
          
          // Filter by role
          if (input.role !== 'all') {
            users = users.filter((u: any) => u.role === input.role);
          }
          
          // Search filter
          if (input.search) {
            const searchLower = input.search.toLowerCase();
            users = users.filter((u: any) => 
              u.email?.toLowerCase().includes(searchLower) ||
              u.name?.toLowerCase().includes(searchLower)
            );
          }
          
          // Remove sensitive data
          return users.map((u: any) => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            phone: u.phone,
            createdAt: u.createdAt,
            lastSignedIn: u.lastSignedIn,
          }));
        } catch (error) {
          console.error('[AdminUsers] List error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch users"
          });
        }
      }),

    // Get user details with activity
    getDetails: adminProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        try {
          const user = await db.getUserById(input.userId);
          if (!user) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "User not found"
            });
          }
          
          // Get user's applications
          const applications = await db.getLoanApplicationsByUserId(input.userId);
          
          // Get user's payments
          const payments = await db.getPaymentsByUserId(input.userId);
          
          return {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
              phone: user.phone,
              street: user.street,
              city: user.city,
              state: user.state,
              zipCode: user.zipCode,
              createdAt: user.createdAt,
              lastSignedIn: user.lastSignedIn,
            },
            applications,
            payments,
            stats: {
              totalApplications: applications.length,
              totalPaid: payments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
            }
          };
        } catch (error) {
          console.error('[AdminUsers] Get details error:', error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch user details"
          });
        }
      }),

    // Update user role
    updateRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(['user', 'admin']),
      }))
      .mutation(async ({ input }) => {
        try {
          await db.updateUserRole(input.userId, input.role);
          return { success: true, message: `User role updated to ${input.role}` };
        } catch (error) {
          console.error('[AdminUsers] Update role error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user role"
          });
        }
      }),

    // Suspend/activate user
    toggleActive: adminProcedure
      .input(z.object({
        userId: z.number(),
        active: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Implement user suspension logic
          // For now, we can use a custom field or just return success
          return { 
            success: true, 
            message: input.active ? 'User activated' : 'User suspended'
          };
        } catch (error) {
          console.error('[AdminUsers] Toggle active error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update user status"
          });
        }
      }),
  }),

  // Admin Document Management router
  documents: router({
    // Get all documents for review
    list: adminProcedure
      .input(z.object({
        status: z.enum(['all', 'pending', 'approved', 'rejected', 'needs_reupload']).default('all'),
      }))
      .query(async ({ input }) => {
        try {
          const documents = await db.getAllDocuments();
          
          if (input.status !== 'all') {
            return documents.filter((doc: any) => doc.verificationStatus === input.status);
          }
          
          return documents;
        } catch (error) {
          console.error('[Documents] List error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch documents"
          });
        }
      }),

    // Verify document
    verify: adminProcedure
      .input(z.object({
        documentId: z.number(),
        status: z.enum(['approved', 'rejected', 'needs_reupload']),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          await db.updateDocumentVerification(
            input.documentId,
            input.status,
            ctx.user.id,
            input.notes
          );
          
          return { 
            success: true, 
            message: `Document ${input.status}` 
          };
        } catch (error) {
          console.error('[Documents] Verify error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to verify document"
          });
        }
      }),
  }),

  // Admin router for document management
  admin: router({
    // Update document status
    updateDocumentStatus: adminProcedure
      .input(z.object({
        documentId: z.number(),
        status: z.enum(['approved', 'rejected', 'needs_reupload']),
        adminNote: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          console.log('[Admin] Updating document status:', input);
          
          const document = await db.getSubmittedDocumentById(input.documentId);
          if (!document) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: "Document not found"
            });
          }

          await db.updateSubmittedDocumentStatus(
            input.documentId,
            input.status,
            input.adminNote
          );

          // If requesting reupload, notify the user
          if (input.status === 'needs_reupload') {
            const application = await db.getLoanApplicationById(document.loanApplicationId);
            if (application) {
              console.log('[Admin] Document reupload requested for user:', application.email);
              
              // Send email notification to user
              const documentType = document.documentType.replace(/_/g, ' ');
              const reuploadLink = `http://localhost:5173/dashboard?tab=documents`;
              
              const emailHtml = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <h2 style="color: #2c3e50;">Additional Information Needed</h2>
                  <p>Hi ${application.fullName},</p>
                  <p>We need you to provide additional documentation for your loan application.</p>
                  
                  <div style="background-color: #f8f9fa; border-left: 4px solid #ff9800; padding: 15px; margin: 20px 0;">
                    <p><strong>Document Requested:</strong> ${documentType}</p>
                    ${input.adminNote ? `<p><strong>Notes:</strong> ${input.adminNote}</p>` : ''}
                  </div>
                  
                  <p>Please log in to your account and upload the requested document:</p>
                  <p>
                    <a href="${reuploadLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                      Go to Dashboard & Upload
                    </a>
                  </p>
                  
                  <p style="margin-top: 30px; font-size: 12px; color: #666;">
                    If you have any questions, please contact our support team.
                  </p>
                </div>
              `;
              
              try {
                console.log('[Admin] 📧 Attempting to send reupload notification email to:', application.email);
                const emailSent = await sendEmail({
                  to: application.email,
                  subject: `Additional Information Needed - ${documentType}`,
                  html: emailHtml,
                });
                if (emailSent) {
                  console.log('[Admin] ✅ Reupload notification email sent successfully to:', application.email);
                } else {
                  console.log('[Admin] ⚠️ Email notification returned false (SendGrid may not be configured)');
                }
              } catch (emailError: any) {
                console.error('[Admin] ❌ Failed to send reupload notification email:', emailError.message || emailError);
              }
            } else {
              console.warn('[Admin] ⚠️ Application not found for document reupload request');
            }
          }
          
          return { 
            success: true, 
            message: `Document ${input.status}` 
          };
        } catch (error) {
          console.error('[Admin] Update document status error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update document status"
          });
        }
      }),
  }),

  // Admin Audit Logs router
  auditLogs: router({
    // Get recent admin actions
    list: adminProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        actionType: z.enum(['all', 'approval', 'rejection', 'disbursement', 'verification', 'config']).default('all'),
      }))
      .query(async ({ input }) => {
        try {
          // Get all applications to track actions
          const applications = await db.getAllLoanApplications();
          
          const logs: any[] = [];
          
          // Convert application status changes to audit logs
          applications.forEach((app: any) => {
            if (app.approvedAt) {
              logs.push({
                id: `approval-${app.id}`,
                action: 'approval',
                description: `Approved application ${app.applicationReferenceNumber}`,
                amount: app.approvedAmount,
                timestamp: app.approvedAt,
                adminId: app.verifiedBy,
              });
            }
            
            if (app.status === 'rejected' && app.rejectionReason) {
              logs.push({
                id: `rejection-${app.id}`,
                action: 'rejection',
                description: `Rejected application ${app.applicationReferenceNumber}`,
                reason: app.rejectionReason,
                timestamp: app.updatedAt,
              });
            }
            
            if (app.verificationDate) {
              logs.push({
                id: `verification-${app.id}`,
                action: 'verification',
                description: `Verified identity for ${app.applicationReferenceNumber}`,
                status: app.identityVerificationStatus,
                timestamp: app.verificationDate,
                adminId: app.verifiedBy,
              });
            }
          });
          
          // Filter by action type
          const filtered = input.actionType === 'all' 
            ? logs 
            : logs.filter(log => log.action === input.actionType);
          
          // Sort by timestamp (most recent first) and limit
          return filtered
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, input.limit);
        } catch (error) {
          console.error('[AuditLogs] List error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to fetch audit logs"
          });
        }
      }),
  }),

  // User Profile Management Routes
  profile: router({
    // Update user phone number
    updatePhone: protectedProcedure
      .input(z.object({ phone: z.string().min(1, "Phone number is required") }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Validate phone format (at least 10 digits)
          const phoneDigits = input.phone.replace(/\D/g, '');
          if (phoneDigits.length < 10) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Phone number must contain at least 10 digits"
            });
          }
          
          await db.updateUser(ctx.user.id, { phone: input.phone });
          return { success: true, message: "Phone number updated successfully" };
        } catch (error) {
          console.error('[Profile] Update phone error:', error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update phone number"
          });
        }
      }),

    // Update notification preferences
    updatePreferences: protectedProcedure
      .input(z.object({
        emailNotifications: z.boolean().optional(),
        smsNotifications: z.boolean().optional(),
        marketingEmails: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Get current preferences first
          const currentPrefs = await db.getUserPreferences(ctx.user.id);
          
          // Merge with new values
          await db.updateUserPreferences(ctx.user.id, {
            emailNotifications: input.emailNotifications ?? currentPrefs.emailNotifications,
            smsNotifications: input.smsNotifications ?? currentPrefs.smsNotifications,
            marketingEmails: input.marketingEmails ?? currentPrefs.marketingEmails,
          });
          return { success: true, message: "Preferences updated successfully" };
        } catch (error) {
          console.error('[Profile] Update preferences error:', error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update preferences"
          });
        }
      }),

    // Change password
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string().min(1, "Current password is required"),
        newPassword: z.string().min(6, "New password must be at least 6 characters"),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const user = await db.getUserById(ctx.user.id);
          if (!user) {
            throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
          }

          if (!user.passwordHash) {
            throw new TRPCError({ 
              code: "BAD_REQUEST", 
              message: "This account doesn't have a password set. Please use social login or reset your password." 
            });
          }

          // Verify current password
          const bcrypt = await import('bcryptjs');
          const isValid = await bcrypt.compare(input.currentPassword, user.passwordHash);
          
          if (!isValid) {
            throw new TRPCError({ 
              code: "BAD_REQUEST", 
              message: "Current password is incorrect" 
            });
          }

          // Hash new password
          const newHash = await bcrypt.hash(input.newPassword, 10);
          await db.updateUserPassword(ctx.user.id, newHash);

          return { success: true, message: "Password changed successfully" };
        } catch (error: any) {
          console.error('[Profile] Change password error:', error);
          if (error instanceof TRPCError) throw error;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to change password"
          });
        }
      }),

    // Get user preferences
    getPreferences: protectedProcedure.query(async ({ ctx }) => {
      try {
        const prefs = await db.getUserPreferences(ctx.user.id);
        return prefs || {
          emailNotifications: true,
          smsNotifications: true,
          marketingEmails: false,
        };
      } catch (error) {
        console.error('[Profile] Get preferences error:', error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch preferences"
        });
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
