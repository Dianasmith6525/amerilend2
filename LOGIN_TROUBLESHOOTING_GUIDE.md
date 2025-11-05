# AmeriLend Login Troubleshooting Guide - Password Login Fix

## ✅ Problem Fixed

You were unable to login with a correct password. This was caused by **a critical bug in the database schema**.

### The Bug
The `otpCodes` table's `purpose` enum column only supported `'signup'` and `'login'`, but the password reset feature tried to store `'password_reset'` codes, which caused the enum validation to fail silently.

### The Fix
Updated the enum to include `'password_reset'`:
```sql
ALTER TABLE `otpCodes` MODIFY COLUMN `purpose` enum('signup','login','password_reset') NOT NULL;
```

This was applied via migration: `drizzle/0007_wet_proemial_gods.sql`

---

## 🔍 Diagnosis: Why You Can't Login

### Reason 1: User Doesn't Exist
**Symptom**: "Invalid email or password" error immediately

**Check**: 
1. Open database client (MySQL Workbench or similar)
2. Query:
```sql
SELECT email, loginMethod, passwordHash FROM users WHERE email = 'your-email@example.com';
```

**Fix**:
- If user doesn't exist, you must **register first** via the register endpoint
- Or create user manually:
```sql
INSERT INTO users (openId, email, passwordHash, loginMethod, role)
VALUES ('your-email@example.com', 'your-email@example.com', '<hash>', 'password', 'user');
```

### Reason 2: Password Hash is NULL
**Symptom**: "Invalid email or password" error

**Check**:
```sql
SELECT email, passwordHash FROM users WHERE email = 'your-email@example.com';
```

If `passwordHash` is NULL, the user was created with OTP/OAuth, not password registration.

**Fix**: Reset password via "Forgot Password" flow:
1. Go to login page
2. Click "Forgot password?"
3. Enter email
4. Click "Request Code"
5. Check email for 6-digit code
6. Enter code and new password
7. Login with new password

### Reason 3: Password Hash Mismatch
**Symptom**: "Invalid email or password" but user and hash exist

**Possible Causes**:
- Password was changed but you're using old password
- Bcrypt hash comparison failed (rare)

**Fix**:
1. Check server logs for errors:
```bash
npm run dev
# Look for "[Password] Login failed" or bcrypt errors
```

2. If bcrypt failed, run:
```bash
npm list bcryptjs
```

3. If not installed:
```bash
npm install bcryptjs
```

---

## 📋 Complete Password Login Setup

### Step 1: Register Account
```
POST /api/trpc/password.register
{
  "email": "user@example.com",
  "password": "SecurePassword123"  // Min 8 characters
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "loginMethod": "password",
    "role": "user"
  }
}
```

### Step 2: Login with Password
```
POST /api/trpc/password.login
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "user": { ... }
}
```

**Note**: Login also sets `manus-runtime-user-info` HTTP-only cookie

### Step 3: Verify Login
```
GET /api/trpc/auth.me
```

Should return authenticated user object.

---

## 🔐 Forgot Password Flow

### Step 1: Request Reset Code
```
POST /api/trpc/password.requestPasswordReset
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "success": true
}
```

Note: Email with 6-digit code sent (or logged to console in dev)

### Step 2: Reset Password with Code
```
POST /api/trpc/password.resetPassword
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePassword123"
}
```

**Response**:
```json
{
  "success": true
}
```

---

## 🛠️ Database Verification Commands

### Check User Exists
```sql
SELECT id, email, passwordHash, loginMethod FROM users 
WHERE email = 'user@example.com';
```

### Check OTP Codes
```sql
SELECT email, code, purpose, expiresAt, verified FROM otpCodes 
WHERE email = 'user@example.com' 
ORDER BY createdAt DESC;
```

### Check Sessions (if session table exists)
```sql
SELECT * FROM sessions 
WHERE userId = (SELECT id FROM users WHERE email = 'user@example.com')
LIMIT 5;
```

---

## 📝 Server Logs to Monitor

When testing password login, look for these messages:

```
[Password] Login successful for user@example.com
[Password] Account created for user@example.com
[Password] Login failed: Invalid email or password
[Password Reset] Code sent to user@example.com
[Password Reset] Password reset successful
```

---

## 🐛 Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid email or password" | User doesn't exist or password wrong | Check user exists in DB |
| "Password must be at least 8 characters" | Password too short | Use min 8 character password |
| "User already exists" | Email already registered | Use different email or login |
| "Invalid or expired reset code" | Code expired (15 min) or wrong code | Request new code |
| "Passwords do not match" | Confirm password field doesn't match | Re-enter both passwords |

---

## 🚀 Testing Checklist

- [ ] User can register with email/password
- [ ] User cannot register with same email twice
- [ ] User can login immediately after registration
- [ ] User can logout
- [ ] User can request password reset
- [ ] User receives reset code
- [ ] User can reset password with code
- [ ] User can login with new password
- [ ] Session persists across page reloads
- [ ] Unauthenticated users redirected to /login

---

## 🔧 If Nothing Works

### 1. Check Database Connection
```bash
npm run dev
# Look for database connection errors in server logs
```

### 2. Check Bcryptjs Installation
```bash
npm list bcryptjs
# Should show bcryptjs@x.x.x
```

If missing:
```bash
npm install bcryptjs
```

### 3. Check Environment Variables
Verify `.env` or Vercel environment has:
- `DATABASE_URL` - Must be valid MySQL connection string
- `JWT_SECRET` - For signing session tokens

### 4. Reset Database (Development Only)
```bash
# Backup your data first!
npm run db:push  # Re-runs migrations
```

### 5. Check Browser DevTools
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try login
4. Click on `/api/trpc` request
5. Check response for error details
6. Go to **Application** tab → **Cookies**
7. Look for `manus-runtime-user-info` cookie

---

## 📞 Still Having Issues?

1. **Check server logs** - Most useful for debugging
2. **Verify user in database** - Confirm registration worked
3. **Test with valid 8+ char password** - Min length requirement
4. **Clear browser cache** - `Ctrl+Shift+Delete`
5. **Restart dev server** - `npm run dev`

---

**Last Updated**: November 4, 2025  
**Status**: ✅ Fixed  
**Migration Applied**: `drizzle/0007_wet_proemial_gods.sql`
