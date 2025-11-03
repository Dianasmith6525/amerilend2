# Admin Fraud Monitoring Dashboard

## Overview

The admin fraud monitoring dashboard provides comprehensive tools for reviewing, managing, and monitoring fraudulent applications detected by the system's multi-layer fraud detection system.

---

## Dashboard Features

### 1. **Fraud Risk Tiers**

Three clear categories help admins quickly understand fraud risk levels:

#### High Risk (Score 80+) - AUTO-REJECTED
- **Status**: 🔴 Automatically Blocked
- **Action**: None required (system blocked automatically)
- **Why**: Multiple serious fraud indicators detected
- **Examples**:
  - Duplicate SSN in system
  - Invalid SSN pattern + Invalid phone + Disposable email
  - Loan > 10x monthly income
  - Combined fraud score indicates high probability of fraud

#### Medium Risk (Score 50-80) - MANUAL REVIEW
- **Status**: 🟡 Pending Admin Decision
- **Action**: Admin must review and approve/reject
- **Why**: Some concerns but not definitively fraudulent
- **Examples**:
  - Loan > 6x monthly income (but < 10x)
  - Recent bankruptcy (1-2 years old)
  - Vague loan purpose
  - Minor pattern anomalies
- **Admin Decision**: Context matters—may approve if explanation is reasonable

#### Low Risk (Score 0-50) - AUTO-APPROVED
- **Status**: 🟢 Normal Processing
- **Action**: None required (proceeds automatically)
- **Why**: Application passed all fraud checks
- **Examples**:
  - Clean applicant profile
  - Reasonable loan-to-income ratio
  - Complete information
  - No red flags detected

---

## Fraud Detection Factors Dashboard

### Automatic Blocks (✓ - Blocked Immediately)

These conditions instantly reject an application—no manual review possible:

1. **SSN Already in System**
   - Prevents duplicate applications with same SSN
   - Protects against identity theft attempts
   - Error shown to user: "SSN already being processed"

2. **Multiple Applications in 24 Hours**
   - Spam prevention: max 1 app per 24 hours per user
   - Prevents rapid-fire fraudulent submissions
   - Error shown to user: "You can only submit 1 app per 24 hours"

3. **Invalid SSN Pattern**
   - Blocks: 000-00-0000, 666-66-6666, 9xx-xx-xxxx
   - Blocks: Sequential (123-45-6789), All same digit
   - Error shown to user: "Invalid SSN format"

4. **Invalid Phone Number**
   - Must be valid 10-digit U.S. format
   - Blocks: Test numbers (555 area code)
   - Blocks: All zeros, all same digit
   - Error shown to user: "Invalid phone number"

5. **Disposable Email Address**
   - Blocks: tempmail.com, guerrillamail.com, 10minutemail.com, etc.
   - Requires permanent email (Gmail, Yahoo, Outlook, corporate)
   - Error shown to user: "Use permanent email address"

6. **Fraud Score > 80**
   - Calculated after all other checks pass
   - Auto-rejection threshold for combined fraud indicators
   - Logged for admin review

### Risk Factors (⚠️ - Contributes to Fraud Score)

These factors are analyzed and contribute to the overall fraud score (0-100):

1. **High Loan Leverage**
   - Requested loan > 6x monthly income: +10 points
   - Requested loan > 10x monthly income: +20 points
   - Example: $2,000/month income requesting $20,000 = 10x (suspicious)

2. **Recent Bankruptcy**
   - Bankruptcy filed < 1 year ago: +20 points
   - Bankruptcy filed 1-2 years ago: +10 points
   - Protects against desperate applicants with proven financial failure

3. **Age Concerns**
   - Too young (< 21): +5 points
   - Too old (> 85): +5 points
   - Helps identify minors or vulnerable elderly

4. **Income Concerns**
   - Zero income: +15 points
   - Very low income (< $1,000/month): +5 points
   - Helps identify unrealistic applications

5. **Suspicious Loan Purpose**
   - Too brief (< 20 characters): +10 points
   - High-pressure language ("urgent", "emergency", "immediate"): +5 points
   - Example: "help" (2 chars) = too brief
   - Example: "urgent need money immediately" = pressure language

