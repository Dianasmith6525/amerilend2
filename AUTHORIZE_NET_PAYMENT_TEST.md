# Authorize.net Payment Processor Testing Guide

**Date**: November 4, 2025  
**Issue**: Payment processor not testing with real API keys  
**Status**: ✅ FIXED

---

## 🔴 The Problem

You set `AUTHORIZENET_ENVIRONMENT=production` but used **sandbox credentials**:
- ❌ Production environment endpoint: `https://api.authorize.net/xml/v1/request.api`
- ✅ Sandbox credentials: `AUTHORIZENET_API_LOGIN_ID=48VRqhq22sMG` (test account)

**Result**: API rejected requests with unauthorized errors.

---

## ✅ The Fix (Applied)

Changed `.env` from:
```bash
AUTHORIZENET_ENVIRONMENT=production  # ❌ WRONG
```

To:
```bash
AUTHORIZENET_ENVIRONMENT=sandbox  # ✅ CORRECT
```

Now your configuration matches:
- ✅ Sandbox environment: `https://apitest.authorize.net/xml/v1/request.api`
- ✅ Sandbox credentials: `48VRqhq22sMG` + transaction key

---

## 🧪 Testing Checklist

### Step 1: Restart Your Dev Server
```bash
# Kill existing server
Stop-Process -Name node -Force -ErrorAction SilentlyContinue

# Restart dev server (will pick up new .env values)
pnpm dev
```

### Step 2: Test Payment Form (UI)
1. **Start application at** `http://localhost:3001`
2. **Create a test loan application** (through the normal flow)
3. **Go to payment page** when prompted
4. **Use Authorize.net test card**:

```
Card Number:   4111111111111111
Expiry:        12/25
CVV:           123
Zip Code:      12345
```

### Step 3: Verify in Console
When you submit, you should see in browser console:
- ✅ Accept.js loads successfully
- ✅ Card gets tokenized
- ✅ No CORS errors
- ✅ Success response from server

Expected console output:
```javascript
// Should show token received
{
  messages: { resultCode: "Ok" },
  opaqueData: {
    dataDescriptor: "COMMON.ACCEPT.INAPP.PAYMENT",
    dataValue: "..."
  }
}
```

### Step 4: Check Server Logs
In your terminal running `pnpm dev`, look for:
```
✅ Payment processed successfully!
   Transaction ID: [12345678]
   Amount: $5.75
   Status: Approved
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "Authorize.net credentials not configured"
**Cause**: Environment variables not loaded  
**Solution**:
```bash
# Restart dev server to pick up .env changes
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
pnpm dev
```

### Issue 2: "CORS error" on Accept.js script
**Cause**: Script loading issue  
**Solution**: 
- Clear browser cache: `Ctrl+Shift+Delete`
- Hard refresh page: `Ctrl+Shift+R`
- Check browser console for actual error

### Issue 3: "Invalid merchant credentials"
**Cause**: Using production endpoint with sandbox keys (or vice versa)  
**Solution**: 
- For sandbox testing: `AUTHORIZENET_ENVIRONMENT=sandbox`
- For production: Get production credentials from Authorize.net and use `AUTHORIZENET_ENVIRONMENT=production`

### Issue 4: Card always declined
**Cause**: Using invalid test card  
**Solution**: Use **only** `4111111111111111` for sandbox testing

---

## 📋 Environment Variable Checklist

Your current `.env` is now configured for **SANDBOX TESTING**:

```bash
# ✅ CORRECT SANDBOX CONFIGURATION
AUTHORIZENET_API_LOGIN_ID=48VRqhq22sMG
AUTHORIZENET_TRANSACTION_KEY=2P5aFS6546yM8yvq
AUTHORIZENET_CLIENT_KEY=54x82h6XqzRztxYthv53kVwVv4HW77FESYV6D2VTmU4HU2y3sbRt4KwV6wY3ZbkF
AUTHORIZENET_SIGNATURE_KEY=61F365F9C8EABB08B0ACC5A65B598049BD009D0ED64537845CC34EF786CDDEB7950951010E8332280904B054888E6DF50C15F46606B159B9B082B17F15B13BE1
AUTHORIZENET_ENVIRONMENT=sandbox
```

---

## 🔄 How Payment Processing Works

```
User fills payment form
          ↓
Accept.js tokenizes card (on frontend)
          ↓
Token sent to server
          ↓
Server validates token + amount
          ↓
Server calls Authorize.net API
          ↓
API returns transaction ID
          ↓
Server saves payment record
          ↓
Frontend shows success
```

**Key Point**: Card data NEVER hits your server - Accept.js keeps it secure!

---

## 📱 Test Card Numbers (Sandbox Only)

| Card Type | Number | Result |
|-----------|--------|--------|
| Visa | `4111111111111111` | ✅ Approved |
| Mastercard | `5555555555554444` | ✅ Approved |
| AmEx | `378282246310005` | ✅ Approved |
| Discover | `6011111111111117` | ✅ Approved |
| Invalid | `4222222222222220` | ❌ Declined |

**All expirations work**: Use any future date (MM/YY)  
**All CVVs work**: Use any 3-4 digits

---

## 🚀 Ready to Go Live? (When You Have Production Keys)

**Requirements**:
1. Sign up at https://www.authorize.net (not sandbox)
2. Get these production credentials:
   - API Login ID (production)
   - Transaction Key (production)
   - Client Key (production)
   - Signature Key (production)

**Then update `.env`**:
```bash
AUTHORIZENET_API_LOGIN_ID=your-production-login-id
AUTHORIZENET_TRANSACTION_KEY=your-production-transaction-key
AUTHORIZENET_CLIENT_KEY=your-production-client-key
AUTHORIZENET_SIGNATURE_KEY=your-production-signature-key
AUTHORIZENET_ENVIRONMENT=production  # ← Change to "production"
```

**Warning**: Once you set `AUTHORIZENET_ENVIRONMENT=production`, **real money will be charged**. Test thoroughly first!

---

## 🔗 Useful Links

- **Sandbox Account**: https://sandbox.authorize.net
- **API Docs**: https://developer.authorize.net
- **Test Card Numbers**: https://developer.authorize.net/api/reference/testvalues.html
- **Accept.js Docs**: https://developer.authorize.net/api/reference/features/acceptjs.html

---

## ✅ Troubleshooting Steps (In Order)

1. [ ] Verify `.env` has `AUTHORIZENET_ENVIRONMENT=sandbox`
2. [ ] Restart dev server: `pnpm dev`
3. [ ] Clear browser cache
4. [ ] Try test card: `4111111111111111` with any future date + any CVV
5. [ ] Check browser console for errors
6. [ ] Check terminal for server errors
7. [ ] Verify API credentials haven't expired
8. [ ] Try a different browser (to rule out cache issues)

---

## 📞 Support

If payment still isn't working after following this guide:

1. **Check Terminal Logs**: Look for error messages in `pnpm dev` output
2. **Check Browser Console**: `F12` → Console tab
3. **Network Tab**: `F12` → Network tab → look for failed requests
4. **Screenshot the error**: Share the exact error message

---

## 📝 Next Steps

- [ ] Restart dev server
- [ ] Test with sandbox card number `4111111111111111`
- [ ] Verify payment success in UI
- [ ] Check application status changes to "fee_paid"
- [ ] Verify disbursement options appear

---

**Last Updated**: November 4, 2025  
**Configuration Status**: ✅ Sandbox Testing Ready
