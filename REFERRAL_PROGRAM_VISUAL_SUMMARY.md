# Referral Program - Visual Summary

## 🎯 What Users See

### On Dashboard - New "Referrals" Tab
```
┌─────────────────────────────────────────┐
│   Dashboard  [Applications] [Referrals] │ ← NEW
└─────────────────────────────────────────┘

┌─ Your Referral Code ─────────────────────┐
│ ┌─────────────────────────────────────┐  │
│ │ REF123ABC456        [COPY]          │  │ ← Your Code
│ ├─────────────────────────────────────┤  │
│ │ https://amerilend.com/signup?ref... │  │
│ │                         [COPY LINK] │  │ ← Share Link
│ ├─────────────────────────────────────┤  │
│ │ [Share via Email] [Share on Social] │  │ ← Share Buttons
│ ├─────────────────────────────────────┤  │
│ │ YOU EARN: $50 | THEY SAVE: $25      │  │ ← Rewards
│ └─────────────────────────────────────┘  │
└──────────────────────────────────────────┘

┌─ Your Statistics ────────────────────────┐
│ ┌────────┐ ┌──────────┐ ┌─────────────┐ │
│ │Total   │ │  Total   │ │   Pending   │ │
│ │Referr. │ │ Earnings │ │   Rewards   │ │
│ │   12   │ │  $600    │ │    $200     │ │
│ └────────┘ └──────────┘ └─────────────┘ │
└──────────────────────────────────────────┘

┌─ Your Referrals (List) ──────────────────┐
│ Status | Date | Your Reward | Status    │
│─────────────────────────────────────────│
│ ✓Approved | Oct 15 | $50 | PAID        │
│ →Applied  | Oct 20 | $50 | EARNED      │
│ ∘ Signup  | Oct 22 | $50 | PENDING     │
└──────────────────────────────────────────┘

┌─ How It Works ───────────────────────────┐
│ ① Share Your Code                       │
│ ② They Sign Up                          │
│ ③ They Apply for Loan                   │
│ ④ You Earn $50 (They Save $25)         │
└──────────────────────────────────────────┘
```

---

## 📊 System Architecture

### Frontend → Backend → Database

```
USER DASHBOARD
    ↓
[Referrals Tab]
    ↓
ReferralComponent.tsx
    ↓
tRPC Routes
    ├→ referrals.getMyCode
    ├→ referrals.getStats
    ├→ referrals.getMyReferrals
    ├→ referrals.validateCode
    └→ referrals.recordReferral
    ↓
server/db.ts Functions
    ├→ createReferralCode()
    ├→ getUserReferralCode()
    ├→ getReferralCodeByCode()
    ├→ recordReferral()
    ├→ getUserReferrals()
    ├→ getReferralStats()
    └→ updateReferralStatus()
    ↓
DATABASE
    ├→ referralCodes Table
    └→ referrals Table
```

---

## 💾 Data Flow

### When User Logs In First Time
```
User Logs In
    ↓
Dashboard loads
    ↓
referrals.getMyCode called
    ↓
No code exists?
    ↓
System auto-generates code
    ↓
REF123ABC456 displayed
    ↓
User can share immediately
```

### When Someone Signs Up With Code
```
Friend visits: /signup?referral=REF123ABC456
    ↓
validationCode endpoint validates code
    ↓
Friend creates account (User B created)
    ↓
recordReferral endpoint called
    ↓
Database records:
    - referralCodeId: 1
    - referrerId: User A
    - refereeId: User B
    - status: signed_up
    - rewards: pending
    ↓
$25 discount applied to User B
    ↓
User A sees User B in referrals list
```

### When Referrer's Reward Is Earned
```
User B (referee) applies for loan
    ↓
updateReferralStatus called
    ↓
Referral status → "loan_applied"
    ↓
User B's loan gets approved by admin
    ↓
updateReferralStatus called
    ↓
Referral status → "loan_approved"
    ↓
markReferralRewardsEarned called
    ↓
Database updates:
    - referrerRewardStatus: "earned"
    - refereeRewardStatus: "earned"
    - status: "completed"
    ↓
User A dashboard shows:
    - Reward Status: "earned"
    - Can be paid out
```

---

## 🔄 Referral Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                   REFERRAL LIFECYCLE                        │
└─────────────────────────────────────────────────────────────┘

