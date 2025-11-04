# 🔐 Social Login Setup Guide - AmeriLend

## Overview
This guide will help you set up Google, Facebook, Microsoft, and Apple login for your AmeriLend application.

---

## 🌐 Google OAuth Setup (Recommended First)

### Step 1: Create Google Cloud Project

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create New Project:**
   - Click "Select a Project" → "New Project"
   - Project Name: `AmeriLend`
   - Click "Create"

### Step 2: Enable Google+ API

1. **Enable APIs:**
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"

### Step 3: Create OAuth Credentials

1. **Go to Credentials:**
   - APIs & Services → Credentials
   - Click "Create Credentials" → "OAuth client ID"

2. **Configure OAuth Consent Screen:** (if prompted)
   - User Type: External
   - App Name: `AmeriLend`
   - User Support Email: your-email@example.com
   - Developer Contact: your-email@example.com
   - Click "Save and Continue"

3. **Create OAuth Client ID:**
   - Application Type: "Web application"
   - Name: `AmeriLend Web`
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     https://amerilend.vercel.app
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/google/callback
     https://amerilend.vercel.app/api/auth/google/callback
     ```
   - Click "Create"

4. **Copy Credentials:**
   - Copy "Client ID" (ends with `.apps.googleusercontent.com`)
   - Copy "Client Secret"

### Step 4: Add to Environment Variables

**In Vercel:**
```powershell
npx vercel env add GOOGLE_CLIENT_ID production
npx vercel env add GOOGLE_CLIENT_SECRET production
npx vercel env add GOOGLE_CALLBACK_URL production
```

**Values:**
- GOOGLE_CLIENT_ID: (paste your Client ID)
- GOOGLE_CLIENT_SECRET: (paste your Client Secret)
- GOOGLE_CALLBACK_URL: `https://amerilend.vercel.app/api/auth/google/callback`

---

## 📘 Facebook OAuth Setup

### Step 1: Create Facebook App

1. **Go to Facebook Developers:**
   - Visit: https://developers.facebook.com/
   - Click "My Apps" → "Create App"

2. **Select Use Case:**
   - Select "Consumer"
   - Click "Next"

3. **App Details:**
   - App Name: `AmeriLend`
   - App Contact Email: your-email@example.com
   - Click "Create App"

### Step 2: Add Facebook Login

1. **Add Product:**
   - Find "Facebook Login" → Click "Set Up"
   - Select "Web"

2. **Configure Settings:**
   - Go to "Facebook Login" → "Settings"
   - Valid OAuth Redirect URIs:
     ```
     http://localhost:3000/api/auth/facebook/callback
     https://amerilend.vercel.app/api/auth/facebook/callback
     ```
   - Click "Save Changes"

### Step 3: Get App Credentials

1. **Go to Settings → Basic:**
   - Copy "App ID"
   - Click "Show" for "App Secret" and copy it

### Step 4: Add to Environment Variables

```powershell
npx vercel env add FACEBOOK_APP_ID production
npx vercel env add FACEBOOK_APP_SECRET production
npx vercel env add FACEBOOK_CALLBACK_URL production
```

---

## 🪟 Microsoft OAuth Setup

### Step 1: Register App in Azure

1. **Go to Azure Portal:**
   - Visit: https://portal.azure.com/
   - Sign in with Microsoft account

2. **Register Application:**
   - Go to "Azure Active Directory" → "App registrations"
   - Click "New registration"
   - Name: `AmeriLend`
   - Supported account types: "Accounts in any organizational directory and personal Microsoft accounts"
   - Redirect URI:
     - Platform: Web
     - URL: `https://amerilend.vercel.app/api/auth/microsoft/callback`
   - Click "Register"

### Step 2: Configure Authentication

1. **Add Platform:**
   - Go to "Authentication"
   - Add redirect URIs:
     ```
     http://localhost:3000/api/auth/microsoft/callback
     https://amerilend.vercel.app/api/auth/microsoft/callback
     ```

### Step 3: Create Client Secret

