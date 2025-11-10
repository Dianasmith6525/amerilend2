import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql, { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { 
  InsertUser, 
  users,
  loanApplications,
  LoanApplication,
  InsertLoanApplication,
  feeConfiguration,
  FeeConfiguration,
  InsertFeeConfiguration,
  payments,
  Payment,
  InsertPayment,
  disbursements,
  Disbursement,
  InsertDisbursement,
  fraudAuditLog,
  InsertFraudAuditLog,
  referralCodes,
  ReferralCode,
  InsertReferralCode,
  referrals,
  Referral,
  InsertReferral,
  submittedDocuments,
  InsertSubmittedDocument,
  SubmittedDocument
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;
let _isConnected = false;
let _lastHealthCheck = 0;
const HEALTH_CHECK_INTERVAL = 30000; // 30 seconds

// Get raw MySQL connection pool for direct SQL queries
export function getPool(): mysql.Pool | null {
  if (!_pool && process.env.DATABASE_URL) {
    try {
      const dbUrl = new URL(process.env.DATABASE_URL.replace('mysql://', 'http://'));
      
      _pool = mysql.createPool({
        host: dbUrl.hostname,
        port: parseInt(dbUrl.port) || 3306,
        user: dbUrl.username,
        password: dbUrl.password,
        database: dbUrl.pathname.substring(1),
        ssl: false,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 60000,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
      });
      
      console.log('[Database] Pool created');
    } catch (error) {
      console.warn("[Database] Failed to create pool:", error);
      _pool = null;
    }
  }
  return _pool;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      // Parse the DATABASE_URL to extract connection details
      const dbUrl = new URL(process.env.DATABASE_URL.replace('mysql://', 'http://'));
      
      // Create connection pool with SSL enabled for TiDB Cloud
      // Must use mysql2/promise for proper async support
      const pool = mysql.createPool({
        host: dbUrl.hostname,
        port: parseInt(dbUrl.port) || 3306,
        user: dbUrl.username,
        password: dbUrl.password,
        database: dbUrl.pathname.substring(1), // Remove leading slash
        ssl: {
          rejectUnauthorized: true
        },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 60000, // 60 seconds timeout
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
      });
      
      // Test connection and enable auto-reconnect
      console.log('[Database] Testing connection...');
      try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        console.log('[Database] ✅ Connected successfully to TiDB Cloud!');
        _isConnected = true;
        _lastHealthCheck = Date.now();
      } catch (testError: any) {
        console.error('[Database] ⚠️ Initial connection test failed:', testError.message);
        console.log('[Database] Will retry on next query...');
        _isConnected = false;
      }
      
      // Handle pool errors
      pool.on('error', (err: any) => {
        console.error('[Database] Pool error:', err.message);
        _isConnected = false;
        if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'ECONNRESET') {
          console.log('[Database] Connection lost, will auto-reconnect on next query');
          // Clear the pool to force reconnection
          _db = null;
          _pool = null;
        }
      });
      
      console.log('[Database] ✅ Pool initialized with auto-reconnect');
      _db = drizzle(pool as any);
    } catch (error: any) {
      console.error("[Database] Failed to initialize:", error.message);
      _db = null;
    }
  }
  return _db;
}

// Health check function - call periodically to maintain connection
export async function healthCheck(): Promise<boolean> {
  const now = Date.now();
  
  // Skip if recently checked
  if (_isConnected && (now - _lastHealthCheck) < HEALTH_CHECK_INTERVAL) {
    return true;
  }
  
  try {
    const db = await getDb();
    if (!db) {
      _isConnected = false;
      return false;
    }
    
    // Simple query to test connection - just try to query a simple table
    const { loanApplications } = await import("../drizzle/schema");
    await db.select().from(loanApplications).limit(1);
    _isConnected = true;
    _lastHealthCheck = now;
    return true;
  } catch (error: any) {
    console.error('[Database] Health check failed:', error.message);
    _isConnected = false;
    
    // Force reconnection on next getDb call
    if (error.code === 'PROTOCOL_CONNECTION_LOST' || 
        error.code === 'ECONNRESET' || 
        error.message?.includes('Connection lost')) {
      console.log('[Database] Forcing reconnection...');
      _db = null;
      _pool = null;
    }
    
    return false;
  }
}

// Get connection status
export function isDbConnected(): boolean {
  return _isConnected;
}

// Force reconnection
export async function reconnectDb(): Promise<void> {
  console.log('[Database] Forcing reconnection...');
  _db = null;
  _pool = null;
  _isConnected = false;
  await getDb();
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    // Handle emailVerified as a separate field (since it's numeric/int)
    if (user.emailVerified !== undefined) {
      values.emailVerified = user.emailVerified;
      updateSet.emailVerified = user.emailVerified;
    }

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by email: database not available");
    return undefined;
  }

  try {
    // Ensure email is provided and valid
    if (!email || email.trim().length === 0) {
      console.warn("[Database] getUserByEmail: email is empty");
      return undefined;
    }

    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Error querying user by email:", error);
    // Log additional context
    console.error("[Database] Email parameter:", email);
    throw error;
  }
}

/**
 * Update user's email verification token and expiry
 */
export async function setEmailVerificationToken(
  userId: number,
  token: string,
  expiryMinutes: number = 30
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot set email verification token: database not available");
    return;
  }

  try {
    const expiryTime = new Date(Date.now() + expiryMinutes * 60 * 1000);
    
    await db.update(users)
      .set({
        emailVerificationToken: token,
        emailVerificationTokenExpiry: expiryTime,
      })
      .where(eq(users.id, userId));
      
    console.log(`[Database] Email verification token set for user ${userId}`);
  } catch (error) {
    console.error("[Database] Error setting email verification token:", error);
    throw error;
  }
}

/**
 * Verify email using verification token
 */
