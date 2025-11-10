# 🚀 Quick Deployment Checklist for www.amerilendloan.com

## Pre-Deployment Setup

### ✅ 1. Get Your Manus.im Database Connection String
- [ ] Log into manus.im dashboard
- [ ] Copy MySQL connection string
- [ ] Format: `mysql://username:password@host.manus.im:4000/database_name`
- [ ] Save this for Step 3

### ✅ 2. Setup SendGrid (Email Service)
- [ ] Sign up at https://sendgrid.com (FREE)
- [ ] Verify your sender email
- [ ] Create API key (Settings → API Keys → Create API Key)
- [ ] Copy API key (starts with `SG.`)
- [ ] Keep this safe for Step 3

### ✅ 3. Setup Authorize.Net (Payment Processing)
- [ ] Sign up at https://www.authorize.net
- [ ] Get API credentials from dashboard
- [ ] Start with SANDBOX mode for testing
- [ ] Save credentials for Step 3

### ✅ 4. Generate JWT Secret
- [ ] Open PowerShell
- [ ] Run: `-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})`
- [ ] Copy the generated string
- [ ] Save for Step 3

---

## Deployment Steps

### 📦 Step 1: Build Your Application
```powershell
# From your project directory
cd C:\Users\USER\Downloads\amerilend

# Install dependencies (if needed)
npm install

# Build production bundle
npm run build
```

**Expected output:**
- ✅ `dist/` folder created
- ✅ `dist/index.html` exists (frontend)
- ✅ `dist/index.js` exists (backend)

---

### 🌐 Step 2: Deploy to Vercel

**Install Vercel CLI:**
```powershell
npm install -g vercel
```

**Login to Vercel:**
```powershell
vercel login
```

**Deploy:**
```powershell
# First deployment (creates project)
vercel

# When prompted:
# - Project name: amerilend
# - Directory: ./ (current directory)
# - Build command: npm run build
# - Output directory: dist
# - Development command: npm run dev
```

**Production deployment:**
```powershell
vercel --prod
```

---

### 🔑 Step 3: Add Environment Variables in Vercel

**Go to Vercel Dashboard:**
1. Visit https://vercel.com/dashboard
2. Select your `amerilend` project
3. Go to **Settings** → **Environment Variables**

**Add these variables (one by one):**

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `DATABASE_URL` | `mysql://user:pass@host.manus.im:4000/db` | Production |
| `JWT_SECRET` | Your generated 32+ char string | Production |
| `NODE_ENV` | `production` | Production |
| `SENDGRID_API_KEY` | `SG.xxxxxx` from SendGrid | Production |
| `SENDGRID_FROM_EMAIL` | `noreply@amerilendloan.com` | Production |
| `AUTHORIZENET_API_LOGIN_ID` | From Authorize.Net | Production |
| `AUTHORIZENET_TRANSACTION_KEY` | From Authorize.Net | Production |
| `AUTHORIZENET_CLIENT_KEY` | From Authorize.Net | Production |
| `AUTHORIZENET_ENVIRONMENT` | `sandbox` (test) or `production` | Production |
| `OAUTH_SERVER_URL` | Your OAuth server URL | Production |
| `VITE_APP_ID` | Your app ID from manus.im | Production |

**Redeploy after adding variables:**
```powershell
vercel --prod
```

---

### 🌍 Step 4: Connect Your Domain (Squarespace → Vercel)

**In Vercel Dashboard:**
1. Go to your project → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `www.amerilendloan.com`
4. Click **Add**
5. Vercel will show you DNS records to add

**In Squarespace:**
1. Log into https://account.squarespace.com
2. Go to **Settings** → **Domains**
3. Click on **www.amerilendloan.com**
4. Click **DNS Settings**
5. Add the CNAME record Vercel provided:
   - **Type:** CNAME
   - **Host:** www
   - **Value:** cname.vercel-dns.com (or what Vercel shows)
