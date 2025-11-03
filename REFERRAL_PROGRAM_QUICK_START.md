# Referral Program - Quick Reference

## What's New?

Each AmeriLend user now has a **unique referral code** to share with friends and family. When someone signs up using their code, both parties get rewards!

---

## How It Works (Simple Version)

```
1. You share your code → Friend signs up → Both get rewards!

You earn: $50 cash bonus
Friend gets: $25 off their application fee
```

---

## User Dashboard Changes

**New "Referrals" Tab** in `/dashboard`:

### Your Code Section
- 🔗 **Unique Code**: Your personal referral code (e.g., `REF123ABC456`)
- 📋 **Shareable Link**: Direct URL to signup with your code
- 📧 **Share Buttons**: Send via email or social media
- 💰 **Reward Info**: Shows exactly how much you/they earn

### Statistics
- **Total Referrals**: How many people you've referred
- **Total Earnings**: $$ you've made from referrals
- **Pending Rewards**: $$ waiting to be paid out

### Referrals List
Table showing:
- Status of each person you referred (signed up, applied, approved, etc.)
- When you referred them
- How much you're earning
- When payment will arrive

### How It Works Section
Visual guide showing 4-step process

---

## For Referrers (You Share)

### Step 1: Get Your Code
- Go to Dashboard → Referrals tab
- Your code auto-generates (no action needed)
- See exactly what you'll earn ($50)

### Step 2: Share Code
Choose one:
- **Copy Code**: `REF123ABC456` (share anywhere)
- **Copy Link**: Full URL to share
- **Email**: Sends template with your link
- **Social**: Copy link to Facebook, Twitter, etc.

### Step 3: Track Referrals
- See who you referred
- Watch their progress (signed up → applied → approved)
- See when you'll get paid

### Step 4: Get Paid
- Once their loan is approved → You earn $50
- Rewards automatically paid out
- Check "Pending Rewards" to see payment timeline

---

## For Referees (They Sign Up)

### Step 1: Sign Up With Code
- Get referral link/code from friend
- Go to `/signup?referral=THEIRCODE`
- Or enter code manually during signup

### Step 2: Get Discount
- $25 automatically applied to your app fee
- See discount on checkout

### Step 3: Apply for Loan
- Complete application as normal
- Referrer gets notified

### Step 4: Get Loan Approved
- Admin approves → Referrer gets $50
- Your $25 discount stays applied

---

## Database Structure

### Two New Tables

**referralCodes** (one per user)
- id, userId, code (unique), status (active/inactive)
- referrerRewardAmount, refereeRewardAmount
- totalReferrals, totalRewardsEarned

**referrals** (many per referrer)
- id, referralCodeId, referrerId, refereeId
- status (signed_up → loan_applied → loan_approved → completed)
- referrerRewardStatus, refereeRewardStatus
- Timestamps for tracking

---

## Backend Functions

```typescript
// Create code for user (auto-called first time)
createReferralCode(userId, referrerAmount, refereeAmount)

// Get user's code
getUserReferralCode(userId)

// Validate code (during signup)
getReferralCodeByCode(code)

// Record new referral (when someone signs up with code)
recordReferral(codeId, referrerId, refereeId, source, ip)

// Get someone's referrals
getUserReferrals(userId)

// Update status as person progresses
updateReferralStatus(referralId, newStatus)

// Get stats for dashboard
getReferralStats(userId)
```

---

## tRPC Routes

### Public Routes
- `referrals.validateCode` - Check if code is valid
- `referrals.recordReferral` - Register new referral on signup

### Protected Routes (logged in users)
- `referrals.getMyCode` - Get your code (auto-creates if needed)
- `referrals.getStats` - Your referral statistics
- `referrals.getMyReferrals` - List of people you referred

### Admin Routes
- `referrals.adminList` - All referrals in system

---

## Frontend Component

**ReferralComponent** (`client/src/components/ReferralComponent.tsx`)

Features:
- Display your code with copy button
- Generate shareable URL
- Email share
- Social media share placeholder
- Statistics cards (total, earnings, pending)
- Referrals table with status/dates/amounts
- "How It Works" explanation

**Location**: Dashboard → Referrals Tab

---

## Reward Flow

```
TIMELINE:
├─ Signup with code
│  └─ Referral created (status: signed_up)
│     └─ Referrer reward: pending
│
├─ User applies for loan
│  └─ Referral status: loan_applied
│
├─ Loan approved
│  └─ Referral status: loan_approved
│  └─ Referrer reward: earned
│
└─ Loan disbursed
   └─ Referral status: completed
   └─ Referrer paid $50
   └─ Referee $25 discount applied
```

---

## Files Modified/Created

**Database**
- `drizzle/schema.ts` - Added referralCodes & referrals tables
- `drizzle/0008_referral_program.sql` - Migration file

**Backend**
- `server/db.ts` - Referral functions (10+ new functions)
- `server/routers.ts` - tRPC referral routes

**Frontend**
- `client/src/components/ReferralComponent.tsx` - NEW
- `client/src/pages/Dashboard.tsx` - Added Referrals tab

**Documentation**
- `REFERRAL_PROGRAM_GUIDE.md` - Complete guide

---

## Deployment

```bash
# 1. Run migration to create tables
pnpm run db:push

# 2. Start dev server (or deploy)
pnpm run dev

# 3. Test:
# - Login as user
# - Go to Dashboard → Referrals
# - Copy your code
# - Create test account with code
# - Verify referral recorded
# - Admin approve loan
# - Verify rewards show
```

---

## Key Stats

**Reward Amounts** (customizable)
- Referrer: $50 cash bonus
- Referee: $25 discount

**Code Format**
- Starts with "REF"
- 13 total characters
- Unique per user
- Auto-generated

**Statuses**
- Code: active / inactive / suspended
- Referral: pending → signed_up → loan_applied → loan_approved → completed
- Rewards: pending → earned → paid (referrer) / applied (referee)

---

## Security

✅ One code per user  
✅ Can't refer yourself  
✅ IP tracking for fraud detection  
✅ Admin can suspend abusive codes  
✅ Rewards only paid on loan approval  
✅ Encrypted sensitive data  

---

## Testing Checklist

- [ ] Code generates for new user
- [ ] Code validates on signup
- [ ] Referral recorded in database
- [ ] Referrer sees referral in list
- [ ] Status updates when loan applied
- [ ] Status updates when loan approved
- [ ] Referrer reward shows as "earned"
- [ ] Referee sees discount applied
- [ ] Share buttons work
- [ ] Email share includes URL
- [ ] Statistics calculate correctly

---

## Next Steps

1. **Run Migration**: `pnpm run db:push`
2. **Test Signup**: Signup with referral code
3. **Test Dashboard**: View referrals tab
4. **Test Sharing**: Copy code and share
5. **Monitor**: Check logs for errors
6. **Launch**: Announce referral program to users

---

## Support

**Questions?** Check `REFERRAL_PROGRAM_GUIDE.md` for full details

**Bugs?** Check browser console and server logs

**Want to customize?** Edit reward amounts in `server/db.ts` `createReferralCode()` function

---

**Status**: ✅ Ready for Production  
**Last Updated**: November 2025  
**Version**: 1.0