export async function verifyEmailByToken(token: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot verify email by token: database not available");
    return false;
  }

  try {
    // Find user with this token
    const result = await db.select()
      .from(users)
      .where(eq(users.emailVerificationToken, token))
      .limit(1);

    if (result.length === 0) {
      console.log("[Database] No user found with verification token");
      return false;
    }

    const user = result[0];

    // Check if token has expired
    if (
      !user.emailVerificationTokenExpiry ||
      new Date() > user.emailVerificationTokenExpiry
    ) {
      console.log(`[Database] Verification token expired for user ${user.id}`);
      return false;
    }

    // Mark email as verified
    const now = new Date();
    await db.update(users)
      .set({
        emailVerified: 1,
        emailVerifiedAt: now,
        emailVerificationToken: null,
        emailVerificationTokenExpiry: null,
      })
      .where(eq(users.id, user.id));

    console.log(`[Database] ✅ Email verified for user ${user.id}`);
    return true;
  } catch (error) {
    console.error("[Database] Error verifying email by token:", error);
    throw error;
  }
}

/**
 * Verify email using OTP code (links to existing OTP system)
 */
export async function verifyEmailByOTP(
  email: string,
  code: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot verify email by OTP: database not available");
    return false;
  }

  try {
    // Find user
    const userResult = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (userResult.length === 0) {
      console.log("[Database] No user found with email:", email);
      return false;
    }

    const user = userResult[0];

    // Check OTP (assumes otpCodes table exists and has been properly verified)
    // This would be handled by the OTP verification logic in routers
    // Here we just mark the user as verified once OTP check passes elsewhere

    const now = new Date();
    await db.update(users)
      .set({
        emailVerified: 1,
        emailVerifiedAt: now,
      })
      .where(eq(users.id, user.id));

    console.log(`[Database] ✅ Email verified for user ${user.id} via OTP`);
    return true;
  } catch (error) {
    console.error("[Database] Error verifying email by OTP:", error);
    throw error;
  }
}

/**
 * Check if user's email is verified
 */
export async function isEmailVerified(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot check email verification: database not available");
    return false;
  }

  try {
    const result = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      return false;
    }

    return result[0].emailVerified === 1;
  } catch (error) {
    console.error("[Database] Error checking email verification:", error);
    return false;
  }
}

export async function getAdminUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get admin users: database not available");
    return [];
  }

  try {
    const result = await db.select().from(users).where(eq(users.role, "admin"));
    return result;
  } catch (error) {
    console.error("[Database] Error querying admin users:", error);
    return [];
  }
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  try {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) {
    console.error("[Database] Error querying user by id:", error);
    throw error;
  }
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update password: database not available");
    return;
  }

  await db.update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId));
  
  console.log(`[Database] Password updated for user ID: ${userId}`);
}

// ============================================
// Loan Application Queries
// ============================================

export async function createLoanApplication(data: InsertLoanApplication) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(loanApplications).values(data);
  return result;
}

