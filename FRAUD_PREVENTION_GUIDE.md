# Fraud Prevention & Data Validation Guide

## Overview
This guide outlines multi-layer validation strategies to prevent fraud, ensure data integrity, and protect against scams in the loan application process.

---

## 1. CLIENT-SIDE VALIDATION (Frontend - Real-time Feedback)

### 1.1 Format Validation
- **SSN Format**: XXX-XX-XXXX with pattern validation
- **Phone Format**: (XXX) XXX-XXXX with auto-formatting
- **Date of Birth**: MM/DD/YYYY with leap year validation
- **Email Format**: Valid RFC 5322 email format
- **ID Number**: Minimum length validation based on ID type

### 1.2 Logic Validation
- **Age Check**: Must be 18+ (calculated from DOB)
- **Phone Validity**: Must have exactly 10 digits (no 555 area code abuse)
- **Date Range Checks**: 
  - DOB must be in the past
  - Bankruptcy date must be before today
  - Bankruptcy date must be after 1970
- **Income Range**: $0 - $999,999/month (reasonable bounds)
- **Loan Amount**: $500 - $100,000 (within business limits)
- **Dependent Range**: 0-5+ (reasonable numbers)

### 1.3 Real-time Visual Feedback
- ✅ Green checkmark when field is valid
- ⚠️ Warning icon for suspicious patterns
- ❌ Red error message for failures
- Auto-formatting to guide user input

---

## 2. SERVER-SIDE VALIDATION (Backend - Security Layer)

### 2.1 Data Type & Format Validation
```typescript
// All fields must match expected types and formats
- fullName: string (2-255 chars, letters/spaces only)
- middleInitial: string (exactly 1 letter)
- ssn: string (XXX-XX-XXXX format)
- idNumber: string (5-100 chars)
- phone: string (phone format)
- email: string (RFC 5322 valid)
- dateOfBirth: YYYY-MM-DD format
- zipCode: 5-9 digits
```

### 2.2 Business Logic Validation
```typescript
// Verify data consistency and reasonableness
- Age >= 18 (calculated from DOB)
- Employment income > 0 if employed
- No future dates (DOB, bankruptcy date)
- Loan amount within limits ($500-$100,000)
- Address has valid state code
```

### 2.3 Uniqueness & Duplicate Checks
```typescript
// Prevent multiple applications from same person
- SSN uniqueness: Each SSN can only have 1 PENDING application
- Email uniqueness: User can only have 1 active application at a time
- Phone + Name combination: Check for duplicates
- Allow multiple applications only after 30 days + different terms
```

---

## 3. FRAUD DETECTION RULES

### 3.1 High-Risk Patterns to Flag
```
🚩 IMMEDIATE RED FLAGS:
1. SSN already exists in system (duplicate check)
2. Multiple applications from same email/phone within 24 hours
3. SSN that's all same digits (111-11-1111, 123-45-6789)
4. Phone number is obvious fake (000-000-0000)
5. Same applicant applying multiple times within 30 days

⚠️ WARNING FLAGS (review, don't block):
1. Loan amount > 10x monthly income (high leverage)
2. Loan amount < monthly income requirement
3. Bankruptcy filed within last 2 years
4. Multiple identity changes detected
5. Address changes within last 30 days
6. Negative/zero monthly income
7. Loan purpose vague or suspicious
8. Dependents > monthly income/1000
```

### 3.2 Suspicious Pattern Detection
```
🔍 PATTERNS TO MONITOR:
- Rapid-fire applications (same device/IP)
- Application peaks during off-hours
- High volume from single location
- Declining loan amounts (classic fraud pattern)
- Applicants with same address patterns
- Similar names but different SSNs
- Template-like or AI-generated content in loan purpose
```

---

## 4. EXTERNAL VERIFICATION SERVICES

### 4.1 Third-Party Validation (Recommended)
```
1. CREDIT BUREAUS (Equifax, Experian, TransUnion)
   - Pull credit report
   - Verify SSN matches credit history
   - Check for fraud alerts
   - Validate current address matches credit file

2. ID VERIFICATION SERVICES
   - Experian ID Verification API
   - Equifax Identity Verification
   - Idology by GBG
   - Verify ID type against national databases

3. PHONE VERIFICATION
   - Twilio Phone Verification
   - Validate phone is active/real
   - Check carrier type
   - Detect VOIP/virtual numbers

4. ADDRESS VERIFICATION
   - USPS Address Verification API
   - Validate address format
   - Check if residential/commercial
   - Flag PO boxes or commercial addresses

5. EMAIL VERIFICATION
   - Send verification email with token
   - Confirm email is active
   - Check for disposable email services
```

### 4.2 Fraud Risk Scoring
```
Use service like Sift Science, Stripe Radar, or Jumio
- Calculate fraud risk score (0-100)
- Automatic flagging for scores > 70
- Manual review for scores 50-70
- Auto-approve for scores < 30
```

---

## 5. DATABASE INTEGRITY CHECKS

### 5.1 Constraint Validation
```sql
-- Unique constraints
UNIQUE KEY `idx_ssn_status` (ssn, status)  -- One active per SSN
UNIQUE KEY `idx_email_user` (email, userId)  -- One per user

-- Check constraints
CHECK (age >= 18)
CHECK (monthlyIncome >= 0)
CHECK (requestedAmount BETWEEN 50000 AND 10000000)  -- in cents
CHECK (dateOfBirth > '1900-01-01')
CHECK (dateOfBirth < NOW())
```

