# Admin Login Guide - AmeriLend

## Overview

AmeriLend uses **OTP (One-Time Password) authentication** for all users, including admins. There is no traditional username/password login. Admin access is role-based and verified through email OTP codes.

---

## How to Login as Admin

### Step 1: Navigate to Login Page
1. Go to `http://localhost:5173/login` (or your deployment URL + `/login`)
2. You'll see the OTP Login page

### Step 2: Request OTP Code
1. Enter your **admin email address** in the email field
2. Click **"Request Code"** button
3. You'll see: "Verification code sent to your email"
4. Check your email inbox (and spam folder) for the 6-digit code

### Step 3: Enter OTP Code
1. Once you receive the code, return to the login page
2. The form will have switched to ask for the **verification code**
3. Enter the **6-digit code** from your email
4. Click **"Verify Code"** button
5. You'll be redirected to `/dashboard`

### Step 4: Access Admin Dashboard
1. After login, go to `http://localhost:5173/admin` 
2. Or click the **Admin Dashboard** button on your user dashboard
3. You'll only see this button if your account has the `role = "admin"`

---

## Important: How to Set Up an Admin Account

### Option 1: Direct Database Update (Quickest for Development)

1. **Connect to your database** (TiDB/MySQL):
   ```bash
   mysql -h your-host -u your-username -p your-database
   ```

2. **Update your user account to admin role**:
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'your-admin-email@example.com';
   ```

3. **Verify the update**:
   ```sql
   SELECT id, email, role FROM users WHERE email = 'your-admin-email@example.com';
   ```

### Option 2: Create New Admin Account via Signup

1. **Sign up** with a new email at `/signup`
2. Follow the OTP verification process
3. Once account is created, use **Option 1** above to set `role = 'admin'`
4. Log out and log back in to activate admin privileges

### Option 3: Using Server Function (For Production)

In `server/db.ts`, there's an `updateUser()` function that can set the admin role:

```typescript
// In server/_core/index.ts or any admin setup script
import * as db from './db';

await db.updateUser(userId, { role: 'admin' });
```

---

## Admin Credentials Information

### No Hardcoded Passwords
⚠️ **Important**: AmeriLend does **NOT** use hardcoded admin passwords. This is by design for security reasons.

### Authentication Flow
```
Admin Email → OTP Request → Email Verification → 6-Digit Code → Session Token (JWT in Cookie)
```

### Session Storage
- **Session Type**: JWT (JSON Web Token)
- **Storage**: HTTP-only cookie named `manus-runtime-user-info` (configured in `shared/const.ts`)
- **Duration**: 1 year (configured in `server/_core/sdk.ts`)
- **Security**: Signed with `JWT_SECRET` environment variable

---

## What You Get After Login

Once logged in as admin, you can access:

### Admin Dashboard Features
- **Loan Management**: View all loan applications (not just your own)
- **Approve Loans**: Accept applications and set approval amounts
- **Reject Loans**: Deny applications with rejection reasons
- **Process Disbursements**: Handle loan disbursement using multiple methods:
  - ACH Transfer (1-3 days, $0.50)
  - Wire Transfer (1 day, $15)
  - Check Payment (5-7 days, $2)
  - PayCard (1-2 days, $1)
- **Fee Configuration**: Manage processing fees (percentage or fixed amount)
- **Fraud Monitoring**: Review flagged applications for suspicious activity

### Admin-Only Endpoints (tRPC)
```typescript
// Loan Management
trpc.loans.adminList.query()           // Get all applications
trpc.loans.adminApprove.mutate()       // Approve an application
trpc.loans.adminReject.mutate()        // Reject an application

// Disbursements
trpc.disbursements.adminInitiate.mutate()  // Process disbursement

// Fraud Monitoring
trpc.fraud.getFlaggedApplications.query()  // Get flagged apps
trpc.fraud.reviewApplication.mutate()      // Review flagged app

// Fee Configuration
trpc.feeConfig.getActive.query()       // Get current fees
trpc.feeConfig.update.mutate()         // Update fee settings
```

---

## Troubleshooting

### Problem: "Not Admin" Error When Accessing Admin Dashboard
**Solution**: Your account doesn't have admin role. Use the database update method (Option 1) above.

### Problem: OTP Code Never Arrives
**Check**:
1. Email address is correct
2. Check spam/junk folder
3. Check SendGrid configuration in your environment
4. For development: check server console logs - OTP codes are logged there if SendGrid is not configured

### Problem: Invalid Code Error
**Causes**:
- Code expired (OTP codes expire after 10 minutes)
- Wrong code entered
- Code was already used

**Solution**: Request a new code and try again within 10 minutes.

### Problem: Redirect Loop on Admin Page
**Issue**: You're logged in but not an admin
**Solution**: Ask the database administrator to set your role to "admin" using the database update method.

---

## Environment Variables Required

Ensure these are set in your `.env` or `.env.local`:

```
# Authentication
JWT_SECRET=your-secret-key-here

# Email (for OTP codes)
SENDGRID_API_KEY=your-sendgrid-api-key

# Database
DATABASE_URL=your-database-url

# OAuth (if using OAuth instead of OTP)
OAUTH_SERVER_URL=your-oauth-url
VITE_APP_ID=your-app-id
```

---

## Development Tips

### For Local Testing
1. **OTP codes are logged to console** when SendGrid is not configured:
   ```
   [OTP] Generated code: 123456
   ```
2. Use this code to test without email setup

### For Production
1. Configure `SENDGRID_API_KEY` environment variable
2. OTP codes will be sent via email
3. Codes expire after 10 minutes
4. Multiple OTP requests replace the previous code

---

## Security Notes

✅ **What's Secure**:
- No passwords stored in code
- JWT tokens signed with secret
- HTTP-only cookies (CSRF protected)
- OTP codes expire quickly
- Rate limiting on OTP requests
- Admin role checked on every endpoint

⚠️ **Things to Remember**:
- Keep `JWT_SECRET` secure
- Never commit `.env` files
- Rotate `JWT_SECRET` periodically in production
- Only set admin role for trusted users
- Monitor fraud detection for suspicious activities

---

## How Admin Verification Works

### Role-Based Access Control (RBAC)
AmeriLend uses tRPC procedures with role checking:

```typescript
// In server/_core/trpc.ts
export const adminProcedure = protectedProcedure
  .use(async (opts) => {
    if (opts.ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: NOT_ADMIN_ERR_MSG,
      });
    }
    return opts.next();
  });
```

Every admin endpoint:
1. Checks user is authenticated (has valid JWT)
2. Checks user has `role === "admin"`
3. Allows only then

---

## Quick Reference

| Action | Location | Requirements |
|--------|----------|--------------|
| **Login** | `/login` | Valid email, OTP code | 
| **Sign Up** | `/signup` | New email, OTP verification |
| **Admin Dashboard** | `/admin` | Admin role + authentication |
| **User Dashboard** | `/dashboard` | Any authenticated user |
| **Make Admin** | Database | Direct SQL UPDATE |
| **Check Role** | User Profile | View your current role |

---

## Questions?

**For Development Issues**: Check server logs for `[OTP]` messages
**For Database Issues**: Verify connection string in `DATABASE_URL`
**For Auth Issues**: Check `JWT_SECRET` is set in environment

---

**Last Updated**: November 2025
**Status**: ✅ Current and Active
