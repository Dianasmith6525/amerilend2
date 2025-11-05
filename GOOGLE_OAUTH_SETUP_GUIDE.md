# Google OAuth Not Working - Diagnostic & Fix Guide

## Problem Identified

Google OAuth is not working because the required environment variables are not configured in your `.env` file.

## Root Cause

The Google OAuth feature requires three environment variables:
- `GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Your Google OAuth client secret  
- `GOOGLE_CALLBACK_URL` - The callback URL where Google redirects after authentication

**Current Status:** These variables are empty or missing, causing the `getAuthUrl` endpoint to fail with:
```
[Google OAuth] Missing environment variables:
  hasClientId: false
  hasClientSecret: false
  hasCallbackUrl: false
```

## Error Flow

1. User clicks "Login with Google" button
2. Frontend calls `trpcClient.googleAuth.getAuthUrl.query()`
3. Server checks for environment variables
4. Server finds them missing → throws `INTERNAL_SERVER_ERROR`
5. Frontend catches error → "Failed to initialize Google login"

## Solution: Configure Google OAuth

### Step 1: Set Up Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (if you don't have one)
3. Click "Create Credentials" → "OAuth 2.0 Client IDs"
4. Choose "Web Application"
5. Add authorized redirect URIs:
   - `http://localhost:3001/api/auth/google/callback` (development)
   - `http://localhost:3002/api/auth/google/callback` (if using different port)
   - `https://yourdomain.com/api/auth/google/callback` (production)
6. Click "Create"

### Step 2: Get Your Credentials

You'll get a JSON file or screen with:
- **Client ID** - Looks like: `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret** - Long alphanumeric string

### Step 3: Update Your `.env` File

Create or update `.env` in the project root with:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback
```

**Important:** 
- Replace `your-client-id-here` and `your-client-secret-here` with your actual credentials
- Adjust the port (3001, 3002, etc.) to match your dev server port
- Never commit `.env` to version control
- Keep `GOOGLE_CLIENT_SECRET` private!

### Step 4: Restart the Dev Server

After updating `.env`:

```bash
# Stop the current server (Ctrl+C or similar)
# Then restart:
npm run dev
```

## Verification

Check the server console for:

**Before (Not Working):**
```
[OAuth] Initialized with baseURL: https://your-oauth-server.com
[Server] Listening on http://localhost:3001/
```

**After (Working):**
```
[OAuth] Initialized with baseURL: https://your-oauth-server.com
[Server] Listening on http://localhost:3001/
[Google OAuth] Generating auth URL
[Google OAuth] Auth URL generated successfully
```

## Testing Google OAuth

1. Start the dev server: `npm run dev`
2. Navigate to http://localhost:3001 (adjust port as needed)
3. Click "Login with Google"
4. You should be redirected to Google's login page
5. After authentication, you should be redirected back to your app

## File Structure Changes

**Files Involved:**
- `server/_core/env.ts` - Reads environment variables
- `server/_core/google-oauth.ts` - Handles Google OAuth logic
- `server/routers.ts` - Exposes OAuth endpoints
- `client/src/pages/OTPLogin.tsx` - Calls OAuth from frontend

## API Endpoints

The system exposes these OAuth endpoints:

### `GET /api/trpc/googleAuth.getAuthUrl`
**Returns:** `{ url: string }`
**Purpose:** Get the Google OAuth URL to redirect user to

### `POST /api/trpc/googleAuth.callback`
**Input:** `{ code: string }`
**Returns:** `{ success: boolean, user?: User }`
**Purpose:** Handle Google OAuth callback with authorization code

## Environment Variable Reference

```typescript
// From server/_core/env.ts
export const ENV = {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? "",
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL ?? "",
  // ... other variables
};
```

## Common Issues & Troubleshooting

### Issue 1: "Google OAuth not configured"
**Cause:** Environment variables not set or empty
**Fix:** Check `.env` file and verify credentials are correct

### Issue 2: Redirect URI mismatch error
**Cause:** `GOOGLE_CALLBACK_URL` doesn't match what's registered in Google Cloud Console
**Fix:** Ensure exact match (including protocol, domain, port, and path)

### Issue 3: Invalid client secret
**Cause:** Copied secret incorrectly or it expired
**Fix:** Generate a new OAuth credential in Google Cloud Console

### Issue 4: "Unauthorized" error
**Cause:** Client ID is wrong or not authorized for the callback URL
**Fix:** Verify Client ID matches what's in Google Cloud Console

## Production Deployment

For production, update your environment variables:

```bash
# .env.production or environment variables
GOOGLE_CLIENT_ID=production-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=production-client-secret
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
```

## Security Considerations

1. ✅ **Never share** `GOOGLE_CLIENT_SECRET` publicly
2. ✅ **Store securely** in environment variables, not in code
3. ✅ **Use HTTPS** in production
4. ✅ **Verify email** - System checks `email_verified` flag
5. ✅ **Validate tokens** - Uses Google's `verifyIdToken` for security

## Next Steps

1. ✅ Create Google Cloud project and OAuth credentials
2. ✅ Update `.env` file with credentials
3. ✅ Restart dev server
4. ✅ Test Google OAuth login
5. ✅ Set up production credentials for deployment

## Helpful Resources

- [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Auth Library for Node.js](https://github.com/googleapis/google-auth-library-nodejs)
- [AmeriLend OAuth Setup Guide](https://your-docs.com/oauth-setup)

---

**Current Implementation Status:**
- ✅ Backend OAuth flow implemented
- ✅ Frontend OAuth UI ready
- ✅ Error handling in place
- ⏳ **Waiting for:** Environment variables to be configured

Once you provide the Google OAuth credentials, the system will be fully functional!