1. **Certificates & Secrets:**
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Description: `AmeriLend Web`
   - Expires: 24 months
   - Click "Add"
   - **IMPORTANT:** Copy the secret VALUE immediately (it won't show again)

### Step 4: Get Application ID

1. **Overview Page:**
   - Copy "Application (client) ID"

### Step 5: Add to Environment Variables

```powershell
npx vercel env add MICROSOFT_CLIENT_ID production
npx vercel env add MICROSOFT_CLIENT_SECRET production
npx vercel env add MICROSOFT_CALLBACK_URL production
```

---

## 🍎 Apple Sign In Setup (Advanced)

### Step 1: Apple Developer Account

1. **Requirements:**
   - Apple Developer Account ($99/year)
   - Visit: https://developer.apple.com/

### Step 2: Register Service ID

1. **Certificates, Identifiers & Profiles:**
   - Go to "Identifiers" → Click "+"
   - Select "Services IDs" → Continue
   - Description: `AmeriLend`
   - Identifier: `com.amerilend.web`
   - Check "Sign In with Apple"
   - Click "Configure"

2. **Configure Sign In with Apple:**
   - Primary App ID: Select your app ID
   - Domains and Subdomains:
     ```
     amerilend.vercel.app
     ```
   - Return URLs:
     ```
     https://amerilend.vercel.app/api/auth/apple/callback
     ```
   - Click "Save"

### Step 3: Create Private Key

1. **Keys:**
   - Go to "Keys" → Click "+"
   - Key Name: `AmeriLend Sign In Key`
   - Check "Sign In with Apple"
   - Configure → Select your Primary App ID
   - Click "Save" → "Continue" → "Register"
   - **Download the .p8 file** (you can't download it again!)

### Step 4: Get Required Information

- **Team ID:** Found in Membership Details
- **Key ID:** From the key you just created
- **Service ID:** `com.amerilend.web` (what you created)
- **Private Key:** Contents of the .p8 file

### Step 5: Add to Environment Variables

```powershell
npx vercel env add APPLE_CLIENT_ID production
npx vercel env add APPLE_TEAM_ID production
npx vercel env add APPLE_KEY_ID production
npx vercel env add APPLE_PRIVATE_KEY production
npx vercel env add APPLE_CALLBACK_URL production
```

---

## ✅ Quick Start (Google Only - Easiest)

For now, just set up **Google Sign-In**:

1. ✅ Create Google Cloud Project
2. ✅ Enable Google+ API
3. ✅ Create OAuth Client ID
4. ✅ Add credentials to Vercel
5. ✅ Redeploy: `npx vercel --prod`

---

## 🚀 After Setup

Once you've added the environment variables to Vercel:

1. **Redeploy:**
   ```powershell
   npx vercel --prod
   ```

2. **Test Login:**
   - Go to https://amerilend.vercel.app/login
   - Click "Continue with Google" (or other provider)
   - Complete OAuth flow
   - Should redirect to dashboard

---

## 🔧 Troubleshooting

**"Redirect URI mismatch" error:**
- Make sure redirect URI in provider matches exactly
- Include both `http://localhost:3000` (dev) and `https://amerilend.vercel.app` (prod)
- No trailing slashes!

**"Invalid client" error:**
- Double-check CLIENT_ID and CLIENT_SECRET
- Make sure they're added to Vercel production environment

**OAuth consent screen warning:**
- For Google, publish your OAuth consent screen to production
- Or add test users in development mode

---

## 📋 Environment Variables Checklist

After setup, you should have these in Vercel:

### Required (Already Set):
- [x] DATABASE_URL
- [x] JWT_SECRET
- [x] NODE_ENV

### For Full Login (Set These):
- [ ] SENDGRID_API_KEY (for email OTP)
- [ ] SENDGRID_FROM_EMAIL

### For Google Login (Recommended):
- [ ] GOOGLE_CLIENT_ID
- [ ] GOOGLE_CLIENT_SECRET
- [ ] GOOGLE_CALLBACK_URL

### For Facebook Login (Optional):
- [ ] FACEBOOK_APP_ID
- [ ] FACEBOOK_APP_SECRET
- [ ] FACEBOOK_CALLBACK_URL

### For Microsoft Login (Optional):
- [ ] MICROSOFT_CLIENT_ID
- [ ] MICROSOFT_CLIENT_SECRET
- [ ] MICROSOFT_CALLBACK_URL

### For Apple Login (Optional):
- [ ] APPLE_CLIENT_ID
- [ ] APPLE_TEAM_ID
- [ ] APPLE_KEY_ID
- [ ] APPLE_PRIVATE_KEY
- [ ] APPLE_CALLBACK_URL

---

## 💡 Recommendation

**Start with Google OAuth** - it's the easiest and most popular:
1. Setup time: ~10 minutes
2. Free forever
3. Most users have Google accounts
4. Best documentation

Add others later as needed!

---

**Need help? Let me know where you're stuck!** 🚀
