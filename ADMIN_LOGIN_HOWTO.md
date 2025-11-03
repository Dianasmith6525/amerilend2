# Admin Login Quick Guide - AmeriLend

**Date**: November 3, 2025  
**Authentication Method**: OTP (One-Time Password via Email)  
**Status**: ✅ Ready to Use

---

## Quick Start: Login as Admin (3 Steps)

### Step 1️⃣: Go to Login Page
```
Open: http://localhost:3004/login
(or http://yourdeployment.com/login)
```

### Step 2️⃣: Request OTP Code
```
1. Enter your admin email address
2. Click "Send Verification Code"
3. Check your email for 6-digit code
```

### Step 3️⃣: Verify and Login
```
1. Enter the 6-digit code from your email
2. Click "Verify Code"
3. ✅ You're logged in! Redirected to dashboard
```

---

## How to Make Your Account Admin

You need to set the role to "admin" in the database:

### Option A: Quick Database Update (Fastest)

1. **Connect to database** (TiDB):
   ```bash
   mysql -h gateway02.us-east-1.prod.aws.tidbcloud.com -u root -p SKaMVdMNraqB5VhX78BegA
   ```

2. **Update user role to admin**:
   ```sql
   UPDATE users 
   SET role = 'admin' 
   WHERE email = 'your-email@example.com';
   ```

3. **Verify it worked**:
   ```sql
   SELECT id, email, role FROM users WHERE email = 'your-email@example.com';
   ```

4. **Log out and log back in** to activate admin privileges

---

## What is OTP Authentication?

Instead of passwords, AmeriLend uses **email-based OTP authentication**:

```
You                          AmeriLend                    Email
│                            │                            │
├─ Request OTP ─────────────>│                            │
│                            ├─ Generate Code ──────────>│
│                            │                            ├─ Send Email
│                            │<─ Code Sent ──────────────┤
│<─ Receive Email ───────────┤                            │
│                            │                            │
├─ Enter Code ──────────────>│                            │
│                            ├─ Verify Code
│                            ├─ Create Session (JWT)
│<─ Login Success ───────────┤
│   (Redirected to Dashboard)│
```

---

## Key Information

| Item | Details |
|------|---------|
| **Auth Type** | OTP (Email-based) |
| **No Passwords** | Security by design |
| **Session Storage** | HTTP-only cookie |
| **Session Duration** | 1 year |
| **OTP Expiry** | 10 minutes |
| **Admin Role** | Set in database `role = 'admin'` |

---

## After Login: What You Get

Once logged in as admin, you can:

### 📊 Admin Dashboard
- View all loan applications
- Approve/reject loans
- Process disbursements
- Monitor fraud
- Configure fees

### 💳 Disbursement Options
- ACH Transfer ($0.50, 1-3 days)
- Wire Transfer ($15, 1 day)
- Check Payment ($2, 5-7 days)
- PayCard ($1, 1-2 days)

### 🔍 Fraud Detection
- Review flagged applications
- Monitor suspicious activity
- Set fraud thresholds

---

## Environment Variables Needed

Make sure your `.env` file has:

```properties
# Database
DATABASE_URL=mysql://...?ssl=...

# JWT Signing
JWT_SECRET=your-super-secret-jwt-key

# Email (SendGrid)
SENDGRID_API_KEY=SG.xxx...

# OAuth
OAUTH_SERVER_URL=https://your-oauth-server.com
VITE_APP_ID=your-app-id
```

---

## Troubleshooting

### ❌ "Account doesn't have admin role"
**Fix**: Update database to set `role = 'admin'` (see Option A above)

### ❌ "OTP code never arrives"
**Check**:
- Email address is correct
- Check spam/junk folder
- SendGrid API key is set in `.env`
- Server logs show code sent

### ❌ "Invalid code" error
**Fix**: 
- OTP codes expire after 10 minutes
- Request new code and enter it quickly
- Make sure you copied the full 6-digit code

### ❌ "Can't connect to database"
**Check**:
- DATABASE_URL includes SSL parameter
- Username and password are correct
- Network connection is working

---

## Production Deployment

When deploying to production:

1. ✅ Set strong JWT_SECRET (use a random 32+ character string)
2. ✅ Configure SendGrid API key
3. ✅ Set correct OAuth credentials
4. ✅ Update OAUTH_SERVER_URL for your domain
5. ✅ Ensure SSL/TLS is enabled
6. ✅ Create admin user and set role in production database

---

## Detailed Admin Login Guide

For more detailed information, see:
- `ADMIN_LOGIN_GUIDE.md` - Complete guide with all options
- `ADMIN_QUICK_START.md` - Additional quick start info
- `DATABASE_SCHEMA.md` - User table structure

---

## Architecture

### Authentication Flow
```
OTP Request
    ↓
Email Verification (SendGrid)
    ↓
6-Digit Code Verification
    ↓
JWT Session Creation
    ↓
HTTP-only Cookie Storage
    ↓
Redirected to Dashboard
    ↓
Check role = 'admin'
    ↓
Admin Dashboard Accessible
```

### File Structure
- `server/routers.ts` - Login endpoint (otp.verifyCode)
- `server/_core/sdk.ts` - Session management
- `server/_core/otp.ts` - OTP generation
- `client/src/pages/OTPLogin.tsx` - Login UI
- `shared/const.ts` - Cookie configuration

---

## Key Features of Admin Account

✅ OTP-based login (no password needed)  
✅ Email verification for security  
✅ Session persists for 1 year  
✅ Secure HTTP-only cookies  
✅ JWT token signing  
✅ Role-based access control  
✅ Fraud detection system  
✅ Full loan management capabilities  

---

## Status

✅ **Admin authentication system is READY**  
✅ **OTP login is FUNCTIONAL**  
✅ **Admin dashboard is OPERATIONAL**  
✅ **Ready for production use**  

---

## Next Steps

1. **Create or use existing email** for admin account
2. **Go to login page** and request OTP
3. **Check email** for verification code
4. **Enter code** to login
5. **Update database** to set role = 'admin' (if not already done)
6. **Logout and login again** to activate admin role
7. **Access admin dashboard** to manage applications

**You're all set!** 🎉