STEP 1: CODE GENERATION
┌──────────────────────┐
│ User A Logs In       │
│ Referral Code Gen    │
│ REF123ABC456 Created │
│ Status: active       │
└──────────────────────┘
           ↓
STEP 2: CODE SHARING
┌──────────────────────┐
│ User A Shares Code   │
│ Via:                 │
│ - Email              │
│ - Link               │
│ - Social             │
│ - Copy/Paste         │
└──────────────────────┘
           ↓
STEP 3: SIGNUP
┌──────────────────────┐
│ Friend signs up      │
│ Uses code: REF...    │
│ Account created      │
│ Referral recorded    │
│ Status: signed_up    │
│ Reward: pending      │
│ $25 discount applied │
└──────────────────────┘
           ↓
STEP 4: LOAN APPLICATION
┌──────────────────────┐
│ User B applies       │
│ for loan             │
│ Status: loan_applied │
│ $25 discount shows   │
│ in fee calculation   │
└──────────────────────┘
           ↓
STEP 5: ADMIN REVIEW
┌──────────────────────┐
│ Admin reviews        │
│ Admin approves       │
│ Status: approved     │
└──────────────────────┘
           ↓
STEP 6: REWARDS EARNED
┌──────────────────────┐
│ Referrer Reward:     │
│ Status: earned       │
│ Amount: $50          │
│ Ready to pay         │
│                      │
│ Referee Reward:      │
│ Status: earned       │
│ Discount: $25        │
└──────────────────────┘
           ↓
STEP 7: PAYOUT
┌──────────────────────┐
│ Referrer: $50 PAID   │
│ Referee: $25 Applied │
│ Status: completed    │
│ Visible in both      │
│ dashboards           │
└──────────────────────┘
```

---

## 📱 UI Components

### ReferralComponent Features

```
┌─────────────────────────────────────────────────────────┐
│           REFERRAL COMPONENT STRUCTURE                  │
└─────────────────────────────────────────────────────────┘

1. CODE DISPLAY SECTION
   ├─ Your Code: REF123ABC456
   │  └─ [Copy] Button
   ├─ Shareable Link
   │  └─ [Copy] Button
   └─ Reward Info ($50 / $25)

2. SHARE BUTTONS
   ├─ [Share via Email]
   └─ [Share on Social]

3. STATISTICS CARDS
   ├─ Total Referrals: 12
   ├─ Total Earnings: $600
   └─ Pending Rewards: $200

4. REFERRALS TABLE
   ├─ Status (signed_up, loan_applied, approved, completed)
   ├─ Date
   ├─ Your Reward Amount
   └─ Reward Status (pending, earned, paid)

5. HOW IT WORKS
   ├─ 4-step visual guide
   └─ Color-coded numbers (1, 2, 3, 4)
```

---

## 🗄️ Database Structure

### referralCodes Table
```
┌──────────────────────────────────────────────┐
│              REFERRAL_CODES                  │
├──────────────────────────────────────────────┤
│ id (PK)           │ 1                        │
│ userId (FK)       │ 123                      │
│ code (UNIQUE)     │ REF123ABC456             │
│ referrer_reward   │ cash_bonus               │
│ referrer_amount   │ 5000 (cents = $50)       │
│ referee_reward    │ discount                 │
│ referee_amount    │ 2500 (cents = $25)       │
│ status            │ active                   │
│ total_referrals   │ 12                       │
│ total_earnings    │ 60000 (cents = $600)     │
│ created_at        │ 2025-01-15               │
│ updated_at        │ 2025-01-20               │
│ deactivated_at    │ NULL                     │
└──────────────────────────────────────────────┘
```

### referrals Table
```
┌──────────────────────────────────────────────┐
│                 REFERRALS                    │
├──────────────────────────────────────────────┤
│ id (PK)               │ 1001                 │
│ referral_code_id (FK) │ 1                    │
│ referrer_id (FK)      │ 123 (User A)         │
│ referee_id (FK)       │ 456 (User B)         │
│ referral_source       │ email                │
│ ip_address            │ 192.168.1.1          │
│ status                │ loan_approved        │
│ referrer_reward_st    │ earned               │
│ referrer_reward_amt   │ 5000 ($50)           │
│ referrer_reward_paid  │ 2025-01-25           │
│ referee_reward_st     │ earned               │
│ referee_reward_amt    │ 2500 ($25)           │
│ referee_reward_apply  │ 2025-01-25           │
│ created_at            │ 2025-01-15           │
│ updated_at            │ 2025-01-25           │
└──────────────────────────────────────────────┘
```

---

## 🔌 API Endpoints (tRPC)

### Public Endpoints
```
GET  /api/trpc/referrals.validateCode
     Input: { code: "REF123ABC456" }
     Returns: { valid: boolean, rewards: {...} }

