import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date, tinyint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).unique(),
  passwordHash: varchar("passwordHash", { length: 255 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // User profile fields - Basic info
  phone: varchar("phone", { length: 20 }),
  street: varchar("street", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  
  // User profile fields - Identity & Demographics
  middleInitial: varchar("middleInitial", { length: 1 }),
  dateOfBirth: varchar("dateOfBirth", { length: 10 }), // YYYY-MM-DD
  ssn: varchar("ssn", { length: 11 }), // XXX-XX-XXXX
  idType: varchar("idType", { length: 50 }), // drivers_license, passport, state_id, military_id
  idNumber: varchar("idNumber", { length: 100 }),
  maritalStatus: varchar("maritalStatus", { length: 50 }), // single, married, divorced, widowed, domestic_partnership
  dependents: int("dependents").default(0),
  citizenshipStatus: varchar("citizenshipStatus", { length: 50 }), // us_citizen, permanent_resident
  
  // User profile fields - Employment & Financial
  employmentStatus: varchar("employmentStatus", { length: 50 }), // employed, self_employed, unemployed, retired
  employer: varchar("employer", { length: 255 }),
  monthlyIncome: int("monthlyIncome"), // in cents
  
  // User profile fields - Bankruptcy Information
  priorBankruptcy: int("priorBankruptcy").default(0), // 0 = no, 1 = yes
  bankruptcyDate: varchar("bankruptcyDate", { length: 10 }), // YYYY-MM-DD, optional
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * OTP codes for authentication (signup and login)
 */
export const otpCodes = mysqlTable("otpCodes", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 6 }).notNull(),
  purpose: mysqlEnum("purpose", ["signup", "login", "password_reset"]).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  verified: int("verified").default(0).notNull(), // 0 = not verified, 1 = verified
  attempts: int("attempts").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertOtpCode = typeof otpCodes.$inferInsert;

/**
 * Legal document acceptances tracking
 */
export const legalAcceptances = mysqlTable("legalAcceptances", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  loanApplicationId: int("loanApplicationId"),  // Optional, for loan-specific agreements
  documentType: mysqlEnum("documentType", [
    "terms_of_service",
    "privacy_policy",
    "loan_agreement",
    "esign_consent"
  ]).notNull(),
  documentVersion: varchar("documentVersion", { length: 20 }).notNull(),  // e.g., "1.0", "2.1"
  ipAddress: varchar("ipAddress", { length: 45 }),  // IPv4 or IPv6
  userAgent: text("userAgent"),
  acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
});

export type LegalAcceptance = typeof legalAcceptances.$inferSelect;
export type InsertLegalAcceptance = typeof legalAcceptances.$inferInsert;

/**
 * Loan applications submitted by users
 */
export const loanApplications = mysqlTable("loanApplications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Applicant information
  fullName: varchar("fullName", { length: 255 }).notNull(),
  middleInitial: varchar("middleInitial", { length: 1 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  dateOfBirth: varchar("dateOfBirth", { length: 10 }).notNull(), // YYYY-MM-DD
  ssn: varchar("ssn", { length: 11 }).notNull(), // XXX-XX-XXXX
  idType: varchar("idType", { length: 50 }).notNull(), // drivers_license, passport, state_id, military_id
  idNumber: varchar("idNumber", { length: 100 }).notNull(),
  maritalStatus: varchar("maritalStatus", { length: 50 }).notNull(), // single, married, divorced, widowed, domestic_partnership
  dependents: int("dependents").notNull().default(0),
  citizenshipStatus: varchar("citizenshipStatus", { length: 50 }).notNull(), // us_citizen, permanent_resident
  priorBankruptcy: int("priorBankruptcy").notNull().default(0), // 0 = no, 1 = yes
  bankruptcyDate: varchar("bankruptcyDate", { length: 10 }), // YYYY-MM-DD, null if no bankruptcy
  
  // Address
  street: varchar("street", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(), // US state code
  zipCode: varchar("zipCode", { length: 10 }).notNull(),
  
  // Employment information
  employmentStatus: mysqlEnum("employmentStatus", ["employed", "self_employed", "unemployed", "retired"]).notNull(),
  employer: varchar("employer", { length: 255 }),
  monthlyIncome: int("monthlyIncome").notNull(), // in cents
  
  // Loan details
  loanType: mysqlEnum("loanType", [
    "personal",
    "installment",
    "short_term",
    "auto",
    "home_equity",
    "heloc",
    "student",
    "business",
    "debt_consolidation",
    "mortgage",
    "private_money",
    "title",
    "credit_builder",
    "signature",
    "peer_to_peer"
  ]).notNull(),
  requestedAmount: int("requestedAmount").notNull(), // in cents
  loanPurpose: text("loanPurpose").notNull(),
  
  // Approval details
  approvedAmount: int("approvedAmount"), // in cents, null if not approved
  processingFeeAmount: int("processingFeeAmount"), // in cents, calculated after approval
  
  // Status tracking
  status: mysqlEnum("status", [
    "pending",        // Initial submission
    "under_review",   // Being reviewed by admin
    "approved",       // Approved, awaiting fee payment
    "fee_pending",    // Fee payment initiated
    "fee_paid",       // Fee confirmed paid
    "disbursed",      // Loan disbursed
    "rejected",       // Application rejected
    "cancelled"       // Cancelled by user
  ]).default("pending").notNull(),
  
  rejectionReason: text("rejectionReason"),
  adminNotes: text("adminNotes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  approvedAt: timestamp("approvedAt"),
  disbursedAt: timestamp("disbursedAt"),
});

export type LoanApplication = typeof loanApplications.$inferSelect;
export type InsertLoanApplication = typeof loanApplications.$inferInsert;

/**
 * System configuration for processing fees
 */
export const feeConfiguration = mysqlTable("feeConfiguration", {
  id: int("id").autoincrement().primaryKey(),
  
  // Fee calculation mode
  calculationMode: mysqlEnum("calculationMode", ["percentage", "fixed"]).default("percentage").notNull(),
  
  // Percentage mode settings (1.5% - 2.5%)
  percentageRate: int("percentageRate").default(200).notNull(), // stored as basis points (200 = 2.00%)
  
  // Fixed fee mode settings ($1.50 - $10.00)
  fixedFeeAmount: int("fixedFeeAmount").default(575).notNull(), // in cents (575 = $5.75)
  
  // Metadata
  isActive: int("isActive").default(1).notNull(), // 1 = active, 0 = inactive
  updatedBy: int("updatedBy"), // admin user id
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FeeConfiguration = typeof feeConfiguration.$inferSelect;
export type InsertFeeConfiguration = typeof feeConfiguration.$inferInsert;

/**
 * Payment records for processing fees
 */
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  loanApplicationId: int("loanApplicationId").notNull(),
  userId: int("userId").notNull(),
  
  // Payment details
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("USD").notNull(),
  
  // Payment provider details
  paymentProvider: mysqlEnum("paymentProvider", ["stripe", "authorizenet", "crypto"]).default("stripe").notNull(),
  paymentMethod: mysqlEnum("paymentMethod", ["card", "crypto"]).default("card").notNull(),
  
  // Card payment details (Authorize.net or Stripe)
  paymentIntentId: varchar("paymentIntentId", { length: 255 }), // Payment intent/transaction ID
  paymentMethodId: varchar("paymentMethodId", { length: 255 }), // Payment method ID
  cardLast4: varchar("cardLast4", { length: 4 }), // Last 4 digits of card
  cardBrand: varchar("cardBrand", { length: 20 }), // Visa, Mastercard, Amex, etc.
  
  // Cryptocurrency payment details
  cryptoCurrency: varchar("cryptoCurrency", { length: 10 }), // BTC, ETH, USDT, etc.
  cryptoAddress: varchar("cryptoAddress", { length: 255 }), // Wallet address for payment
  cryptoTxHash: varchar("cryptoTxHash", { length: 255 }), // Blockchain transaction hash
  cryptoAmount: varchar("cryptoAmount", { length: 50 }), // Amount in crypto (string for precision)
  
  // Status tracking
  status: mysqlEnum("status", [
    "pending",      // Payment initiated
    "processing",   // Payment being processed
    "succeeded",    // Payment successful
    "failed",       // Payment failed
    "cancelled"     // Payment cancelled
  ]).default("pending").notNull(),
  
  failureReason: text("failureReason"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

/**
 * Loan disbursement records
 */
export const disbursements = mysqlTable("disbursements", {
  id: int("id").autoincrement().primaryKey(),
  loanApplicationId: int("loanApplicationId").notNull(),
  userId: int("userId").notNull(),
  
  // Disbursement details
  amount: int("amount").notNull(), // in cents
  
  // Disbursement method selection
  disbursementMethod: mysqlEnum("disbursementMethod", [
    "ach",          // Automated Clearing House (1-3 days)
    "wire",         // Wire transfer (1 day)
    "check",        // Paper check (5-7 days)
    "paycard"       // Prepaid card (1-2 days)
  ]).default("ach").notNull(),
  
  // Bank account details (for ACH and Wire)
  accountHolderName: varchar("accountHolderName", { length: 255 }),
  accountNumber: varchar("accountNumber", { length: 50 }),
  routingNumber: varchar("routingNumber", { length: 20 }),
  accountType: mysqlEnum("accountType", ["checking", "savings"]),
  swiftCode: varchar("swiftCode", { length: 20 }), // For international wires
  bankName: varchar("bankName", { length: 255 }), // For wire transfers
  
  // Check details (for check disbursement)
  checkNumber: varchar("checkNumber", { length: 20 }),
  checkMailingAddress: text("checkMailingAddress"),
  checkPayeeName: varchar("checkPayeeName", { length: 255 }),
  checkMailedDate: timestamp("checkMailedDate"),
  
  // Tracking and delivery
  estimatedDeliveryDate: date("estimatedDeliveryDate"),
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  referenceNumber: varchar("referenceNumber", { length: 100 }),
  
  // Status tracking
  status: mysqlEnum("status", [
    "pending",      // Awaiting processing
    "processing",   // Being processed
    "in_transit",   // In delivery (checks, etc)
    "completed",    // Successfully disbursed
    "failed",       // Disbursement failed
    "reversed"      // Disbursement reversed
  ]).default("pending").notNull(),
  
  transactionId: varchar("transactionId", { length: 255 }), // External transaction reference
  failureReason: text("failureReason"),
  adminNotes: text("adminNotes"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
  initiatedBy: int("initiatedBy"), // admin user id
});

export type Disbursement = typeof disbursements.$inferSelect;
export type InsertDisbursement = typeof disbursements.$inferInsert;

/**
 * Fraud detection audit log
 * Tracks all fraud detection attempts, flags, and decisions
 */
export const fraudAuditLog = mysqlTable("fraudAuditLog", {
  id: int("id").autoincrement().primaryKey(),
  loanApplicationId: int("loanApplicationId").notNull(),
  userId: int("userId").notNull(),
  
  // Fraud detection details
  fraudScore: int("fraudScore").notNull(), // 0-100
  fraudFlags: text("fraudFlags").notNull(), // JSON array of detected flags
  
  // Fraud check results
  ssnDuplicate: int("ssnDuplicate").default(0).notNull(), // 0 = not flagged, 1 = flagged
  invalidSSNPattern: int("invalidSSNPattern").default(0).notNull(),
  invalidPhonePattern: int("invalidPhonePattern").default(0).notNull(),
  disposableEmail: int("disposableEmail").default(0).notNull(),
  recentApplication: int("recentApplication").default(0).notNull(),
  highLoanLeverageRatio: int("highLoanLeverageRatio").default(0).notNull(),
  recentBankruptcy: int("recentBankruptcy").default(0).notNull(),
  
  // Admin decision
  adminReview: mysqlEnum("adminReview", ["pending", "approved", "rejected", "manual_review"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  adminReviewedBy: int("adminReviewedBy"), // admin user id
  
  // Status
  finalDecision: mysqlEnum("finalDecision", ["pending", "approved", "rejected"]).default("pending").notNull(),
  
  // Timestamps
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type FraudAuditLog = typeof fraudAuditLog.$inferSelect;
export type InsertFraudAuditLog = typeof fraudAuditLog.$inferInsert;

/**
 * Required Documents for Loan Types
 * Tracks which documents are required for each loan type
 */
export const loanDocumentRequirements = mysqlTable("loanDocumentRequirements", {
  id: int("id").primaryKey().autoincrement(),
  loanType: varchar("loanType", { length: 50 }).notNull(),
  documentName: varchar("documentName", { length: 255 }).notNull(),
  description: text("description"),
  isRequired: tinyint("isRequired").default(1).notNull(), // 1 = required, 0 = optional
  category: varchar("category", { length: 100 }).notNull(), // e.g., "identity", "income", "assets", "property"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoanDocumentRequirement = typeof loanDocumentRequirements.$inferSelect;
export type InsertLoanDocumentRequirement = typeof loanDocumentRequirements.$inferInsert;

/**
 * User Submitted Documents
 * Tracks documents uploaded by users for their loan applications
 */
export const submittedDocuments = mysqlTable("submittedDocuments", {
  id: int("id").primaryKey().autoincrement(),
  loanApplicationId: int("loanApplicationId").notNull(),
  documentType: varchar("documentType", { length: 100 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 500 }).notNull(), // S3 URL
  fileSize: int("fileSize").notNull(), // in bytes
  mimeType: varchar("mimeType", { length: 50 }).notNull(),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "approved", "rejected", "needs_reupload"]).default("pending").notNull(),
  verifiedBy: int("verifiedBy"), // admin user id
  verifiedAt: timestamp("verifiedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SubmittedDocument = typeof submittedDocuments.$inferSelect;
export type InsertSubmittedDocument = typeof submittedDocuments.$inferInsert;

/**
 * Referral Program - User Referral Codes
 * Each user gets a unique referral code to share with others
 */
export const referralCodes = mysqlTable("referralCodes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // The user who owns/created the code
  code: varchar("code", { length: 16 }).notNull().unique(), // Unique referral code (e.g., "REF123ABC456")
  
  // Referral reward settings
  referrerRewardType: mysqlEnum("referrerRewardType", ["discount", "bonus_credit", "cash_bonus"]).default("cash_bonus").notNull(),
  referrerRewardAmount: int("referrerRewardAmount").notNull(), // in cents (e.g., 5000 = $50)
  
  refereeRewardType: mysqlEnum("refereeRewardType", ["discount", "bonus_credit", "cash_bonus"]).default("discount").notNull(),
  refereeRewardAmount: int("refereeRewardAmount").notNull(), // in cents (e.g., 2500 = $25 discount)
  
  // Status and tracking
  status: mysqlEnum("referralStatus", ["active", "inactive", "suspended"]).default("active").notNull(),
  totalReferrals: int("totalReferrals").default(0).notNull(), // Count of successful referrals
  totalRewardsEarned: int("totalRewardsEarned").default(0).notNull(), // Total rewards earned in cents
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  deactivatedAt: timestamp("deactivatedAt"),
});

export type ReferralCode = typeof referralCodes.$inferSelect;
export type InsertReferralCode = typeof referralCodes.$inferInsert;

/**
 * Referral Program - Referral Relationships
 * Tracks when a user signs up using a referral code
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referralCodeId: int("referralCodeId").notNull(), // Foreign key to referralCodes
  referrerId: int("referrerId").notNull(), // The user who referred (owner of code)
  refereeId: int("refereeId").notNull(), // The new user who was referred
  
  // Referral tracking
  referralSource: varchar("referralSource", { length: 100 }), // Where referral came from (email, social, etc)
  ipAddress: varchar("ipAddress", { length: 45 }), // IPv4 or IPv6 of referree signup
  
  // Referral completion status
  status: mysqlEnum("referralStatus", ["pending", "signed_up", "loan_applied", "loan_approved", "completed"]).default("signed_up").notNull(),
  
  // Rewards
  referrerRewardStatus: mysqlEnum("rewardStatus", ["pending", "earned", "paid", "cancelled"]).default("pending").notNull(),
  referrerRewardAmount: int("referrerRewardAmount").notNull(), // in cents
  referrerRewardPaidAt: timestamp("referrerRewardPaidAt"),
  
  refereeRewardStatus: mysqlEnum("rewardStatus", ["pending", "earned", "applied", "cancelled"]).default("pending").notNull(),
  refereeRewardAmount: int("refereeRewardAmount").notNull(), // in cents
  refereeRewardAppliedAt: timestamp("refereeRewardAppliedAt"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;