# Referral Program Implementation - Complete Guide

## Overview

AmeriLend now has a fully functional **referral program** that allows users to earn rewards by inviting others to the platform. Each user gets a unique referral code that they can share with friends and family.

---

## Key Features

### For Referrers (The Person Sharing)
✅ **Unique Referral Code**: Auto-generated (e.g., `REF123ABC456`)  
✅ **Shareable Link**: Direct URL for easy sharing  
✅ **Share Methods**: Email, social media, direct copy  
✅ **Earn $50**: For each successful referral  
✅ **Track Earnings**: Dashboard shows pending and paid rewards  
✅ **View Referrals**: See status of all people they referred  

### For Referees (The Person Referred)
✅ **$25 Discount**: Applied to application processing fee  
✅ **Easy Signup**: Use referral code during account creation  
✅ **Automatic Tracking**: System tracks referral automatically  
✅ **Reward Applied**: Discount credited when joining  

---

## Database Schema

### `referralCodes` Table
```sql
- id (Primary Key)
- userId (FK to users)
- code (UNIQUE) - Referral code string
- referrerRewardType - Type of reward (cash_bonus, discount, bonus_credit)
- referrerRewardAmount - Amount in cents ($50 = 5000)
- refereeRewardType - Type of reward for new user
- refereeRewardAmount - Amount in cents ($25 = 2500)
- status - active/inactive/suspended
- totalReferrals - Counter of successful referrals
- totalRewardsEarned - Total rewards earned in cents
- createdAt / updatedAt / deactivatedAt
```

### `referrals` Table
```sql
- id (Primary Key)
- referralCodeId (FK to referralCodes)
- referrerId (FK to users) - The referrer
- refereeId (FK to users) - The referred person
- referralSource - Where referral came from (email, social, direct)
- ipAddress - IP address of referee signup
- status - pending/signed_up/loan_applied/loan_approved/completed
- referrerRewardStatus - pending/earned/paid/cancelled
- referrerRewardAmount - Amount in cents
- referrerRewardPaidAt - When paid
- refereeRewardStatus - pending/earned/applied/cancelled
- refereeRewardAmount - Amount in cents
- refereeRewardAppliedAt - When applied
- createdAt / updatedAt
```

---

## Backend Functions (server/db.ts)

### 1. Create Referral Code
```typescript
createReferralCode(
  userId: number,
  referrerRewardAmount: number = 5000,  // $50
  refereeRewardAmount: number = 2500    // $25
): Promise<ReferralCode | null>
```
**Purpose**: Generate unique referral code for a user (called once per user)

### 2. Get User's Referral Code
```typescript
getUserReferralCode(userId: number): Promise<ReferralCode | null>
```
**Purpose**: Retrieve user's existing referral code

### 3. Get Referral Code by Code String
```typescript
getReferralCodeByCode(code: string): Promise<ReferralCode | null>
```
**Purpose**: Validate referral code during signup

### 4. Record Referral
```typescript
recordReferral(
  referralCodeId: number,
  referrerId: number,
  refereeId: number,
  referralSource?: string,
  ipAddress?: string
): Promise<Referral | null>
```
**Purpose**: Create referral relationship when someone signs up with a code

### 5. Get User's Referrals
```typescript
getUserReferrals(referrerId: number): Promise<Referral[]>
```
**Purpose**: Get list of people referred by a user

### 6. Update Referral Status
```typescript
updateReferralStatus(
  referralId: number,
  newStatus: "loan_applied" | "loan_approved" | "completed"
): Promise<boolean>
```
**Purpose**: Update status as referred user progresses

### 7. Get Referral Statistics
```typescript
getReferralStats(userId: number): Promise<{
  code: string | null
  totalReferrals: number
  totalEarnings: number
  pendingRewards: number
  paidRewards: number
}>
```
**Purpose**: Dashboard statistics for referrer

---

## Frontend Routes (tRPC)

