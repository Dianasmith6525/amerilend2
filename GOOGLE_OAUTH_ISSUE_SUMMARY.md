# Google OAuth - Issue Diagnosis & Solution

## 🔴 Problem

Google OAuth login is not working because the required environment variables are not configured.

## 🔍 Root Cause

The application requires three Google OAuth credentials that are missing from your `.env` file:

| Variable | Status | Required For |
|----------|--------|--------------|
| `GOOGLE_CLIENT_ID` | ❌ Missing | Identifying your app to Google |
| `GOOGLE_CLIENT_SECRET` | ❌ Missing | Secure communication with Google |
| `GOOGLE_CALLBACK_URL` | ❌ Missing | Redirecting users back after auth |

## 🔧 How to Fix (Quick Start)

### Option 1: Using Mock Credentials (Testing Only)
If you just want to test the UI without real Google OAuth:

```bash
# Add to your .env file
GOOGLE_CLIENT_ID=test-client-id-123
GOOGLE_CLIENT_SECRET=test-client-secret-123
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

### Option 2: Real Google OAuth Setup (Recommended)

**Step 1:** Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

**Step 2:** Create OAuth 2.0 credentials:
- Click "Create Credentials" → "OAuth 2.0 Client ID"
- Choose "Web Application"
- Add authorized redirect URI: `http://localhost:3001/api/auth/google/callback`

**Step 3:** Copy your credentials and add to `.env`:
```bash
GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET_HERE
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

**Step 4:** Restart the server:
```bash
# Stop current server (Ctrl+C)
npm run dev
```

## 📋 What Happens When It Works

**Current (Broken):**
```
[Server] Listening on http://localhost:3001/
User clicks "Login with Google"
→ "Failed to initialize Google login"
```

**After Fix (Working):**
```
[Server] Listening on http://localhost:3001/
[Google OAuth] Generating auth URL
[Google OAuth] Auth URL generated successfully
User clicks "Login with Google"
→ Redirected to Google login page
→ After authentication, redirected back to app
→ User logged in and viewing dashboard
```

## 📁 Files Involved

- `server/_core/env.ts` - Reads env variables
- `server/_core/google-oauth.ts` - OAuth logic
- `server/routers.ts` - Exposes OAuth endpoints
- `client/src/pages/OTPLogin.tsx` - UI for Google login

## 🧪 Testing

After configuring, test by:
1. Opening http://localhost:3001
2. Clicking "Login with Google"
3. You should be redirected to Google login
4. After authentication, you return to app logged in

## 🆘 If Still Not Working

Check server console for error messages like:
- `[Google OAuth] Missing environment variables` → Variables not set
- `Invalid client` → Wrong client ID or secret
- `Redirect URI mismatch` → Callback URL doesn't match
- `Invalid request` → Environment variables updated but server not restarted

**Solution:** Restart the dev server after updating `.env`

## 📚 Reference Files

- `GOOGLE_OAUTH_SETUP_GUIDE.md` - Comprehensive setup guide
- `.env.example` - Template for all required variables
- `check-google-oauth.sh` - Diagnostic script

---

**Next Action:** Get Google OAuth credentials and update your `.env` file!