6. **SSN Risk Factors**
   - Invalid pattern: +5-25 points
   - Duplicate SSN: +15 points
   - Covered above but contributes to score

---

## Fraud Monitoring UI Components

### Tab Structure

```
┌─────────────────────────────────────────────────────────┐
│ Loan Applications │ 🚨 Fraud Monitor │ Fee Configuration │
└─────────────────────────────────────────────────────────┘
```

### Fraud Monitor Tab Sections

#### 1. Risk Tier Cards
Three cards at top showing:
- **High Risk**: Score 80+ → AUTO-REJECTED
- **Medium Risk**: Score 50-80 → MANUAL REVIEW
- **Low Risk**: Score < 50 → AUTO-APPROVED

#### 2. Fraud Detection Factors Table
Left column:
- SSN already in system
- 2+ apps in 24 hours
- Invalid SSN pattern
- Invalid phone number

Right column:
- Disposable email address
- Loan > 6x monthly income
- Recent bankruptcy filing
- Incomplete information

#### 3. Pending Manual Review Section
Lists applications with fraud score 50-80 awaiting admin decision:
- Applicant name
- Fraud score (0-100)
- Detected flags
- Application date
- Action buttons (Approve / Reject)

---

## How to Use the Dashboard

### Step 1: Navigate to Fraud Monitor Tab
Click the "🚨 Fraud Monitor" tab in the admin dashboard

### Step 2: Understand Risk Tiers
Review the three risk tier cards to understand what action is needed

### Step 3: Check Detected Factors
Review what specific fraud indicators were detected

### Step 4: Review Flagged Applications
For applications with score 50-80:
- Click application to see full details
- Review fraud flags that triggered
- Decide: Approve (after review) or Reject

### Step 5: Make Decision
- **Approve**: Click "Approve" button—application proceeds to normal flow
- **Reject**: Click "Reject" button—provide reason, application is denied

---

## Fraud Score Examples

### Example 1: Clean Application ✅
```
Applicant: John Smith
Age: 35
Income: $5,000/month
Loan Requested: $15,000
Loan Purpose: "Home repairs needed"

Fraud Score Breakdown:
- SSN pattern: ✓ Valid (0 points)
- Age: ✓ Normal (0 points)
- Income: ✓ Reasonable (0 points)
- Loan ratio: 3x income ✓ (0 points)
- Purpose: Complete (0 points)
- Bankruptcy: None (0 points)

TOTAL FRAUD SCORE: 15/100 (LOW RISK) ✅ AUTO-APPROVED
```

### Example 2: Moderate Risk ⚠️
```
Applicant: Jane Doe
Age: 38
Income: $2,500/month
Loan Requested: $20,000
Loan Purpose: "Need money"
Bankruptcy: Yes (18 months ago)

Fraud Score Breakdown:
- SSN pattern: ✓ Valid (0 points)
- Age: ✓ Normal (0 points)
- Income: ✓ OK (0 points)
- Loan ratio: 8x income ⚠️ (+10 points)
- Purpose: Vague ⚠️ (+2 points)
- Bankruptcy: Recent ⚠️ (+10 points)

TOTAL FRAUD SCORE: 62/100 (MEDIUM RISK) ⚠️ MANUAL REVIEW
Actions: Admin reviews context. If person has recovered from bankruptcy, likely approve. Otherwise, reject.
```

### Example 3: High Risk 🚫
```
Applicant: Unknown Person
Age: 25
Income: $800/month
Loan Requested: $50,000
Loan Purpose: "urgent need"
SSN: 000-00-0000
Phone: (555) 123-4567

Fraud Score Breakdown:
- SSN pattern: Invalid ❌ (+25 points) [Also AUTO-BLOCKED]
- Phone pattern: Invalid ❌ (+10 points) [Also AUTO-BLOCKED]
- Age: Young ⚠️ (+5 points)
- Income: Very low ❌ (+15 points)
- Loan ratio: 62x income ❌ (+25 points)
- Purpose: Pressure language ❌ (+5 points)

TOTAL FRAUD SCORE: 85/100 (HIGH RISK) 🚫 AUTO-REJECTED
Status: Application blocked before reaching fraud score check (SSN + Phone invalid)
```