### 5.2 Audit Logging
```
Log all changes with:
- User ID making the change
- Field changed and old/new values
- Timestamp
- IP address
- User agent
- Reason for change
```

---

## 6. IMPLEMENTATION CHECKLIST

### Phase 1: Immediate (Client + Server Validation)
- [x] Format validation on client-side
- [x] Format validation on server-side
- [x] Age verification (18+)
- [x] SSN pattern validation (no 000, 666, 9xx)
- [ ] Duplicate SSN check
- [ ] Duplicate application check (same user, 24 hours)
- [ ] Income range validation
- [ ] Loan amount range validation

### Phase 2: Enhanced (Database + Service Integration)
- [ ] UNIQUE constraints on SSN
- [ ] Add audit logging table
- [ ] Implement fraud risk scoring
- [ ] Integrate with credit bureaus
- [ ] Implement phone verification
- [ ] Implement email verification
- [ ] Add address verification

### Phase 3: Advanced (AI/ML Based)
- [ ] Anomaly detection
- [ ] Device fingerprinting
- [ ] IP geolocation analysis
- [ ] Behavioral analytics
- [ ] ML-based fraud scoring

---

## 7. QUICK WINS TO IMPLEMENT NOW

### 7.1 SSN Uniqueness Check
```typescript
// server/routers.ts
const existingApplication = await db.getLoanApplicationBySSN(input.ssn, "pending");
if (existingApplication) {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "An application with this SSN is already being processed"
  });
}
```

### 7.2 Duplicate Application Check
```typescript
const recentApplications = await db.getLoanApplicationsByUser(ctx.user.id);
const lastApplicationDate = recentApplications[0]?.createdAt;

if (lastApplicationDate && 
    (Date.now() - lastApplicationDate.getTime()) < 24 * 60 * 60 * 1000) {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "You can only submit one application per 24 hours"
  });
}
```

### 7.3 Income vs Debt Validation
```typescript
// Loan amount should not exceed 10x monthly income
const maxLoan = input.monthlyIncome * 10;
if (input.requestedAmount > maxLoan) {
  // Flag for manual review
  console.warn(`[FRAUD] Loan amount ${input.requestedAmount} > 10x income ${maxLoan}`);
  // Still allow but mark as requiring manual review
}
```

### 7.4 Email Verification
```typescript
// Send verification email after application submission
const verificationToken = crypto.randomBytes(32).toString('hex');
await db.createEmailVerification({
  email: input.email,
  token: verificationToken,
  expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
});

// Send via SendGrid
await sendVerificationEmail(input.email, verificationToken);
```

---

## 8. RECOMMENDED FRAUD SCORE CALCULATION

```typescript
function calculateFraudScore(applicationData) {
  let score = 0;
  
  // SSN checks (0-20 points)
  if (isSuspiciousSSN(applicationData.ssn)) score += 20;
  if (ssnExistsInDatabase(applicationData.ssn)) score += 15;
  
  // Age checks (0-10 points)
  if (applicationData.age < 21) score += 5;
  if (applicationData.age > 85) score += 5;
  
  // Income checks (0-15 points)
  if (applicationData.monthlyIncome === 0) score += 10;
  if (applicationData.monthlyIncome > 999999) score += 15;
  
  // Loan checks (0-20 points)
  if (applicationData.loanAmount > applicationData.monthlyIncome * 10) score += 15;
  if (applicationData.loanAmount < 500 && applicationData.loanPurpose.length < 20) score += 10;
  
  // Bankruptcy checks (0-15 points)
  if (applicationData.priorBankruptcy && daysSinceBankruptcy < 365) score += 15;
  
  // Application patterns (0-20 points)
  if (hasMultipleApplications24h) score += 20;
  if (isFromHighRiskLocation) score += 10;
  
  return Math.min(score, 100);
}
```

---

## 9. COMPLIANCE & LEGAL

### 9.1 Required Disclosures
- Explain what data is collected and why
- Explain credit check impact
- Explain how data is shared (credit bureaus, fraud services)
- Explain retention policies
- Provide data access/deletion requests

### 9.2 Fair Lending Practices
- Don't discriminate based on protected characteristics
- Document all decline reasons
- Provide appeal process
- Monitor for disparate impact
- Regular audits for bias

### 9.3 Data Privacy
- Encrypt SSN, ID numbers at rest
- Use HTTPS for all transmission
- Never log full SSN or ID numbers
- Implement access controls
- Regular security audits

---

## 10. TESTING THE VALIDATION

### Test Cases to Implement
```
✅ Valid Application
- Legitimate applicant with correct data
- Expected: Approved for processing

❌ SSN Duplicate
- Submit same SSN twice
- Expected: Second rejected with "SSN already in system"

❌ Invalid SSN Patterns
- SSN: 000-00-0000, 666-66-6666, 900-00-0000
- Expected: All rejected

❌ Age Violation
- DOB: 2010-01-01 (14 years old)
- Expected: "Must be 18+"

❌ Impossible Income
- Monthly Income: $999,999,999
- Expected: Rejected or flagged for review

❌ High Fraud Score
- Multiple red flags
- Expected: Flagged for manual review

✅ Borderline Case
- High leverage (6x income) but legitimate
- Expected: Flagged for review, not auto-rejected
```

---

## Next Steps

1. **Implement Phase 1 immediately** (database checks, duplicates, ranges)
2. **Add audit logging** for compliance
3. **Integrate credit bureau API** for verification
4. **Set up fraud monitoring dashboard**
5. **Establish manual review process** for flagged applications
6. **Regular fraud reports and analysis**