### `referrals.getMyCode`
**Type**: Query (Public-accessible, auto-creates code if needed)  
**Returns**: User's referral code and reward amounts  
```typescript
{
  success: boolean
  code: string | null
  referralCodeId: number | null
  rewards: { referrerAmount: number, refereeAmount: number }
}
```

### `referrals.getStats`
**Type**: Query (Protected - authenticated users only)  
**Returns**: Referral statistics  
```typescript
{
  success: boolean
  stats: {
    code: string
    totalReferrals: number
    totalEarnings: number
    pendingRewards: number
    paidRewards: number
  }
}
```

### `referrals.getMyReferrals`
**Type**: Query (Protected)  
**Returns**: List of all referrals made by user  
```typescript
{
  success: boolean
  referrals: Referral[]
  total: number
}
```

### `referrals.validateCode`
**Type**: Query (Public)  
**Input**: { code: string }  
**Returns**: Validation result with reward details  
```typescript
{
  valid: boolean
  message: string
  referralCodeId?: number
  referrerRewardAmount?: number
  refereeRewardAmount?: number
  totalReferrals?: number
}
```

### `referrals.recordReferral`
**Type**: Mutation (Public)  
**Input**: { code: string, refereeUserId: number, ipAddress?: string }  
**Returns**: Confirmation of recorded referral  
```typescript
{
  success: boolean
  referralId: number
  message: string
}
```

### `referrals.adminList`
**Type**: Query (Admin only)  
**Returns**: All referrals in system (for admin dashboard)

---

## Frontend Components

### ReferralComponent (`client/src/components/ReferralComponent.tsx`)

**Features**:
- Display user's referral code
- Copy code to clipboard
- Generate and copy shareable URL
- Share via email button
- Social share button placeholder
- Referral statistics (total referrals, earnings, pending)
- Table of all referrals with status tracking
- "How It Works" section with 4-step explanation

**Props**: None (uses authenticated context)

**Integration**: Added to Dashboard under "Referrals" tab

---

## User Flow

### For Referrer

1. **Access Dashboard**
   - Go to `/dashboard`
   - Click "Referrals" tab

2. **View Referral Code**
   - See unique referral code (e.g., `REF123ABC456`)
   - See reward amounts ($50 for them, $25 for referee)

3. **Share Code**
   - Copy code directly
   - Copy shareable URL
   - Share via email
   - Share on social media (button provided)

4. **Track Referrals**
   - View list of referred people
   - See their application status (signed_up → loan_applied → loan_approved → completed)
   - Track reward status (pending → earned → paid)
   - See total earnings and pending rewards

### For Referee (New User)

1. **Sign Up with Referral Code**
   - Visit `/signup` with referral code from URL parameter
   - Or manually enter code during signup
   - Code is validated and applied

2. **Automatic Tracking**
   - System records who referred them
   - Referrer is notified
   - $25 discount applied to their processing fee

3. **Progress Triggers Rewards**
   - When they apply for loan → referral updates to "loan_applied"
   - When loan is approved → referral updates to "loan_approved"
   - When they complete process → referrer gets $50 reward

---

## Integration Points

### 1. Signup Flow
When user signs up with referral code:
```typescript
// In signup handler
const validCode = await db.getReferralCodeByCode(input.code);
await db.recordReferral(
  validCode.id,
  validCode.userId,
  newUserId,
  "signup",
  ipAddress
);
```

### 2. Loan Application
When referred user applies for loan:
```typescript
const referral = await db.getUserReferrer(userId);
if (referral) {
  await db.updateReferralStatus(referral.id, "loan_applied");
}
```

### 3. Loan Approval
When loan is approved:
```typescript
const referral = await db.getUserReferrer(userId);
if (referral && referral.status === "loan_applied") {
  await db.updateReferralStatus(referral.id, "loan_approved");
  await db.markReferralRewardsEarned(referral.id);
}
```

---

## Admin Dashboard Features