export async function getLoanApplicationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(loanApplications).where(eq(loanApplications.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLoanApplicationByReferenceNumber(referenceNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(loanApplications).where(eq(loanApplications.applicationReferenceNumber, referenceNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getLoanApplicationsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(loanApplications).where(eq(loanApplications.userId, userId)).orderBy(desc(loanApplications.createdAt));
}

export async function getAllLoanApplications() {
  const db = await getDb();
  if (!db) return [];
  
  // Join with users table to get complete borrower information
  const result = await db.select({
    // Loan application fields
    id: loanApplications.id,
    userId: loanApplications.userId,
    loanType: loanApplications.loanType,
    requestedAmount: loanApplications.requestedAmount,
    approvedAmount: loanApplications.approvedAmount,
    loanPurpose: loanApplications.loanPurpose,
    status: loanApplications.status,
    adminNotes: loanApplications.adminNotes,
    rejectionReason: loanApplications.rejectionReason,
    processingFeeAmount: loanApplications.processingFeeAmount,
    approvedAt: loanApplications.approvedAt,
    disbursedAt: loanApplications.disbursedAt,
    createdAt: loanApplications.createdAt,
    updatedAt: loanApplications.updatedAt,
    
    // User fields - Basic Info
    fullName: loanApplications.fullName,
    email: loanApplications.email,
    phone: loanApplications.phone,
    middleInitial: loanApplications.middleInitial,
    
    // User fields - Identity
    ssn: loanApplications.ssn,
    dateOfBirth: loanApplications.dateOfBirth,
    idType: loanApplications.idType,
    idNumber: loanApplications.idNumber,
    maritalStatus: loanApplications.maritalStatus,
    dependents: loanApplications.dependents,
    citizenshipStatus: loanApplications.citizenshipStatus,
    
    // User fields - Address
    street: loanApplications.street,
    city: loanApplications.city,
    state: loanApplications.state,
    zipCode: loanApplications.zipCode,
    
    // User fields - Employment & Financial
    employmentStatus: loanApplications.employmentStatus,
    employer: loanApplications.employer,
    monthlyIncome: loanApplications.monthlyIncome,
    
    // User fields - Financial History
    priorBankruptcy: loanApplications.priorBankruptcy,
    bankruptcyDate: loanApplications.bankruptcyDate,
  }).from(loanApplications).orderBy(desc(loanApplications.createdAt));

  // Debug log first result
  if (result.length > 0) {
    console.log('[getAllLoanApplications] First app from DB:', {
      id: result[0].id,
      fullName: result[0].fullName,
      requestedAmount: result[0].requestedAmount,
      requestedType: typeof result[0].requestedAmount,
      monthlyIncome: result[0].monthlyIncome,
      incomeType: typeof result[0].monthlyIncome,
    });
  }

  return result;
}

export async function updateLoanApplicationStatus(
  id: number,
  status: LoanApplication["status"],
  additionalData?: Partial<LoanApplication>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(loanApplications)
    .set({ status, ...additionalData, updatedAt: new Date() })
    .where(eq(loanApplications.id, id));
}

// ============================================
// Fee Configuration Queries
// ============================================

export async function getActiveFeeConfiguration() {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(feeConfiguration)
    .where(eq(feeConfiguration.isActive, 1))
    .orderBy(desc(feeConfiguration.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createFeeConfiguration(data: InsertFeeConfiguration) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Deactivate all existing configurations
  await db.update(feeConfiguration).set({ isActive: 0 });
  
  // Insert new active configuration
  const result = await db.insert(feeConfiguration).values({ ...data, isActive: 1 });
  return result;
}

export async function updateFeeConfiguration(id: number, data: Partial<FeeConfiguration>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(feeConfiguration)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(feeConfiguration.id, id));
}

// ============================================
// Payment Queries
// ============================================

export async function createPayment(data: InsertPayment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(payments).values(data);
  
  // Drizzle's insert() doesn't return the inserted record
  // We need to query it back. Get the most recent payment for this application
  const inserted = await db.select().from(payments)
    .where(eq(payments.loanApplicationId, data.loanApplicationId))
    .orderBy(desc(payments.createdAt))
    .limit(1);
  
  return inserted[0] || result;
}

export async function getPaymentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(payments).where(eq(payments.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPaymentsByLoanApplicationId(loanApplicationId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(payments)
    .where(eq(payments.loanApplicationId, loanApplicationId))
    .orderBy(desc(payments.createdAt));
}

export async function getPaymentByTransactionId(transactionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(payments)
    .where(eq(payments.paymentIntentId, transactionId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPaymentByCryptoChargeId(chargeId: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(payments)
    .where(eq(payments.paymentIntentId, chargeId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePaymentStatus(
  id: number,
  status: Payment["status"],
  additionalData?: Partial<Payment>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(payments)
    .set({ status, ...additionalData, updatedAt: new Date() })
    .where(eq(payments.id, id));
}

// ============================================
// Disbursement Queries
// ============================================

export async function createDisbursement(data: InsertDisbursement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(disbursements).values(data);
  return result;
}

export async function getDisbursementById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(disbursements).where(eq(disbursements.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getDisbursementByLoanApplicationId(loanApplicationId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(disbursements)
    .where(eq(disbursements.loanApplicationId, loanApplicationId))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDisbursementStatus(
  id: number,
  status: Disbursement["status"],
  additionalData?: Partial<Disbursement>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(disbursements)
    .set({ status, ...additionalData, updatedAt: new Date() })
    .where(eq(disbursements.id, id));
}

// ============================================
// FRAUD PREVENTION & VALIDATION FUNCTIONS
// ============================================

/**
 * Check if SSN already has an active (pending/under_review) application
 */
export async function checkSSNDuplicate(ssn: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(loanApplications)
    .where(
      eq(loanApplications.ssn, ssn)
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * Check for duplicate applications from same user within timeframe
 */
export async function checkRecentApplications(userId: number, hoursBack: number = 24) {
  const db = await getDb();
  if (!db) return [];
  
  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  
  const result = await db.select().from(loanApplications)
    .where(
      eq(loanApplications.userId, userId)
    );
  
  return result.filter(app => app.createdAt > cutoffTime);
}

/**
 * Check for duplicate applications with same phone and name
 */
export async function checkPhoneNameDuplicate(phone: string, fullName: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(loanApplications)
    .where(
      eq(loanApplications.phone, phone)
    )
    .limit(5);
  
  // Check for exact or similar name matches
  return result.filter(app => 
    app.fullName.toLowerCase() === fullName.toLowerCase() ||
    app.fullName.toLowerCase().split(' ')[0] === fullName.toLowerCase().split(' ')[0]
  );
}

/**
 * Calculate fraud risk score based on application data
 */
export function calculateFraudScore(applicationData: {
  ssn: string;
  dateOfBirth: string;
  monthlyIncome: number;
  requestedAmount: number;
  loanPurpose: string;
  priorBankruptcy: boolean;
  bankruptcyDate?: string;
}): { score: number; flags: string[] } {
  let score = 0;
  const flags: string[] = [];
  
  // SSN checks (0-25 points)
  const ssnPrefix = applicationData.ssn.substring(0, 3);
  if (ssnPrefix === "000" || ssnPrefix === "666" || ssnPrefix.startsWith("9")) {
    score += 25;
    flags.push("Invalid SSN pattern");
  }
  
  // Age checks (0-10 points)
  const birthDate = new Date(applicationData.dateOfBirth.replace(/-/g, '/'));
  const age = new Date().getFullYear() - birthDate.getFullYear();
  
  if (age < 21) {
    score += 5;
    flags.push("Applicant under 21 years old");
  }
  if (age > 85) {
    score += 5;
    flags.push("Applicant over 85 years old");
  }
  
  // Income checks (0-20 points)
  if (applicationData.monthlyIncome === 0) {
    score += 15;
    flags.push("Zero monthly income declared");
  }
  if (applicationData.monthlyIncome < 1000) {
    score += 5;
    flags.push("Income very low");
  }
  
  // Loan checks (0-25 points)
  const loanToIncomeRatio = applicationData.requestedAmount / (applicationData.monthlyIncome * 100);
  if (loanToIncomeRatio > 10) {
    score += 20;
    flags.push(`Loan amount ${loanToIncomeRatio.toFixed(1)}x monthly income (very high)`);
  } else if (loanToIncomeRatio > 6) {
    score += 10;
    flags.push(`Loan amount ${loanToIncomeRatio.toFixed(1)}x monthly income (high)`);
  }
  
  // Loan purpose checks (0-15 points)
  if (applicationData.loanPurpose.length < 20) {
    score += 10;
    flags.push("Loan purpose description too brief");
  }
  const suspiciousWords = ["urgent", "emergency", "quick", "immediate", "desperate"];
  if (suspiciousWords.some(word => applicationData.loanPurpose.toLowerCase().includes(word))) {
    score += 5;
    flags.push("Loan purpose uses high-pressure language");
  }
  
  // Bankruptcy checks (0-20 points)
  if (applicationData.priorBankruptcy) {
    const bankruptcyDate = new Date(applicationData.bankruptcyDate || "");
    const daysSince = (new Date().getTime() - bankruptcyDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSince < 365) {
      score += 20;
      flags.push("Bankruptcy filed within last year");
    } else if (daysSince < 730) {
      score += 10;
      flags.push("Bankruptcy filed within last 2 years");
    }
  }
  
  return { score: Math.min(score, 100), flags };
}

/**
 * Validate suspicious SSN patterns
 */
export function isSuspiciousSSN(ssn: string): boolean {
  // Remove formatting
  const digits = ssn.replace(/\D/g, "");
  
  // Check for invalid patterns
  const invalidPatterns = [
    /^000/, // Starts with 000
    /^666/, // Starts with 666
    /^9/,   // Starts with 9
    /^(\d)\1{8}$/, // All same digit (111111111)
    /^12345/, // Sequential (123456789)
  ];
  
  return invalidPatterns.some(pattern => pattern.test(digits));
}

/**
 * Validate phone number
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  
  // Must be 10 digits
  if (digits.length !== 10) return false;
  
  // Cannot be all same digits
  if (/^(\d)\1{9}$/.test(digits)) return false;
  
  // Cannot be obvious test number (555 area code is reserved for fictional use)
  if (/^555/.test(digits)) return false;
  
  // Area code cannot start with 0 or 1
  if (/^[01]/.test(digits)) return false;
  
  return true;
}

/**
 * Validate email is not a disposable/temporary email service
 */
export function isDisposableEmail(email: string): boolean {
  const disposableDomains = [
    "tempmail", "guerrillamail", "mailinator", "10minutemail",
    "throwaway", "tempmail.com", "sharklasers.com", "grr.la",
    "spam4.me", "temp-mail.org"
  ];
  
  const domain = email.split("@")[1].toLowerCase();
  return disposableDomains.some(d => domain.includes(d));
}

/**
 * Log fraud detection event to audit table
 */
export async function logFraudDetection(
  loanApplicationId: number,
  userId: number,
  fraudScore: number,
  fraudFlags: string[],
  detectionDetails: {
    ssnDuplicate?: boolean;
    invalidSSNPattern?: boolean;
    invalidPhonePattern?: boolean;
    disposableEmail?: boolean;
    recentApplication?: boolean;
    highLoanLeverageRatio?: boolean;
    recentBankruptcy?: boolean;
  }
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  try {
    const { fraudAuditLog } = await import("../drizzle/schema");
    
    await db.insert(fraudAuditLog).values({
      loanApplicationId,
      userId,
      fraudScore,
      fraudFlags: JSON.stringify(fraudFlags),
      ssnDuplicate: detectionDetails.ssnDuplicate ? 1 : 0,
      invalidSSNPattern: detectionDetails.invalidSSNPattern ? 1 : 0,
      invalidPhonePattern: detectionDetails.invalidPhonePattern ? 1 : 0,
      disposableEmail: detectionDetails.disposableEmail ? 1 : 0,
      recentApplication: detectionDetails.recentApplication ? 1 : 0,
      highLoanLeverageRatio: detectionDetails.highLoanLeverageRatio ? 1 : 0,
      recentBankruptcy: detectionDetails.recentBankruptcy ? 1 : 0,
      adminReview: "pending",
      finalDecision: "pending"
    });
  } catch (error) {
    console.error("[Fraud Audit Log] Error:", error);
  }
}

/**
 * Get flagged applications for admin review
 */
export async function getFlaggedApplications(fraudScoreThreshold: number = 50): Promise<Array<{
  id: number;
  userId: number;
  fullName: string;
  email: string;
  loanAmount: number;
  fraudScore: number;
  fraudFlags: string[];
  createdAt: Date;
}> | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const { fraudAuditLog, loanApplications } = await import("../drizzle/schema");
    
    const result = await db
      .select({
        id: loanApplications.id,
        userId: loanApplications.userId,
        fullName: loanApplications.fullName,
        email: loanApplications.email,
        loanAmount: loanApplications.requestedAmount,
        fraudScore: fraudAuditLog.fraudScore,
        fraudFlags: fraudAuditLog.fraudFlags,
        createdAt: loanApplications.createdAt
      })
      .from(fraudAuditLog)
      .innerJoin(loanApplications, eq(fraudAuditLog.loanApplicationId, loanApplications.id))
      .where(eq(fraudAuditLog.adminReview, "pending"))
      .orderBy(desc(fraudAuditLog.fraudScore));
    
    return result.map(r => ({
      ...r,
      fraudFlags: JSON.parse(r.fraudFlags as string) as string[],
      loanAmount: Number(r.loanAmount)
    }));
  } catch (error) {
    console.error("[Get Flagged Applications] Error:", error);
    return null;
  }
}

// ==========================================
// USER PROFILE FUNCTIONS
// ==========================================

/**
 * Update user profile information
 */
export async function updateUser(userId: number, data: Partial<{
  name?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  // NEW PROFILE FIELDS:
  middleInitial?: string;
  dateOfBirth?: string;
  ssn?: string;
  idType?: string;
  idNumber?: string;
  maritalStatus?: string;
  dependents?: number;
  citizenshipStatus?: string;
  employmentStatus?: string;
  employer?: string;
  monthlyIncome?: number;
  priorBankruptcy?: number;
  bankruptcyDate?: string;
}>) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    return true;
  } catch (error) {
    console.error("[Update User] Error:", error);
    return false;
  }
}

/**
 * Update user role (admin only)
 */
export async function updateUserRole(userId: number, role: 'user' | 'admin') {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    await db
      .update(users)
      .set({ role })
      .where(eq(users.id, userId));
    
    console.log(`[DB] Updated user ${userId} role to ${role}`);
    return { success: true };
  } catch (error) {
    console.error("[Update User Role] Error:", error);
    throw error;
  }
}

/**
 * Get comprehensive user statistics
 */
export async function getUserStats(userId: number) {
  try {
    const db = await getDb();
    if (!db) return {
      totalApplications: 0,
      approvedLoans: 0,
      pendingApplications: 0,
      totalLoaned: 0,
    };

    // Get all user's applications
    const apps = await db
      .select()
      .from(loanApplications)
      .where(eq(loanApplications.userId, userId));

    const totalApplications = apps.length;
    const approvedLoans = apps.filter(a => a.status === "approved" || a.status === "fee_paid" || a.status === "disbursed").length;
    const pendingApplications = apps.filter(a => a.status === "pending" || a.status === "under_review").length;
    const totalLoaned = apps
      .filter(a => a.status === "disbursed")
      .reduce((sum, a) => sum + (a.approvedAmount || 0), 0);

    return {
      totalApplications,
      approvedLoans,
      pendingApplications,
      totalLoaned,
    };
  } catch (error) {
    console.error("[Get User Stats] Error:", error);
    return {
      totalApplications: 0,
      approvedLoans: 0,
      pendingApplications: 0,
      totalLoaned: 0,
    };
  }
}

/**
 * Get user's recent activity
 */
export async function getUserActivity(userId: number, limit: number = 10) {
  try {
    const db = await getDb();
    if (!db) return [];

    const applications = await db
      .select()
      .from(loanApplications)
      .where(eq(loanApplications.userId, userId))
      .orderBy(desc(loanApplications.createdAt))
      .limit(limit);

    return applications.map(app => ({
      id: app.id,
      type: "loan_application",
      title: `${app.loanType} Loan Application`,
      description: `Amount: $${(app.requestedAmount / 100).toFixed(2)} - Status: ${app.status}`,
      status: app.status,
      amount: app.requestedAmount,
      date: app.createdAt,
      loanType: app.loanType,
    }));
  } catch (error) {
    console.error("[Get User Activity] Error:", error);
    return [];
  }
}

/**
 * User notification preferences
 */
/**
 * Update user preferences
 */
export async function updateUserPreferences(userId: number, preferences: {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  marketingEmails?: boolean;
}) {
  try {
    const pool = getPool();
    if (!pool) return false;

    // Convert boolean to int (0 or 1)
    const data: any = {};
    if (preferences.emailNotifications !== undefined) {
      data.emailNotifications = preferences.emailNotifications ? 1 : 0;
    }
    if (preferences.smsNotifications !== undefined) {
      data.smsNotifications = preferences.smsNotifications ? 1 : 0;
    }
    if (preferences.marketingEmails !== undefined) {
      data.marketingEmails = preferences.marketingEmails ? 1 : 0;
    }

    // Insert or update preferences
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO userPreferences (userId, emailNotifications, smsNotifications, marketingEmails)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         emailNotifications = VALUES(emailNotifications),
         smsNotifications = VALUES(smsNotifications),
         marketingEmails = VALUES(marketingEmails)`,
      [
        userId,
        data.emailNotifications ?? 1,
        data.smsNotifications ?? 1,
        data.marketingEmails ?? 0
      ]
    );

    console.log(`[User Preferences] Updated for user ${userId}:`, preferences);
    return true;
  } catch (error) {
    console.error("[Update User Preferences] Error:", error);
    return false;
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: number) {
  try {
    const pool = getPool();
    if (!pool) {
      return {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: false,
      };
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM userPreferences WHERE userId = ?',
      [userId]
    );

    if (rows.length === 0) {
      // Create default preferences
      await updateUserPreferences(userId, {});
      return {
        emailNotifications: true,
        smsNotifications: false,
        marketingEmails: false,
      };
    }

    const prefs = rows[0];
    return {
      emailNotifications: prefs.emailNotifications === 1,
      smsNotifications: prefs.smsNotifications === 1,
      marketingEmails: prefs.marketingEmails === 1,
    };
  } catch (error) {
    console.error("[Get User Preferences] Error:", error);
    return {
      emailNotifications: true,
      smsNotifications: false,
      marketingEmails: false,
    };
  }
}

/**
 * REFERRAL PROGRAM FUNCTIONS
 */

/**
 * Generate a unique referral code
 */
function generateReferralCode(): string {
  const prefix = "REF";
  const randomPart = Math.random().toString(36).substring(2, 14).toUpperCase();
  return `${prefix}${randomPart}`;
}

/**
 * Create a referral code for a user
 */
export async function createReferralCode(
  userId: number,
  referrerRewardAmount: number = 5000, // $50
  refereeRewardAmount: number = 2500   // $25
): Promise<ReferralCode | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const code = generateReferralCode();

    // Check if user already has an active referral code
    const existingCode = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, userId))
      .limit(1);

    if (existingCode.length > 0) {
      console.log(`[Referral] User ${userId} already has referral code: ${existingCode[0].code}`);
      return existingCode[0];
    }

    const newCode = await db.insert(referralCodes).values({
      userId,
      code,
      referrerRewardType: "cash_bonus",
      referrerRewardAmount,
      refereeRewardType: "discount",
      refereeRewardAmount,
      status: "active",
    });

    console.log(`[Referral] Created referral code for user ${userId}: ${code}`);
    
    const createdCode = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);

    return createdCode[0] || null;
  } catch (error) {
    console.error("[Create Referral Code] Error:", error);
    return null;
  }
}

/**
 * Get user's referral code
 */
export async function getUserReferralCode(userId: number): Promise<ReferralCode | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const code = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, userId))
      .limit(1);

    return code[0] || null;
  } catch (error) {
    console.error("[Get User Referral Code] Error:", error);
    return null;
  }
}

/**
 * Get referral code by code string
 */
export async function getReferralCodeByCode(code: string): Promise<ReferralCode | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.code, code))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Get Referral Code By Code] Error:", error);
    return null;
  }
}

/**
 * Record a new referral when someone signs up with a referral code
 */
export async function recordReferral(
  referralCodeId: number,
  referrerId: number,
  refereeId: number,
  referralSource?: string,
  ipAddress?: string
): Promise<Referral | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    // Get the referral code to get reward amounts
    const codeRecord = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.id, referralCodeId))
      .limit(1);

    if (!codeRecord.length) {
      console.error(`[Record Referral] Referral code ${referralCodeId} not found`);
      return null;
    }

    const code = codeRecord[0];

    // Create referral record
    const referralRecord = await db.insert(referrals).values({
      referralCodeId,
      referrerId,
      refereeId,
      referralSource: referralSource || "direct",
      ipAddress,
      status: "signed_up",
      referrerRewardStatus: "pending",
      referrerRewardAmount: code.referrerRewardAmount,
      refereeRewardStatus: "pending",
      refereeRewardAmount: code.refereeRewardAmount,
    });

    console.log(`[Record Referral] Created referral for referrer ${referrerId}, referee ${refereeId}`);

    // Get the created referral
    const created = await db
      .select()
      .from(referrals)
      .where(eq(referrals.id, referralRecord[0].insertId as any))
      .limit(1);

    return created[0] || null;
  } catch (error) {
    console.error("[Record Referral] Error:", error);
    return null;
  }
}

/**
 * Get referrals made by a user (people they referred)
 */
export async function getUserReferrals(referrerId: number): Promise<Referral[]> {
  try {
    const db = await getDb();
    if (!db) return [];

    const result = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, referrerId));

    return result;
  } catch (error) {
    console.error("[Get User Referrals] Error:", error);
    return [];
  }
}

/**
 * Get referral that brought in a user (people who referred them)
 */
export async function getUserReferrer(refereeId: number): Promise<Referral | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const result = await db
      .select()
      .from(referrals)
      .where(eq(referrals.refereeId, refereeId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("[Get User Referrer] Error:", error);
    return null;
  }
}

/**
 * Update referral status when loan is applied
 */
export async function updateReferralStatus(
  referralId: number,
  newStatus: "loan_applied" | "loan_approved" | "completed"
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db
      .update(referrals)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(referrals.id, referralId));

    console.log(`[Update Referral Status] Updated referral ${referralId} to ${newStatus}`);
    return true;
  } catch (error) {
    console.error("[Update Referral Status] Error:", error);
    return false;
  }
}

/**
 * Mark referral rewards as earned (ready to be paid/applied)
 */
export async function markReferralRewardsEarned(referralId: number): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    await db
      .update(referrals)
      .set({
        referrerRewardStatus: "earned",
        refereeRewardStatus: "earned",
        status: "completed",
        updatedAt: new Date(),
      })
      .where(eq(referrals.id, referralId));

    // Also update the referral code's total rewards
    const referral = await db
      .select()
      .from(referrals)
      .where(eq(referrals.id, referralId))
      .limit(1);

    if (referral.length > 0) {
      const ref = referral[0];
      // Increment referrer's total rewards
      await db
        .update(referralCodes)
        .set({
          totalRewardsEarned: ref.referrerRewardAmount,
          totalReferrals: ref.referrerRewardAmount + 1,
          updatedAt: new Date(),
        })
        .where(eq(referralCodes.id, ref.referralCodeId));
    }

    console.log(`[Mark Referral Rewards Earned] Marked rewards as earned for referral ${referralId}`);
    return true;
  } catch (error) {
    console.error("[Mark Referral Rewards Earned] Error:", error);
    return false;
  }
}

/**
 * Get referral statistics for a user
 */
export async function getReferralStats(userId: number): Promise<{
  code: string | null;
  totalReferrals: number;
  totalEarnings: number;
  pendingRewards: number;
  paidRewards: number;
}> {
  try {
    const db = await getDb();
    if (!db) return { code: null, totalReferrals: 0, totalEarnings: 0, pendingRewards: 0, paidRewards: 0 };

    // Get user's referral code
    const codeRecord = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userId, userId))
      .limit(1);

    const code = codeRecord[0]?.code || null;

    // Get all referrals made by this user
    const userReferrals = await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId));

    const totalReferrals = userReferrals.length;
    let totalEarnings = 0;
    let pendingRewards = 0;
    let paidRewards = 0;

    userReferrals.forEach(ref => {
      totalEarnings += ref.referrerRewardAmount;
      if (ref.referrerRewardStatus === "pending") {
        pendingRewards += ref.referrerRewardAmount;
      } else if (ref.referrerRewardStatus === "paid") {
        paidRewards += ref.referrerRewardAmount;
      }
    });

    return {
      code,
      totalReferrals,
      totalEarnings,
      pendingRewards,
      paidRewards,
    };
  } catch (error) {
    console.error("[Get Referral Stats] Error:", error);
    return { code: null, totalReferrals: 0, totalEarnings: 0, pendingRewards: 0, paidRewards: 0 };
  }
}

/**
 * Insert a submitted document record for identity verification
 * Stores document metadata and base64 data URL for storage/verification
 */
export async function insertSubmittedDocument(data: InsertSubmittedDocument) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const result = await db.insert(submittedDocuments).values(data);
    console.log(`[DB] Inserted submitted document for application ${data.loanApplicationId}, type: ${data.documentType}`);
    return result;
  } catch (error) {
    console.error("[Insert Submitted Document] Error:", error);
    throw error;
  }
}

/**
 * Get all submitted documents for a loan application
 */
export async function getSubmittedDocumentsByApplicationId(applicationId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const docs = await db
      .select()
      .from(submittedDocuments)
      .where(eq(submittedDocuments.loanApplicationId, applicationId));
    return docs;
  } catch (error) {
    console.error("[Get Submitted Documents] Error:", error);
    return [];
  }
}

/**
 * Get submitted documents with application and verifier context for admin review
 */
export async function getSubmittedDocumentsForAdmin(status?: SubmittedDocument["verificationStatus"] | "all") {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const baseQuery = db
      .select({
        id: submittedDocuments.id,
        loanApplicationId: submittedDocuments.loanApplicationId,
        documentType: submittedDocuments.documentType,
        fileName: submittedDocuments.fileName,
        fileUrl: submittedDocuments.fileUrl,
        fileSize: submittedDocuments.fileSize,
        mimeType: submittedDocuments.mimeType,
        uploadedAt: submittedDocuments.uploadedAt,
        verificationStatus: submittedDocuments.verificationStatus,
        notes: submittedDocuments.notes,
        verifiedBy: submittedDocuments.verifiedBy,
        verifiedAt: submittedDocuments.verifiedAt,
        applicantName: loanApplications.fullName,
        applicantEmail: loanApplications.email,
        applicantPhone: loanApplications.phone,
        applicationStatus: loanApplications.status,
        applicationCreatedAt: loanApplications.createdAt,
        verifierName: users.name,
        verifierEmail: users.email,
      })
      .from(submittedDocuments)
      .leftJoin(loanApplications, eq(submittedDocuments.loanApplicationId, loanApplications.id))
      .leftJoin(users, eq(submittedDocuments.verifiedBy, users.id));

    if (status && status !== "all") {
      return await baseQuery
        .where(eq(submittedDocuments.verificationStatus, status))
        .orderBy(desc(submittedDocuments.uploadedAt));
    }

    return await baseQuery.orderBy(desc(submittedDocuments.uploadedAt));
  } catch (error) {
    console.error("[Get Submitted Documents For Admin] Error:", error);
    return [];
  }
}

/**
 * Update document verification status/notes from the admin panel
 */
export async function updateSubmittedDocumentVerification(
  documentId: number,
  status: SubmittedDocument["verificationStatus"],
  notes?: string,
  verifierId?: number | null,
) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const payload: Partial<SubmittedDocument> = {
      verificationStatus: status,
      notes: notes?.trim() ? notes.trim() : null,
      verifiedBy: verifierId ?? null,
      verifiedAt: verifierId ? new Date() : null,
    };

    await db
      .update(submittedDocuments)
      .set(payload)
      .where(eq(submittedDocuments.id, documentId));

    console.log(`[DB] Updated document ${documentId} verification status -> ${status}`);
    return { success: true };
  } catch (error) {
    console.error("[Update Submitted Document Verification] Error:", error);
    throw error;
  }
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const allUsers = await db.select().from(users);
    return allUsers;
  } catch (error) {
    console.error("[Get All Users] Error:", error);
    return [];
  }
}

/**
 * Get all payments (admin only)
 */
export async function getAllPayments() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const { payments } = await import("../drizzle/schema");
    const allPayments = await db.select().from(payments);
    return allPayments;
  } catch (error) {
    console.error("[Get All Payments] Error:", error);
    return [];
  }
}

/**
 * Get payments by user ID
 */
export async function getPaymentsByUserId(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const { payments } = await import("../drizzle/schema");
    const userPayments = await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId));
    
    return userPayments;
  } catch (error) {
    console.error("[Get Payments By User ID] Error:", error);
    return [];
  }
}

/**
 * Get a single submitted document by ID
 */
export async function getSubmittedDocumentById(documentId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db
      .select()
      .from(submittedDocuments)
      .where(eq(submittedDocuments.id, documentId))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error(`[Get Submitted Document By ID] Error:`, error);
    return null;
  }
}

/**
 * Update document file data after reupload
 */
export async function updateSubmittedDocumentFile(
  documentId: number,
  data: {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
    verificationStatus: string;
    uploadedAt: Date;
  }
) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(submittedDocuments)
      .set({
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
        verificationStatus: data.verificationStatus as any,
        uploadedAt: data.uploadedAt,
        // Clear previous verification data since it's a new upload
        verifiedBy: null,
        verifiedAt: null,
        notes: null,
      })
      .where(eq(submittedDocuments.id, documentId));

    console.log(`[DB] Updated document ${documentId} file data after reupload`);
    return { success: true };
  } catch (error) {
    console.error(`[Update Submitted Document File] Error:`, error);
    throw error;
  }
}

/**
 * Update document status (for admin approve/reject/request reupload)
 */
export async function updateSubmittedDocumentStatus(
  documentId: number,
  status: 'approved' | 'rejected' | 'needs_reupload',
  adminNote?: string
) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db
      .update(submittedDocuments)
      .set({
        verificationStatus: status as any,
        notes: adminNote || null,
        verifiedAt: new Date(),
      })
      .where(eq(submittedDocuments.id, documentId));

    console.log(`[DB] Updated document ${documentId} status to ${status}`);
    return { success: true };
  } catch (error) {
    console.error(`[Update Submitted Document Status] Error:`, error);
    throw error;
  }
}

/**
 * Get all documents (admin only)
 */
export async function getAllDocuments() {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    const allDocs = await db
      .select()
      .from(submittedDocuments)
      .orderBy(desc(submittedDocuments.uploadedAt));
    
    return allDocs;
  } catch (error) {
    console.error("[Get All Documents] Error:", error);
    return [];
  }
}

/**
 * Update document verification (alias for consistency)
 */
export async function updateDocumentVerification(
  documentId: number,
  status: 'approved' | 'rejected' | 'needs_reupload',
  verifierId: number,
  notes?: string
) {
  return updateSubmittedDocumentVerification(documentId, status, notes, verifierId);
}

/**
 * Generate email verification token and store in database
 */
export async function generateEmailVerificationToken(applicationId: number): Promise<string> {
  const crypto = await import('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const expiryTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
  
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  
  const { loanApplications } = await import('../drizzle/schema');
  
  await db.update(loanApplications)
    .set({
      emailVerificationToken: token,
      emailVerificationTokenExpiry: expiryTime,
    })
    .where(eq(loanApplications.id, applicationId));
  
  return token;
}

/**
 * Verify email with token
 */
export async function verifyEmailToken(applicationId: number, token: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  
  const { loanApplications } = await import('../drizzle/schema');
  
  // Get the application
  const application = await db.query.loanApplications.findFirst({
    where: eq(loanApplications.id, applicationId)
  });
  
  if (!application) return false;
  
  // Check if token matches and is not expired
  if (application.emailVerificationToken !== token) return false;
  
  const now = new Date();
  if (application.emailVerificationTokenExpiry && application.emailVerificationTokenExpiry < now) {
    return false; // Token expired
  }
  
  // Mark email as verified
  await db.update(loanApplications)
    .set({
      emailVerified: 1,
      emailVerificationToken: null,
      emailVerificationTokenExpiry: null,
      emailVerifiedAt: now,
    })
    .where(eq(loanApplications.id, applicationId));
  
  return true;
}

/**
 * Check if email is verified for a loan application
 */
export async function isApplicationEmailVerified(applicationId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');
  
  const { loanApplications } = await import('../drizzle/schema');
  
  const application = await db.query.loanApplications.findFirst({
    where: eq(loanApplications.id, applicationId)
  });
  
  return application?.emailVerified === 1;
}

/**
 * Encrypt and store a disbursement with sensitive field encryption
 */
export async function createEncryptedDisbursement(data: InsertDisbursement): Promise<void> {
  const { encryptFields, SENSITIVE_DISBURSEMENT_FIELDS } = await import('./_core/encryption');
  
  // Encrypt sensitive fields
  const encryptedData = encryptFields(data, SENSITIVE_DISBURSEMENT_FIELDS as any);
  
  // Track which fields were encrypted
  encryptedData.encryptedFields = SENSITIVE_DISBURSEMENT_FIELDS.filter(field => 
    (data as any)[field] !== null && (data as any)[field] !== undefined
  ) as any;

  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  await db.insert(disbursements).values(encryptedData);
}

/**
 * Retrieve and decrypt a disbursement
 */
export async function getDecryptedDisbursement(id: number): Promise<Disbursement | undefined> {
  const { decryptFields } = await import('./_core/encryption');
  
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  const result = await db.query.disbursements.findFirst({
    where: eq(disbursements.id, id)
  });

  if (!result || !result.encryptedFields) return result;

  // Decrypt the encrypted fields
  return decryptFields(result, result.encryptedFields as any);
}

/**
 * Encrypt and store a payment with sensitive field encryption
 */
export async function createEncryptedPayment(data: InsertPayment): Promise<void> {
  const { encryptFields, SENSITIVE_PAYMENT_FIELDS } = await import('./_core/encryption');
  
  // Encrypt sensitive fields
  const encryptedData = encryptFields(data, SENSITIVE_PAYMENT_FIELDS as any);
  
  // Track which fields were encrypted
  encryptedData.encryptedFields = SENSITIVE_PAYMENT_FIELDS.filter(field => 
    (data as any)[field] !== null && (data as any)[field] !== undefined
  ) as any;

  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  await db.insert(payments).values(encryptedData);
}

/**
 * Retrieve and decrypt a payment
 */
export async function getDecryptedPayment(id: number): Promise<Payment | undefined> {
  const { decryptFields } = await import('./_core/encryption');
  
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  const result = await db.query.payments.findFirst({
    where: eq(payments.id, id)
  });

  if (!result || !result.encryptedFields) return result;

  // Decrypt the encrypted fields
  return decryptFields(result, result.encryptedFields as any);
}

/**
 * Get all payments eligible for retry
 * Checks: isRetryEligible, nextRetryAt <= now, retryCount < maxRetries, status is retryable
 */
export async function getRetryEligiblePayments(): Promise<Payment[]> {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  const now = new Date();
  
  const results = await db.query.payments.findMany({
    where: (payments, { and, eq, lte, lt }) => and(
      eq(payments.isRetryEligible, 1),
      lte(payments.nextRetryAt, now),
      lt(payments.retryCount, payments.maxRetries),
      // Status must be "failed" or "declined" to be retryable
      eq(payments.status, 'failed' as any)
    )
  });

  return results || [];
}

/**
 * Get count of failed payments for a loan in the past X hours
 * Used for fraud pattern detection
 */
export async function getPaymentFailureCount(loanId: number, hoursBack: number = 24): Promise<number> {
  const pool = getPool();
  if (!pool) throw new Error('Database pool not initialized');

  const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) as count FROM payments 
     WHERE loan_id = ? AND status IN ('failed', 'declined') AND created_at >= ?`,
    [loanId, cutoffTime]
  );

  return rows[0]?.count || 0;
}

/**
 * Get current fraud score for an application
 * Used to determine if payment should be retried
 */
export async function getApplicationFraudScore(loanId: number): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  const [rows] = await (getPool() as any).query<RowDataPacket[]>(
    `SELECT SUM(fraud_score) as total_score FROM fraud_audit_log 
     WHERE loan_id = ? AND status = 'active'`,
    [loanId]
  );

  return rows[0]?.total_score || 0;
}

/**
 * Find payment by Stripe charge ID
 * Used for webhook processing
 */
export async function getPaymentByStripeChargeId(chargeId: string): Promise<Payment | undefined> {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  const result = await db.query.payments.findFirst({
    where: eq(payments.stripeChargeId, chargeId)
  });

  return result;
}

/**
 * Find payment by Authorize.Net transaction ID
 * Used for webhook processing
 */
export async function getPaymentByAuthorizeNetTransactionId(txId: string): Promise<Payment | undefined> {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  const result = await db.query.payments.findFirst({
    where: eq(payments.authorizeNetTransactionId, txId)
  });

  return result;
}

/**
 * Update payment retry fields
 * Called after a retry attempt
 */
export async function updatePaymentRetry(
  paymentId: number, 
  retryCount: number, 
  nextRetryAt: Date | null,
  isRetryEligible: boolean = true
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error('Database not initialized');

  await db
    .update(payments)
    .set({
      retryCount,
      lastRetryAt: new Date(),
      nextRetryAt,
      isRetryEligible: isRetryEligible ? 1 : 0,
      updatedAt: new Date()
    })
    .where(eq(payments.id, paymentId));
}