6. For root domain (amerilendloan.com):
   - **Type:** A
   - **Host:** @
   - **Value:** 76.76.21.21 (Vercel's IP)
7. Click **Save**

**Wait for DNS propagation:**
- Usually takes 10-30 minutes
- Can take up to 24 hours
- Check status: https://dnschecker.org

---

### 🗄️ Step 5: Run Database Migrations

```powershell
# Pull environment variables from Vercel
vercel env pull

# Run migrations
npm run db:push
```

---

### 👤 Step 6: Create Admin User

**Option A: Use setup script**
```powershell
node setup-admin.mjs
```

**Option B: Manually in database**
- Log into manus.im dashboard
- Find your user in the `users` table
- Update `role` column to `'admin'`

---

## Post-Deployment Testing

### ✅ Test Checklist (in order):

1. **Basic Access**
   - [ ] Visit https://www.amerilendloan.com
   - [ ] Page loads correctly
   - [ ] HTTPS lock icon shows (secure)

2. **OTP Login**
   - [ ] Click "Login" or "Apply Now"
   - [ ] Enter your email
   - [ ] Check email for OTP code (check spam)
   - [ ] Enter OTP and login successfully

3. **User Dashboard**
   - [ ] Dashboard loads with all sections
   - [ ] Statistics cards show data
   - [ ] Loan calculator works
   - [ ] All 4 tabs work (Applications, Referrals, Activity, Calculator)

4. **Loan Application**
   - [ ] Click "Apply for Loan"
   - [ ] Fill out application form
   - [ ] Submit successfully
   - [ ] Check email for confirmation

5. **User Profile**
   - [ ] Navigate to profile
   - [ ] Test "Change Email" dialog
   - [ ] Test "Change Password" dialog
   - [ ] Update phone number

6. **Admin Dashboard** (if admin user)
   - [ ] Access admin panel
   - [ ] View fraud dashboard
   - [ ] Manage loan applications

7. **Mobile Test**
   - [ ] Open on phone
   - [ ] Check responsive design
   - [ ] Test navigation

---

## 🎯 Production Checklist

Before going fully live:

- [ ] All environment variables set in Vercel
- [ ] Database migrations completed
- [ ] Admin user created
- [ ] Email sending works (SendGrid configured)
- [ ] Payments work (Authorize.Net sandbox tested)
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Custom domain working (www.amerilendloan.com)
- [ ] All features tested on production
- [ ] Mobile responsive design tested
- [ ] Legal pages accessible (Terms, Privacy)
- [ ] Customer support number correct: (945) 212-1609

---

## 🆘 Quick Troubleshooting

**Problem: Site not loading**
- Check DNS propagation: https://dnschecker.org
- Verify Vercel deployment succeeded
- Check Vercel logs for errors

**Problem: OTP emails not sending**
- Verify SENDGRID_API_KEY in Vercel
- Check SendGrid dashboard for errors
- Verify sender email is verified in SendGrid

**Problem: Database connection failed**
- Verify DATABASE_URL is correct in Vercel
- Check manus.im database status
- Ensure SSL is enabled

**Problem: Payment processing failed**
- Check Authorize.Net credentials
- Verify AUTHORIZENET_ENVIRONMENT setting
- Check Authorize.Net dashboard for logs

---

## 📞 Need Help?

**Vercel Support:**
- Docs: https://vercel.com/docs
- Community: https://github.com/vercel/vercel/discussions

**Manus.im Support:**
- Check your manus.im dashboard for support options

**SendGrid Support:**
- Docs: https://sendgrid.com/docs
- Support: https://support.sendgrid.com

---

## 🎉 You're Live!

Once all checklist items are complete, your AmeriLend platform is **LIVE** at:
**https://www.amerilendloan.com**

Share with customers and start accepting loan applications! 🚀

---

**Estimated Time: 1-2 hours** (most time is waiting for DNS propagation)
