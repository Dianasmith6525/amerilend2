import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { createOTP, verifyOTP, sendOTPEmail } from "./_core/otp";
import { createAuthorizeNetTransaction, getAcceptJsConfig } from "./_core/authorizenet";
import { createCryptoCharge, checkCryptoPaymentStatus, getSupportedCryptos, convertUSDToCrypto } from "./_core/crypto-payment";
import { legalAcceptances } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { generateSupportResponse, getSuggestedQuestions, trackSupportConversation } from "./_core/aiSupport";
import { getGoogleAuthUrl, getGoogleUserInfo } from "./_core/google-oauth";

export const appRouter = router({
  system: systemRouter,
  
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
      return { url: getGoogleAuthUrl() };
    }),
    
    // Handle Google OAuth callback
    callback: publicProcedure
      .input(z.object({
        code: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          // Get user info from Google
          const googleUser = await getGoogleUserInfo(input.code);
          
          if (!googleUser.email_verified) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "Email not verified with Google",
            });
          }
          
          // Create or get user
          let user = await db.getUserByEmail(googleUser.email);
          
          if (!user) {
            // Create new user
            await db.upsertUser({
              email: googleUser.email,
              openId: `google_${googleUser.sub}`,
              role: "user",
            });
            user = await db.getUserByEmail(googleUser.email);
          }
          
          if (!user) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create user",
            });
          }
          
          // Create session
          const { sdk } = await import("./_core/sdk");
          const sessionToken = await sdk.createSessionToken(user.openId, {
            name: googleUser.name,
          });
          
          // Set cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
          
          console.log(`[Google OAuth] Session created for ${user.email}`);
          return { success: true, user };
        } catch (error) {
          console.error('[Google OAuth] Error:', error);
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
      .input(z.object({
        email: z.string().email(),
        purpose: z.enum(["signup", "login"]),
      }))
      .mutation(async ({ input }) => {
        try {
          console.log(`[OTP] Requesting code for ${input.email} (${input.purpose})`);
          const code = await createOTP(input.email, input.purpose);
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
      .input(z.object({
        email: z.string().email(),
        code: z.string().length(6),
        purpose: z.enum(["signup", "login"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await verifyOTP(input.email, input.code, input.purpose);
        if (!result.valid) {
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
        const { sdk } = await import("./_core/sdk");
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.email,
        });
        
        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        console.log(`[OTP] Session created for ${user.email}`);
        return { success: true, user };
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

        // Create user
        await db.upsertUser({
          email,
          openId: email, // Use email as openId for password users
          passwordHash,
          loginMethod: "password",
          role: "user",
        });

        const user = await db.getUserByEmail(email);
        if (!user) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          });
        }

        // Create session
        const { sdk } = await import("./_core/sdk");
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.email,
        });
        
        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        console.log(`[Password] Account created for ${user.email}`);
        return { success: true, user };
      }),

    // Login with email and password
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
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
        const { sdk } = await import("./_core/sdk");
        const sessionToken = await sdk.createSessionToken(user.openId, {
          name: user.email,
        });
        
        // Set cookie
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);

        console.log(`[Password] Login successful for ${user.email}`);
        return { success: true, user };
      }),

    // Request password reset (sends OTP to email)
    requestPasswordReset: publicProcedure
      .input(z.object({
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const { email } = input;

        // Check if user exists with password login method
        const user = await db.getUserByEmail(email);
        if (!user || !user.passwordHash) {
          // For security, don't reveal if user exists
          // Just return success but don't send email
          console.log(`[Password Reset] User not found or no password set: ${email}`);
          return { success: true };
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        // Store OTP
        await db.createOTP(email, code, "password_reset", expiresAt);

        // Send email with reset code
        const { sendEmail } = await import("./_core/notification");
        await sendEmail({
          to: email,
          subject: "Password Reset Code - AmeriLend",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0033A0;">Password Reset Request</h2>
              <p>You requested to reset your password. Use the code below to reset your password:</p>
              <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                ${code}
              </div>
              <p>This code will expire in 15 minutes.</p>
              <p>If you didn't request this password reset, please ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="color: #666; font-size: 12px;">
                <strong>AmeriLend</strong><br>
                This is an automated message, please do not reply.
              </p>
            </div>
          `,
        });

        console.log(`[Password Reset] Code sent to ${email}`);
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
        const isValid = await db.verifyOTP(email, code, "password_reset");
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

        // Delete used OTP
        await db.deleteOTP(email, "password_reset");

        console.log(`[Password Reset] Password reset successful for ${email}`);
        return { success: true };
      }),
  }),

  // Loan application router
  loans: router({
    // Submit a new loan application
    submit: protectedProcedure
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
        dependents: z.string().regex(/^\d+$/),
        citizenshipStatus: z.enum(["us_citizen", "permanent_resident"]),
        priorBankruptcy: z.boolean(),
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
        loanPurpose: z.string().min(5),
        // Agreement and preference fields (client-side only, logged but not stored directly)
        preferredContact: z.enum(["email", "phone", "sms"]).optional().default("email"),
        creditCheckConsent: z.boolean(),
        termsConsent: z.boolean(),
        privacyConsent: z.boolean(),
        loanAgreementConsent: z.boolean(),
        esignConsent: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify all agreements are accepted
        if (!input.creditCheckConsent || !input.termsConsent || !input.privacyConsent || 
            !input.loanAgreementConsent || !input.esignConsent) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "All agreements must be accepted to proceed"
          });
        }

        // Validate bankruptcy date if bankruptcy is true
        if (input.priorBankruptcy && !input.bankruptcyDate) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Bankruptcy date is required if you have filed for bankruptcy"
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
            message: "An application with this Social Security Number is already being processed. Please contact support if this is an error."
          });
        }

        // 2. Check for recent applications from same user
        const recentApps = await db.checkRecentApplications(ctx.user.id, 24);
        if (recentApps.length > 0) {
          console.warn(`[FRAUD] Multiple applications within 24h: User ${ctx.user.id} has ${recentApps.length} recent applications`);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You can only submit one application per 24 hours. Please wait and try again later."
          });
        }

        // 3. Validate suspicious SSN patterns
        if (db.isSuspiciousSSN(input.ssn)) {
          console.warn(`[FRAUD] Suspicious SSN pattern: ${input.ssn} (User ${ctx.user.id})`);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "The Social Security Number provided is invalid. Please verify and try again."
          });
        }

        // 4. Validate phone number
        if (!db.isValidPhone(input.phone)) {
          console.warn(`[FRAUD] Invalid phone number: ${input.phone} (User ${ctx.user.id})`);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "The phone number provided is invalid. Please verify and try again."
          });
        }

        // 5. Check for disposable email
        if (db.isDisposableEmail(input.email)) {
          console.warn(`[FRAUD] Disposable email attempted: ${input.email} (User ${ctx.user.id})`);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Please use a valid, permanent email address for your application."
          });
        }

        // 6. Calculate fraud score
        const fraudAnalysis = db.calculateFraudScore({
          ssn: input.ssn,
          dateOfBirth: input.dateOfBirth,
          monthlyIncome: input.monthlyIncome,
          requestedAmount: input.requestedAmount,
          loanPurpose: input.loanPurpose,
          priorBankruptcy: input.priorBankruptcy,
          bankruptcyDate: input.bankruptcyDate
        });

        // Log fraud score
        console.log(`[FRAUD_SCORE] User ${ctx.user.id}: Score ${fraudAnalysis.score}/100, Flags: ${fraudAnalysis.flags.join(", ")}`);

        // Auto-reject if fraud score > 80
        if (fraudAnalysis.score > 80) {
          console.error(`[FRAUD] Application rejected - high fraud score ${fraudAnalysis.score}: User ${ctx.user.id}`);
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Your application could not be processed at this time. Please contact support for more information."
          });
        }

        // Log the submission
        console.log(`[LoanApplication] User ${ctx.user.id} submitted application, preferred contact: ${input.preferredContact}, fraud_score: ${fraudAnalysis.score}`);

        // Create loan application (excluding agreement fields)
        const { preferredContact, creditCheckConsent, termsConsent, privacyConsent, loanAgreementConsent, esignConsent, ...loanData } = input;
        
        await db.createLoanApplication({
          userId: ctx.user.id,
          ...loanData,
        });

        return { success: true };
      }),

    // Get user's loan applications
    myApplications: protectedProcedure.query(async ({ ctx }) => {
      return db.getLoanApplicationsByUserId(ctx.user.id);
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
        return application;
      }),

    // Admin: Get all loan applications
    adminList: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return db.getAllLoanApplications();
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

        await db.updateLoanApplicationStatus(input.id, "rejected", {
          rejectionReason: input.rejectionReason,
        });

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
          fixedFeeAmount: 200, // $2.00
        };
      }
      return config;
    }),

    // Admin: Update fee configuration
    adminUpdate: protectedProcedure
      .input(z.object({
        calculationMode: z.enum(["percentage", "fixed"]),
        percentageRate: z.number().int().min(150).max(250).optional(), // 1.5% - 2.5%
        fixedFeeAmount: z.number().int().min(150).max(250).optional(), // $1.50 - $2.50
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
          fixedFeeAmount: input.fixedFeeAmount || 200,
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

    // Process card payment via Authorize.net
    processCardPayment: protectedProcedure
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

        return { 
          success: true,
          paymentId: paymentRecord.insertId,
          transactionId: result.transactionId,
          authCode: result.authCode,
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
  }),

  // Disbursement router (admin only)
  disbursements: router({
    // Admin: Initiate loan disbursement with method selection
    adminInitiate: protectedProcedure
      .input(z.object({
        loanApplicationId: z.number(),
        
        // Disbursement method
        disbursementMethod: z.enum(["ach", "wire", "check", "paycard"]).default("ach"),
        
        // Bank details (for ACH and Wire)
        accountHolderName: z.string().min(1).optional(),
        accountNumber: z.string().min(1).optional(),
        routingNumber: z.string().min(9).optional(),
        accountType: z.enum(["checking", "savings"]).optional(),
        swiftCode: z.string().optional(),
        bankName: z.string().optional(),
        
        // Check details
        checkMailingAddress: z.string().optional(),
        checkPayeeName: z.string().optional(),
        
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
          if (!input.accountHolderName || !input.accountNumber || !input.routingNumber) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `${input.disbursementMethod.toUpperCase()} requires account holder name, account number, and routing number`
            });
          }
        } else if (input.disbursementMethod === "check") {
          if (!input.checkMailingAddress || !input.checkPayeeName) {
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

        // Create disbursement record with new fields
        await db.createDisbursement({
          loanApplicationId: input.loanApplicationId,
          userId: application.userId,
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
          adminNotes: input.adminNotes,
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
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Update user profile in database
          await db.updateUser(ctx.user.id, {
            name: input.name || ctx.user.name,
            phone: input.phone || ctx.user.phone,
            street: input.street || ctx.user.street,
            city: input.city || ctx.user.city,
            state: input.state || ctx.user.state,
            zipCode: input.zipCode || ctx.user.zipCode,
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
  }),

  // AI Support router
  aiSupport: router({
    // Get AI response to user query
    chat: publicProcedure
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
            userEmail: ctx.user?.email,
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
});

