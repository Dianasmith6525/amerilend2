# AmeriLend Login System - Debugging & Testing Guide

## Current Status

### ✅ Working Components
- **Email OTP Login**: Fully implemented with 6-digit codes, 10-minute expiry
- **Email Password Login**: Fully implemented with bcrypt hashing
- **Password Reset**: Fully implemented with email verification
- **Google OAuth Backend**: Fully implemented with lazy client initialization
- **Database**: Connected to TiDB Cloud with all tables created
- **Email Service**: SendGrid integration with console fallback

### ⚠️ Configuration Notes

1. **SendGrid Email (Development Mode)**
   - Currently disabled in `.env` (SENDGRID_API_KEY is empty)
   - When disabled, OTP codes are logged to server console
   - Example console output:
     ```
     ════════════════════════════════════════════════════════════
     [Email OTP] 📧 OTP Code for user@example.com
     ════════════════════════════════════════════════════════════
     Code: 123456
     Expires in: 10 minutes
     Timestamp: 2025-11-04T12:00:00.000Z
     ════════════════════════════════════════════════════════════
     ```

2. **Google OAuth (Development Mode)**
   - Currently disabled in `.env` (GOOGLE_CLIENT_ID/SECRET are empty)
   - Can be enabled by adding Google credentials from Google Cloud Console
   - `GOOGLE_CALLBACK_URL` is set to `http://localhost:3000/api/auth/google/callback`

## Testing Login Flows Locally

### Test 1: Email OTP Login

**Steps:**
1. Open http://localhost:3000/login
2. Click "Email Code" tab
3. Enter any email (e.g., `test@example.com`)
4. Click "Send Code"
5. **Check Server Console** for the OTP code (6 digits)
6. Copy the code and enter it in the verification field
7. Click "Verify Code"
8. Should redirect to `/dashboard`

**Expected Console Output:**
```
════════════════════════════════════════════════════════════
[Email OTP] 📧 OTP Code for test@example.com
════════════════════════════════════════════════════════════
Code: 123456
Expires in: 10 minutes
Timestamp: 2025-11-04T12:00:00.000Z
════════════════════════════════════════════════════════════
```

### Test 2: Email Password Login

**Steps:**
1. First register: Go to signup page and create an account with password
2. Then login with email/password
3. Should redirect to dashboard

**Note:** If signup page doesn't exist, you can:
- Directly call the API: `POST /api/trpc/password.register`
- Or use the browser console:
  ```javascript
  await fetch('/api/trpc/password.register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'password.register',
      params: { input: { email: 'test@example.com', password: 'Test123456' } },
      id: 1
    })
  })
  ```

### Test 3: Password Reset

**Steps:**
1. Click "Forgot Password" on login page
2. Enter email
3. Check server console for 6-digit reset code
4. Enter code and new password
5. Click "Reset Password"
6. Should return to login step
7. Try logging in with new password

### Test 4: Google OAuth (When Credentials Added)

**Steps:**
1. Add Google OAuth credentials to `.env`:
   ```
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
2. Restart dev server: `pnpm dev`
3. Click "Continue with Google"
4. Complete Google authentication
5. Should redirect to dashboard

## Troubleshooting

### Issue: "Cannot GET /login"
**Solution:**
- Check that `client/src/pages/OTPLogin.tsx` exists
- Check that route is registered in `client/src/App.tsx`
- Run `pnpm build` to ensure client is built

### Issue: OTP Code Not Appearing in Console
**Possible Causes:**
- Server didn't receive request (check network tab)
- SendGrid API key is set - codes are being emailed instead
- Database connection failed (check server logs)

**Debug:**
- Check browser Network tab when clicking "Send Code"
- Look for `/api/trpc` request with method `otp.requestCode`
- Check server console for `[OTP]` log messages

### Issue: "Invalid email or password" Error
**Solutions:**
1. Ensure user was created first (check database)
2. Password must be at least 8 characters
3. Check that bcryptjs is installed: `pnpm install bcryptjs`

### Issue: Google OAuth Not Working
**Solutions:**
1. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`
2. Ensure `GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback`
3. Restart dev server after changing env variables
4. Check browser console for errors
5. Check server logs for OAuth errors

### Issue: "Failed to create user" Error
**Possible Causes:**
- Database not connected (check DATABASE_URL in .env)
- User already exists with that email
- Database migration not run

**Fix:**
```bash
# Ensure database is migrated
pnpm run db:push
```

## Environment Variables Checklist

### Required for Email OTP:
- ✅ `DATABASE_URL` (TiDB connection)
- ✅ `JWT_SECRET` (session signing)
- ✅ `SENDGRID_API_KEY` (optional - logs to console if empty)
- ✅ `SENDGRID_FROM_EMAIL` (set to noreply@amerilend.com)

### Required for Google OAuth:
- ❌ `GOOGLE_CLIENT_ID` (add your credentials)
- ❌ `GOOGLE_CLIENT_SECRET` (add your credentials)
- ✅ `GOOGLE_CALLBACK_URL` (already set)

### Required for SMS OTP:
- ❌ `TWILIO_ACCOUNT_SID` (optional)
- ❌ `TWILIO_AUTH_TOKEN` (optional)
- ❌ `TWILIO_PHONE_NUMBER` (optional)

## Server Logs to Monitor

When testing, watch the server logs for these key messages:

```
// OTP Request
[OTP] Requesting code for user@example.com (login)
[OTP] Generated code: 123456

// OTP Verification
[OTP] Verifying code for user@example.com
[OTP] Valid code, creating/updating user session

// Password Login
[Password] Login successful for user@example.com

// Google OAuth
[Google OAuth] Generating auth URL
[Google OAuth] Exchanging code for user info
[Google OAuth] User info retrieved: { email: user@gmail.com, verified: true }
[Google OAuth] Session created for user@gmail.com
```

## Testing Checklist Before Deployment

- [ ] Email OTP login works (code appears in console)
- [ ] Email password login works (after creating user)
- [ ] Password reset works
- [ ] Redirects to `/dashboard` after successful login
- [ ] Unauthenticated users are redirected to `/login`
- [ ] Session cookie is set (check browser DevTools)
- [ ] All error messages are user-friendly
- [ ] Google OAuth works (if credentials added)
- [ ] Database queries are logged (check performance)

## Next Steps for Production

1. **Add SendGrid Credentials**
   - Get API key from: https://app.sendgrid.com/settings/api_keys
   - Set in Vercel environment variables
   - Update `.env.production.example`

2. **Add Google OAuth Credentials**
   - Create project at: https://console.cloud.google.com
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add redirect URI: `https://amerilend.vercel.app/api/auth/google/callback`
   - Set in Vercel environment variables

3. **Test on Staging**
   - Deploy to staging environment
   - Test all login flows
   - Test error handling
   - Monitor logs for errors

4. **Deploy to Production**
   - Ensure all env vars are set in Vercel
   - Test on production domain
   - Monitor login errors and user feedback