---

## Admin Decision Flow

### For Auto-Rejected Applications (Score 80+)
```
Application Submitted
    ↓
[Fraud Detection Checks]
    ↓
Score > 80 OR Auto-Block Triggered
    ↓
❌ Application Blocked
    ↓
User sees: "Application cannot be processed"
Admin sees: Application in rejected applications list with reason
```

### For Manual Review Applications (Score 50-80)
```
Application Submitted
    ↓
[Fraud Detection Checks]
    ↓
Score 50-80 (No Auto-Block)
    ↓
⚠️ Flagged for Manual Review
    ↓
Appears in "Pending Manual Review" section
    ↓
Admin Decision:
├─ Approve (after context review)
│  └─ Application proceeds to normal flow
└─ Reject (based on fraud concerns)
   └─ Application is denied
```

### For Auto-Approved Applications (Score < 50)
```
Application Submitted
    ↓
[Fraud Detection Checks]
    ↓
Score < 50
    ↓
✅ Auto-Approved
    ↓
User sees: "Application submitted successfully"
Admin sees: Application in approved applications list
Normal processing begins
```

---

## Backend Implementation Details

### New Database Table: fraudAuditLog

```sql
CREATE TABLE fraudAuditLog (
  id INT PRIMARY KEY AUTO_INCREMENT,
  loanApplicationId INT NOT NULL,
  userId INT NOT NULL,
  fraudScore INT NOT NULL (0-100),
  fraudFlags TEXT NOT NULL (JSON array),
  
  -- Individual fraud checks
  ssnDuplicate TINYINT(1),
  invalidSSNPattern TINYINT(1),
  invalidPhonePattern TINYINT(1),
  disposableEmail TINYINT(1),
  recentApplication TINYINT(1),
  highLoanLeverageRatio TINYINT(1),
  recentBankruptcy TINYINT(1),
  
  -- Admin review
  adminReview ENUM('pending', 'approved', 'rejected', 'manual_review'),
  adminNotes TEXT,
  adminReviewedBy INT,
  finalDecision ENUM('pending', 'approved', 'rejected'),
  
  -- Timestamps
  detectedAt TIMESTAMP,
  reviewedAt TIMESTAMP,
  createdAt TIMESTAMP
);

KEY: loanApplicationId (join with loans)
KEY: fraudScore (filter by risk level)
KEY: adminReview (find pending reviews)
```

### New Backend Routes

#### `fraud.getFlagged`
- **Purpose**: Get all applications pending fraud review
- **Auth**: Admin only
- **Input**: `{ minScore?: number }` (default 50)
- **Output**: Array of flagged applications with fraud details
- **Used by**: Fraud Monitor tab to populate pending review list

#### `fraud.getDetails`
- **Purpose**: Get detailed fraud analysis for one application
- **Auth**: Admin only
- **Input**: `{ applicationId: number }`
- **Output**: Full fraud audit log entry with breakdown
- **Used by**: Click on application to see fraud details

#### `fraud.approve`
- **Purpose**: Admin approves application despite fraud flags
- **Auth**: Admin only
- **Input**: `{ applicationId: number, adminNotes?: string }`
- **Output**: `{ success: true }`
- **Used by**: Approve button on flagged application

#### `fraud.reject`
- **Purpose**: Admin rejects application based on fraud
- **Auth**: Admin only
- **Input**: `{ applicationId: number, rejectionReason: string }`
- **Output**: `{ success: true }`
- **Used by**: Reject button on flagged application

### New Database Functions

#### `logFraudDetection()`
```typescript
logFraudDetection(
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
): Promise<void>
```
- Inserts fraud detection event into audit log
- Called after fraud detection completes
- Creates permanent record for compliance

#### `getFlaggedApplications()`
```typescript
getFlaggedApplications(
  fraudScoreThreshold: number = 50
): Promise<FlaggedApplication[]>
```
- Returns all applications with fraud score >= threshold
- Sorted by fraud score (highest first)
- Used by Fraud Monitor tab
- Only returns applications awaiting admin review

---

## Compliance & Audit Trail

### What Gets Logged?

