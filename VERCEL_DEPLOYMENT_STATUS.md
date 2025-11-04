# 🚀 Vercel Environment Variables - Ready to Deploy

## Your Deployment is Live (but needs environment variables):
**Preview URL:** https://amerilend-ah50vml2w-dianas-projects-32e424a3.vercel.app

## Go to Vercel Dashboard:
https://vercel.com/dianas-projects-32e424a3/amerilend/settings/environment-variables

---

## ✅ Add These Environment Variables (One by One):

### 1. DATABASE_URL (REQUIRED)
**Value:**
```
mysql://3ZrrJMbxK9yUuwj.root:M4iGBMvS4k4cEJANC546@gateway02.us-east-1.prod.aws.tidbcloud.com:4000/SKaMVdMNraqB5VhX78BegA?ssl={"rejectUnauthorized":true}
```
**Environment:** Production ✅

---

### 2. JWT_SECRET (REQUIRED)
**Value:**
```
K50eRmIUVgauLDiy94f3ACHhZqp7Sx1r
```
**Environment:** Production ✅

---

### 3. NODE_ENV (REQUIRED)
**Value:**
```
production
```
**Environment:** Production ✅

---

### 4. SENDGRID_API_KEY (REQUIRED - Get from SendGrid)
**Value:**
```
SG.YOUR_API_KEY_HERE
```
**Environment:** Production ✅

**To Get This:**
1. Go to https://sendgrid.com and sign up (FREE)
2. Settings → API Keys → Create API Key
3. Copy the key that starts with `SG.`

---

### 5. SENDGRID_FROM_EMAIL (REQUIRED)
**Value:**
```
noreply@amerilend.net
```
**Environment:** Production ✅

**Important:** You need to verify this email in SendGrid:
- Settings → Sender Authentication → Verify Single Sender
- For testing, you can use your personal email instead

---

### 6. AUTHORIZENET_API_LOGIN_ID (For Payments - Can Add Later)
**Value:**
```
YOUR_API_LOGIN_ID
```
**Environment:** Production

**To Get This:** Sign up at https://sandbox.authorize.net (for testing)

---

### 7. AUTHORIZENET_TRANSACTION_KEY (For Payments - Can Add Later)
**Value:**
```
YOUR_TRANSACTION_KEY
```
**Environment:** Production

---

### 8. AUTHORIZENET_CLIENT_KEY (For Payments - Can Add Later)
**Value:**
```
YOUR_CLIENT_KEY
```
**Environment:** Production

---

### 9. AUTHORIZENET_ENVIRONMENT (For Payments)
**Value:**
```
sandbox
```
**Environment:** Production
**Note:** Use `sandbox` for testing, `production` when going live

---

### 10. OAUTH_SERVER_URL (Optional - Manus OAuth)
**Value:**
```
https://your-oauth-server.com
```
**Environment:** Production
**Note:** Only if you're using Manus OAuth

---

### 11. VITE_APP_ID (Optional - Manus OAuth)
**Value:**
```
your-app-id
```
**Environment:** Production
**Note:** Only if you're using Manus OAuth

---

## 🎯 Quick Start - Minimum Required to Test:

**Add these 5 NOW to get your site working:**

1. ✅ DATABASE_URL (you have this)
2. ✅ JWT_SECRET (you have this)
3. ✅ NODE_ENV (set to `production`)
4. ⚠️ SENDGRID_API_KEY (get from SendGrid - 5 min setup)
5. ⚠️ SENDGRID_FROM_EMAIL (use verified email)

**Payment variables can be added later when ready to test payments.**

---

## 📋 Steps After Adding Variables:

1. Add the variables in Vercel dashboard
2. After adding, redeploy:
   ```powershell
   npx vercel --prod
   ```
3. Or Vercel will auto-deploy on next git push

---

## 🔗 Next Step: Custom Domain

Once environment variables are working:

1. Go to: https://vercel.com/dianas-projects-32e424a3/amerilend/settings/domains
2. Click "Add Domain"
3. Enter: `www.amerilend.net`
4. Follow Vercel's DNS instructions
5. Add DNS records in Squarespace

---

## 🆘 Quick SendGrid Setup (5 Minutes):

1. **Sign Up:** https://sendgrid.com (FREE - 100 emails/day)
2. **Verify Email:** Check your inbox and verify
3. **Create API Key:**
   - Settings → API Keys
   - Create API Key → Full Access
   - Copy key (starts with `SG.`)
4. **Verify Sender:**
   - Settings → Sender Authentication
   - Verify Single Sender
   - Use your email or noreply@amerilend.net
5. **Add to Vercel:**
   - SENDGRID_API_KEY: (paste the SG. key)
   - SENDGRID_FROM_EMAIL: (the verified email)

---

## ✅ Checklist:

- [x] Repository pushed to GitHub
- [x] Deployed to Vercel
- [x] Database URL ready
- [x] JWT Secret generated
- [ ] Add DATABASE_URL to Vercel
- [ ] Add JWT_SECRET to Vercel
- [ ] Add NODE_ENV to Vercel
- [ ] Setup SendGrid account
- [ ] Add SENDGRID variables to Vercel
- [ ] Redeploy with: `npx vercel --prod`
- [ ] Test site login
- [ ] Configure custom domain (www.amerilend.net)

---

**You're almost there! Just need to add environment variables in Vercel! 🚀**
