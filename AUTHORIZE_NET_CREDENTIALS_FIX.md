# ⚠️ Authorize.net Credentials Issue - FIX NEEDED

**Date**: November 5, 2025  
**Status**: ❌ Invalid API Credentials Detected  
**Issue**: Error E00007 - User authentication failed

---

## 🔴 The Problem

Your Authorize.net credentials are **invalid or expired**:

```
API Login ID:       48VRqhq22sMG
Transaction Key:    2P5aFS6546yM8yvq
Environment:        sandbox
```

**API Response**:
```json
{
  "messages": {
    "resultCode": "Error",
    "message": [{
      "code": "E00007",
      "text": "User authentication failed due to invalid authentication values."
    }]
  }
}
```

---

## ✅ How to Fix

You need to **get new Authorize.net sandbox credentials**. Here's how:

### Step 1: Create Free Authorize.net Sandbox Account

1. Go to: https://developer.authorize.net/sandbox
2. Click **"Create an Account"**
3. Fill in your details:
   - Company: `AmeriLend`
   - Email: your email
   - Password: strong password
   - Account Type: **Sandbox** ← Important!

4. Click **"Create Account"**

### Step 2: Log In to Sandbox

1. Go to: https://sandbox.authorize.net
2. Login with the account you just created
3. Dashboard should appear

### Step 3: Get Your API Login ID

1. In the sandbox dashboard, click **"Account"** (top right)
2. Select **"API Credentials & Keys"** or **"Settings"**
3. Look for **"API Login ID"**
4. Copy it (looks like: `2jY2r9S8V3...`)

### Step 4: Get Your Transaction Key

1. Still in API Credentials section
2. Look for **"Transaction Key"** or **"New Transaction Key"**
3. If not visible, click **"New Transaction Key"** to generate one
4. Copy the new key (long alphanumeric string)

### Step 5: Get Your Client Key (Public Key)

1. Still in API Credentials section
2. Look for **"Client Key"** or **"Public Client Key"**
3. If not visible, click **"Generate New Key"** 
4. Copy the Client Key

### Step 6: Update .env File

Replace your `.env` file with the **real credentials**:

```bash
# OLD (INVALID) - DELETE THESE
AUTHORIZENET_API_LOGIN_ID=48VRqhq22sMG                 # ❌ Invalid
AUTHORIZENET_TRANSACTION_KEY=2P5aFS6546yM8yvq           # ❌ Invalid

# NEW (REAL) - USE YOUR NEW CREDENTIALS
AUTHORIZENET_API_LOGIN_ID=YOUR_NEW_API_LOGIN_ID         # ✅ From Step 3
AUTHORIZENET_TRANSACTION_KEY=YOUR_NEW_TRANSACTION_KEY   # ✅ From Step 4
AUTHORIZENET_CLIENT_KEY=YOUR_NEW_CLIENT_KEY             # ✅ From Step 5
AUTHORIZENET_ENVIRONMENT=sandbox                        # ✅ IMPORTANT!
```

### Step 7: Restart Your Dev Server

```bash
# Kill existing process
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Restart
pnpm dev
```

### Step 8: Test Again

```bash
node test-authorize-net-debug.mjs
```

Should see: ✅ **All tests passing**

---

## 📋 What You Need to Fill In

When you get your credentials from Authorize.net sandbox, they will look like this format:

| Field | Example | Your Value |
|-------|---------|-----------|
| **API Login ID** | `2jY2r9S8V3...` | `_____________` |
| **Transaction Key** | `5s7K9mL2pQ...` | `_____________` |
| **Client Key** | `54x82h6Xqz...` | `_____________` |
| **Signature Key** | `61F365F9C8E...` | `_____________` |

---

## 🔐 Important Security Notes

**NEVER**:
- Share these keys with anyone
- Commit `.env` to GitHub
- Use production keys during development

**ALWAYS**:
- Use sandbox keys for testing
- Store keys in `.env` (not in code)
- Rotate keys regularly in production

---

## 🧪 Test Cards (After Getting Real Credentials)

Once you have valid credentials, test with these cards:

```
Visa:        4111111111111111
Mastercard:  5555555555554444
AmEx:        378282246310005
Discover:    6011111111111117

Expiry:      Any future date (12/25, 01/26, etc.)
CVV:         Any 3-4 digits (123, 1234, etc.)
Zip:         Any 5 digits (12345, 90210, etc.)
```

---

## ❌ Common Errors & How to Fix

| Error Code | Meaning | Solution |
|-----------|---------|----------|
| **E00007** | Invalid credentials | Get new credentials from sandbox.authorize.net |
| **E00008** | Invalid API Login ID | Check your API Login ID is correct |
| **E00009** | Merchant account locked | Account may have expired - create new one |
| **E00013** | Invalid transaction type | Use "authCaptureTransaction" |
| **E00001** | General error | Check all credentials are filled in |

---

## 🚀 Quick Summary

```
❌ Current Status: Invalid credentials (E00007 error)

✅ To Fix:
1. Go to https://developer.authorize.net/sandbox
2. Create FREE sandbox account
3. Get API Login ID + Transaction Key + Client Key
4. Update .env with new credentials
5. Restart dev server: pnpm dev
6. Run test: node test-authorize-net-debug.mjs
7. Should see ✅ Success

⏱️ Time Required: 5-10 minutes
```

---

## 📞 Need More Help?

**Authorize.net Resources**:
- Sandbox Setup: https://developer.authorize.net/sandbox
- API Docs: https://developer.authorize.net/api/reference
- Support: support@authorize.net

**For AmeriLend**:
- After getting credentials, update `.env`
- Restart server
- Test with sandbox card: `4111111111111111`

---

## ✅ Verification Steps After Fix

```bash
# 1. Update .env with real credentials
# 2. Restart server
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
pnpm dev

# 3. Run test
node test-authorize-net-debug.mjs

# 4. Expected output: "User authentication failed" → NO ERROR (credentials accepted)
# 5. Or see "Transaction declined" (expected with fake token, means creds work)

# 6. Test in browser
# - Go to http://localhost:3001
# - Create loan application
# - Go to payment page
# - Use test card: 4111111111111111
# - Should work!
```

---

**Status**: Once you update `.env` with real credentials and restart, everything will work! 🎉

Last Updated: November 5, 2025