Every fraud detection event creates a record:
1. Application ID
2. User ID
3. Fraud score (0-100)
4. Specific flags detected
5. Each individual fraud check result
6. Timestamp of detection
7. Admin decision (if applicable)
8. Admin notes
9. Admin ID who made decision
10. Timestamp of review

### Why Compliance Matters?

- **FCRA Compliance**: Track why applicants were rejected
- **Fair Lending**: Document objective fraud criteria
- **Dispute Resolution**: Reference specific fraud flags
- **Regulatory Audits**: Provide proof of anti-fraud measures
- **Pattern Analysis**: Identify emerging fraud trends

### Querying the Audit Log

```typescript
// Find all high-risk rejections in last 30 days
SELECT * FROM fraudAuditLog
WHERE fraudScore > 80
  AND detectedAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
ORDER BY fraudScore DESC;

// Find all applications admin rejected
SELECT * FROM fraudAuditLog
WHERE finalDecision = 'rejected'
  AND adminReviewedBy IS NOT NULL;

// Find most common fraud flags
SELECT fraudFlags, COUNT(*) as count
FROM fraudAuditLog
GROUP BY fraudFlags
ORDER BY count DESC;
```

---

## Best Practices for Admins

### ✅ DO:
1. **Review pending applications daily** - Don't let them pile up
2. **Document your decisions** - Add admin notes explaining approval/rejection
3. **Track trends** - Watch for new fraud patterns
4. **Be consistent** - Use similar criteria for similar applications
5. **Trust the system** - High scores usually indicate real fraud
6. **Look for context** - Some high scores may be legitimate (e.g., small business owner with spike income)

### ❌ DON'T:
1. **Override high scores lightly** - Score > 80 exists for a reason
2. **Ignore patterns** - If 10 apps with same SSN arrive, something's wrong
3. **Process without notes** - Always explain your decision
4. **Approve suspicious emails** - Disposable emails are red flag for reason
5. **Rush through reviews** - Take time to understand the risk

---

## Future Enhancements

### Phase 2: Third-Party Integrations
- [ ] Credit bureau verification (Equifax/Experian)
- [ ] ID verification service integration
- [ ] Phone number verification API
- [ ] Address verification service
- **Impact**: Reduce false positives, catch sophisticated fraud

### Phase 3: Machine Learning
- [ ] Train fraud detection model on historical data
- [ ] Behavioral anomaly detection
- [ ] Device fingerprinting
- [ ] Real-time score updates
- **Impact**: 95%+ fraud detection rate

### Phase 4: Enhanced Dashboard
- [ ] Real-time alerts for high-risk applications
- [ ] Admin dashboard widgets and KPIs
- [ ] Fraud trend charts and graphs
- [ ] Bulk action tools
- **Impact**: Faster admin response, better decision-making

---

## Support & Troubleshooting

### "No applications showing in Pending Manual Review"
**Possible Reasons**:
- No applications have fraud score 50-80
- All flagged applications have been reviewed
- System is working correctly (fraud prevention is strong)

**What to do**: 
- Check "Loan Applications" tab for all submissions
- Run test with known fraud patterns to verify system works

### "High fraud score but looks legitimate"
**Possible Reasons**:
- Applicant has unusual but valid financial situation
- Legitimate reason for large loan request
- Recent bankruptcy with good recovery story

**What to do**:
- Review applicant details in full application
- Make judgment call based on context
- Add admin notes explaining decision
- Click "Approve" to proceed

### "Getting too many false positives"
**Solutions**:
1. Adjust fraud score thresholds in settings
2. Review which fraud factors are triggering
3. Disable certain checks if they're not relevant
4. Contact support for custom configuration

---

## Key Metrics to Monitor

### Daily Metrics
- Applications received
- Applications auto-approved
- Applications flagged for review
- Applications auto-rejected
- Avg fraud score

### Weekly Metrics
- Admin approval rate
- Admin rejection rate
- Avg review time
- New fraud patterns detected

### Monthly Metrics
- Total fraud prevention rate
- Most common fraud flags
- Admin workload
- System accuracy trends

---

**Your fraud monitoring system is now operational! 🚀**

Review applications daily and adjust thresholds as needed based on your experience.