Admins can:
- View all referrals in system
- See referral statistics
- Manual reward processing
- Disable/suspend referral codes if needed
- Monitor referral fraud

---

## Security Considerations

✅ **Unique Codes**: Each user gets one code (can't create multiple)  
✅ **Self-Referral Prevention**: User can't refer themselves  
✅ **Rate Limiting**: Should add on referral creation  
✅ **IP Tracking**: Records IP address of signup for fraud detection  
✅ **Reward Validation**: Only paid after loan is approved  
✅ **Admin Control**: Admins can suspend codes for abuse  

---

## Reward Timeline

```
User Signs Up with Code
         ↓
Referral Created (status: signed_up)
Referee Reward Status: pending
         ↓
User Applies for Loan
Referral Status: loan_applied
         ↓
Loan Approved by Admin
Referral Status: loan_approved
Referrer Reward Status: earned
Referee Reward Status: earned
         ↓
Loan Disbursed
Referral Status: completed
Referrer Reward Status: paid
Referee Reward: applied to account
```

---

## Future Enhancements

1. **Tiered Rewards**
   - Different rewards for different loan amounts
   - Bonus for multiple referrals

2. **Referral Groups**
   - Team referrals
   - Office/company group referrals

3. **Advanced Analytics**
   - Referral source tracking
   - Conversion rates
   - Geographic data

4. **Automated Payouts**
   - Direct bank transfer of rewards
   - Check payment
   - Account credit

5. **Gamification**
   - Leaderboards
   - Badges (1st referral, 10 referrals, etc.)
   - Social sharing challenges

6. **Marketing Materials**
   - Branded landing page for referral code
   - Social media templates
   - Email templates

---

## Testing the Referral System

### Manual Testing

1. **Create Test Users**
   - User A (referrer)
   - User B (referee)

2. **Generate Code**
   - Login as User A
   - Go to Referrals tab
   - Copy code

3. **Sign Up with Code**
   - Logout
   - Go to `/signup?referral=REF123ABC456`
   - Complete signup as User B

4. **Verify Referral**
   - Check database: `referrals` table should have new entry
   - Check User A's dashboard: should see User B in referral list
   - Check User B: should have $25 discount

5. **Test Reward Progression**
   - User B applies for loan
   - Check referral status: should update to `loan_applied`
   - Admin approves loan
   - Check referral status: should update to `loan_approved`
   - Check User A: should see reward status as `earned`

---

## File Structure

```
server/
  db.ts                          ← Referral functions
  routers.ts                     ← tRPC referral routes

client/
  src/
    components/
      ReferralComponent.tsx      ← UI component
    pages/
      Dashboard.tsx              ← Integration point

drizzle/
  schema.ts                      ← referralCodes, referrals tables
  0008_referral_program.sql      ← Migration
```

---

## Deployment Checklist

- [ ] Run database migration: `pnpm run db:push`
- [ ] Test referral code generation
- [ ] Test signup with referral code
- [ ] Test referral status updates
- [ ] Test reward calculations
- [ ] Test admin referral list
- [ ] Monitor for abuse/fraud
- [ ] Set up reward payout process
- [ ] Create marketing materials
- [ ] Launch referral program announcement

---

## Troubleshooting

**Issue**: Referral code not created
- Check user exists in database
- Verify JWT_SECRET is set
- Check database connection

**Issue**: Referral code validation fails
- Code may be inactive/suspended
- Check code spelling
- Verify code exists in database

**Issue**: Rewards not showing
- Check referral status is "completed"
- Verify loan is approved
- Check reward status flags

**Issue**: User can't see referral tab
- Must be logged in
- Check ReferralComponent import in Dashboard
- Verify tRPC route is defined

---

## Support & Questions

For issues or questions about the referral system:
1. Check this documentation
2. Review database schema
3. Check browser console for errors
4. Review server logs
5. Contact development team

---

**Status**: ✅ Implementation Complete
**Last Updated**: November 2025
**Version**: 1.0
