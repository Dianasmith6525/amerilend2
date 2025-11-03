# Quick Admin Setup - 3 Steps

## Your Admin Login Instructions

### System: OTP-Based Authentication (Email Verification)

**There is NO username/password.** All logins use email-based OTP codes.

---

## Quick Setup (Choose One)

### Method 1: Database Direct (Fastest) ⚡

If you have database access:

```sql
-- 1. Connect to your TiDB/MySQL database
mysql -h your-host -u your-user -p your-database

-- 2. Upgrade your user to admin
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- 3. Verify
SELECT email, role FROM users WHERE email = 'your-email@example.com';
```

Then login at: **http://localhost:5173/login**

---

### Method 2: Node Script (Recommended)

```bash
# First, sign up at http://localhost:5173/signup with your email

# Then run the setup script
node setup-admin.mjs your-email@example.com
```

The script will:
- ✅ Find your user account
- ✅ Set your role to admin
- ✅ Show you next steps

---

## Login Steps

1. **Go to**: `http://localhost:5173/login`
2. **Enter**: Your email address
3. **Click**: "Request Code"
4. **Check**: Your email (check spam folder too!)
5. **Copy**: The 6-digit code
6. **Paste**: Code into the form
7. **Click**: "Verify Code"
8. **Redirected to**: `/dashboard`

---

## Access Admin Panel

After logging in:

1. **Go to**: `http://localhost:5173/admin`
   - OR click "Admin Dashboard" button on your dashboard
2. **You should see**: 
   - Loan applications list
   - Approve/Reject controls
   - Disbursement options
   - Fraud monitoring
   - Fee configuration

---

## What If OTP Code Doesn't Arrive?

### For Development (Local Testing):
- Check your **server console** for: `[OTP] Generated code: XXXXXX`
- Use that code directly
- No email needed for development

### For Production (Real Email):
1. Check **spam/junk folder**
2. Verify `SENDGRID_API_KEY` is set
3. Code expires in **10 minutes**
4. Request a new code if expired

---

## Admin Dashboard Features

Once logged in as admin, you can:

✅ **Loan Management**
- View all applications
- Approve loans
- Reject loans
- Set approval amounts

✅ **Disbursements** (4 methods available)
- ACH (1-3 days)
- Wire (1 day)
- Check (5-7 days)
- PayCard (1-2 days)

✅ **Fees**
- View current fee config
- Update fee percentage or fixed amount

✅ **Fraud**
- Review flagged applications
- Mark as reviewed

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Not Admin" error | Run setup script or use SQL UPDATE |
| Code never arrives | Check spam; for dev, check console |
| Invalid code | Code expired? Request new one |
| Can't find admin button | You're not admin yet - run setup script |
| Database error | Check DATABASE_URL in .env |

---

## Files Reference

- **Setup Script**: `setup-admin.mjs`
- **Full Guide**: `ADMIN_LOGIN_GUIDE.md`
- **Database Schema**: `drizzle/schema.ts`
- **Auth Code**: `server/_core/otp.ts`
- **Login UI**: `client/src/pages/OTPLogin.tsx`

---

## Environment Variables Needed

```env
# Database connection
DATABASE_URL=mysql://user:password@host/database

# Security
JWT_SECRET=your-secret-key

# Email (optional for dev, required for prod)
SENDGRID_API_KEY=your-sendgrid-key
```

---

## That's It! 🎉

You should now be an admin. Go to `/admin` and start managing loans!

Questions? Check `ADMIN_LOGIN_GUIDE.md` for detailed information.