POST /api/trpc/referrals.recordReferral
     Input: { code, refereeUserId, ipAddress }
     Returns: { success: true, referralId: 1 }
```

### Protected Endpoints (Auth Required)
```
GET  /api/trpc/referrals.getMyCode
     Returns: { code, rewards, referralCodeId }

GET  /api/trpc/referrals.getStats
     Returns: { totalReferrals, totalEarnings, pending }

GET  /api/trpc/referrals.getMyReferrals
     Returns: [{ id, status, amount, date }, ...]
```

### Admin Endpoints
```
GET  /api/trpc/referrals.adminList
     Returns: All referrals in system
```

---

## 📈 Reward States

### For Referrer (Person Sharing)
```
Reward States:
  pending   → Waiting for referee to complete application
  earned    → Referee's loan approved, reward confirmed
  paid      → Reward paid to referrer's account
  cancelled → Referral cancelled or disputed
```

### For Referee (Person Referred)
```
Reward States:
  pending   → Waiting for completion
  earned    → Loan approved, reward confirmed
  applied   → Discount applied to account
  cancelled → Referral cancelled or disputed
```

### Overall Referral Status
```
Progression:
  pending          → Just recorded
  signed_up        → Referee created account
  loan_applied     → Referee applied for loan
  loan_approved    → Loan approved by admin
  completed        → Rewards distributed
```

---

## 🔒 Security Flow

```
VALIDATION LAYER
     ↓
Check code exists → Check code active → Check not self-referral
     ↓
RECORDING LAYER
     ↓
Record IP → Track source → Create relationship → Set rewards
     ↓
VERIFICATION LAYER
     ↓
Only pay when loan approved → Validate amounts → Admin can suspend
     ↓
PAYMENT LAYER
     ↓
Mark as earned → Process payout → Confirm completion
```

---

## 🚀 Deployment Flow

```
1. DEVELOPMENT
   ├─ Write code
   ├─ Test locally
   └─ Review changes

2. DATABASE
   ├─ Run migration: pnpm run db:push
   └─ Verify tables created

3. TESTING
   ├─ Test code generation
   ├─ Test signup with code
   ├─ Test referral tracking
   └─ Test reward calculations

4. STAGING
   ├─ Deploy to staging
   ├─ End-to-end testing
   └─ Monitor logs

5. PRODUCTION
   ├─ Deploy to production
   ├─ Monitor performance
   └─ Track adoption
```

---

## 📊 Expected Outcomes

### Day 1
- ✅ Users can generate codes
- ✅ Users can share codes
- ✅ Referral tracking works

### Week 1
- ✅ First referrals come in
- ✅ Users applying with codes
- ✅ Tracking working smoothly

### Month 1
- ✅ 100+ referrals
- ✅ $$ in referral rewards
- ✅ Viral growth starting

### Month 3+
- ✅ Hundreds of referrals
- ✅ Significant acquisition boost
- ✅ Network effect growing

---

## ✅ Implementation Status

| Component | Status | Files |
|-----------|--------|-------|
| Database Schema | ✅ Complete | drizzle/schema.ts |
| Database Migration | ✅ Complete | drizzle/0008_*.sql |
| Backend Functions | ✅ Complete | server/db.ts (10+ functions) |
| tRPC Routes | ✅ Complete | server/routers.ts (5 routes) |
| Frontend UI | ✅ Complete | ReferralComponent.tsx |
| Dashboard Integration | ✅ Complete | Dashboard.tsx (Referrals tab) |
| Documentation | ✅ Complete | 3 comprehensive guides |

---

**Status**: 🟢 READY FOR PRODUCTION

**All systems implemented and tested**
