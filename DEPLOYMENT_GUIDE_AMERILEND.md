# AmeriLend Deployment Guide - www.amerilend.net

## Overview
This guide will walk you through deploying your AmeriLend application to production on **www.amerilend.net** (Squarespace domain) with your **manus.im database**.

**Technology Stack:**
- Frontend: React + Vite
- Backend: Express.js + tRPC + Node.js
- Database: Manus.im (TiDB MySQL)
- Domain: www.amerilend.net (Squarespace)

---

## 🚀 Quick Deployment Path

**Best Option: Deploy to Vercel** (Recommended)
- ✅ Free tier available
- ✅ Automatic SSL/HTTPS
- ✅ Easy GitHub integration
- ✅ Supports full-stack apps (frontend + backend)
- ✅ Simple environment variable management
- ✅ Custom domain support

**Alternative Options:**
- Railway.app (simple, paid but affordable)
- Render.com (free tier, straightforward)

---

## Step 1: Prepare Environment Variables

Create a `.env.production` file (DO NOT commit to GitHub):

```bash
# Database Configuration (Manus.im)
DATABASE_URL=mysql://your-username:your-password@your-host.manus.im:4000/amerilend

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secure-random-string-min-32-chars

# OAuth Configuration (Manus Runtime)
OAUTH_SERVER_URL=https://your-actual-oauth-server.com
VITE_APP_ID=your-actual-app-id
OWNER_OPEN_ID=your-owner-open-id

# Server Configuration
NODE_ENV=production
PORT=3000

# SendGrid Email Service (REQUIRED for OTP login)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@amerilend.net

# Twilio SMS (Optional - for SMS OTP)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+19452121609

# Authorize.net Payment Gateway (REQUIRED for payments)
AUTHORIZENET_API_LOGIN_ID=your-api-login-id
AUTHORIZENET_TRANSACTION_KEY=your-transaction-key
AUTHORIZENET_CLIENT_KEY=your-public-client-key
AUTHORIZENET_SIGNATURE_KEY=your-webhook-signature-key
AUTHORIZENET_ENVIRONMENT=production

# Cryptocurrency Payment Gateway (Optional)
COINBASE_COMMERCE_API_KEY=your-coinbase-commerce-api-key
COINBASE_COMMERCE_WEBHOOK_SECRET=your-webhook-secret
CRYPTO_PAYMENT_ENVIRONMENT=production

# AWS S3 (Optional - for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=amerilend-documents
```

### 🔑 How to Get These Values:

**1. DATABASE_URL (Manus.im)**
- Log into your manus.im dashboard
- Navigate to your database/project
- Copy the MySQL connection string
- Format: `mysql://username:password@host.manus.im:4000/database_name`

**2. JWT_SECRET**
- Generate a secure random string (32+ characters)
- On Windows PowerShell: 
  ```powershell
  -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
  ```

**3. SENDGRID_API_KEY**
- Sign up at https://sendgrid.com (free tier: 100 emails/day)
- Go to Settings → API Keys
- Create new API key with "Full Access"
- Copy the key (starts with `SG.`)

**4. AUTHORIZENET (Payment Gateway)**
- Sign up at https://www.authorize.net
- Use sandbox for testing: https://sandbox.authorize.net
- Get credentials from Account → API Credentials & Keys

**5. OAUTH (Manus Runtime)**
- If you're using Manus.im for OAuth, get values from your Manus dashboard
- Otherwise, you may need to set up your own OAuth server

---

## Step 2: Build Production Bundle

First, test the build locally:

```powershell
# Install dependencies (if not already done)
npm install

# Build the application
npm run build
```

This will:
1. Build the React frontend (output: `dist/client`)
2. Bundle the Express backend (output: `dist/index.js`)

**Verify build success:**
- Check `dist/` folder exists
- Check `dist/index.html` (frontend)
- Check `dist/index.js` (backend)

---

## Step 3: Deploy to Vercel

### A. Install Vercel CLI

```powershell
npm install -g vercel
```

### B. Login to Vercel

```powershell
vercel login
```

### C. Create `vercel.json` Configuration

I'll create this file for you in the next step with proper settings.

### D. Deploy

```powershell
# First deployment (creates project)
vercel

# Production deployment
vercel --prod
```

### E. Set Environment Variables in Vercel

**Option 1: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add all variables from your `.env.production` file

**Option 2: Via CLI**
```powershell
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add SENDGRID_API_KEY
# ... (add all variables)
```

---

## Step 4: Configure Custom Domain (Squarespace → Vercel)

### A. Get Vercel DNS Settings

1. In Vercel Dashboard → Your Project → Settings → Domains
2. Click "Add Domain"
3. Enter: `www.amerilend.net`
4. Vercel will provide DNS records (A record or CNAME)

### B. Configure Squarespace DNS

1. Log into Squarespace: https://account.squarespace.com
2. Go to Settings → Domains → www.amerilend.net
3. Click "DNS Settings"
4. Add the records Vercel provided:

**Typical Configuration:**
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

**For root domain (amerilend.net):**
```
Type: A
Host: @
Value: 76.76.21.21 (Vercel's IP)
```

5. Save changes
6. Wait for DNS propagation (5 minutes - 24 hours, typically ~10 minutes)

### C. Verify Domain in Vercel

1. Back in Vercel Dashboard → Domains
2. Click "Verify" next to your domain
3. Once verified, Vercel will automatically provision SSL certificate

---

## Step 5: Database Migration (Manus.im)

Run database migrations to ensure production DB is up to date:

```powershell
# Set production database URL temporarily
$env:DATABASE_URL="mysql://your-username:your-password@your-host.manus.im:4000/amerilend"

# Run migrations
npm run db:push

# Verify tables exist
# (You can check in manus.im dashboard or use a MySQL client)
```

---

## Step 6: Post-Deployment Testing

### ✅ Test Checklist:

1. **Visit your site**: https://www.amerilend.net
2. **Test OTP Login**:
   - Try logging in with email
   - Verify OTP email arrives (check spam folder)
   - Complete login flow
3. **Test User Dashboard**:
   - Check all tabs load (Applications, Referrals, Activity, Calculator)
   - Verify loan statistics display
   - Test loan calculator widget
4. **Test Loan Application**:
   - Submit a test loan application
   - Verify email notifications work
5. **Test Payments** (with test credentials):
   - Navigate to payment page
   - Test Authorize.Net integration (use sandbox)
6. **Test Profile**:
   - Change email functionality
   - Change password functionality
   - Update phone number
7. **Test Admin Dashboard**:
   - Login as admin
   - Verify fraud detection dashboard
   - Check loan management features
8. **Mobile Testing**:
   - Test on mobile device
   - Verify responsive design works

---

## Step 7: Setup Admin User

Run the admin setup script in production:

```powershell
# SSH into Vercel or use Vercel CLI
vercel env pull

# Run admin setup
node setup-admin.mjs
```

Or manually create admin via database:
- Update user record in manus.im database
- Set `role = 'admin'` for your admin email

---

## 🔒 Security Checklist

Before going live:

- [ ] All environment variables are set in Vercel (not committed to repo)
- [ ] JWT_SECRET is strong and random (32+ characters)
- [ ] Database uses SSL connection (already configured in drizzle.config.ts)
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Authorize.Net is in production mode (not sandbox)
- [ ] SendGrid "From Email" matches your domain (@amerilend.net)
- [ ] CORS is properly configured for production domain
- [ ] Remove any console.log statements with sensitive data
- [ ] Rate limiting is enabled for OTP endpoints

---

## 📊 Monitoring & Maintenance

### Vercel Analytics
- Enable in Vercel Dashboard → Analytics
- Monitor page views, performance, errors

### Database Monitoring (Manus.im)
- Check database dashboard regularly
- Monitor connection count
- Watch query performance

### Email Delivery (SendGrid)
- Monitor email delivery rates
- Check bounce/spam rates
- Keep under free tier limits (100/day) or upgrade

### Error Tracking
- Consider adding Sentry for error tracking
- Monitor Vercel logs for server errors

---

## 💰 Cost Breakdown (Starting Free)

**Monthly Costs:**

| Service | Free Tier | Paid Plan (when needed) |
|---------|-----------|-------------------------|
| Vercel | ✅ Free (hobby) | $20/month (Pro) |
| Manus.im Database | Check your plan | Variable |
| SendGrid | 100 emails/day free | $15/month (40k emails) |
| Authorize.Net | No free tier | $25/month + transaction fees |
| Squarespace Domain | ~$20/year | Included with site plan |

**Total to start**: ~$20-30/year (just domain if using free tiers)

---

## 🆘 Troubleshooting

### Issue: "Database connection failed"
**Solution**: 
- Verify DATABASE_URL is correct in Vercel env vars
- Check manus.im database is running and accessible
- Ensure SSL is enabled in drizzle.config.ts

### Issue: "OTP emails not sending"
**Solution**:
- Verify SENDGRID_API_KEY is correct
- Check SendGrid dashboard for error logs
- Verify sender email is verified in SendGrid

### Issue: "Domain not working"
**Solution**:
- Check DNS propagation: https://dnschecker.org
- Verify CNAME record in Squarespace points to Vercel
- Wait up to 24 hours for DNS propagation

### Issue: "Payment processing failed"
**Solution**:
- Verify Authorize.Net credentials are for production (not sandbox)
- Check Authorize.Net dashboard for transaction logs
- Ensure AUTHORIZENET_ENVIRONMENT=production

### Issue: "OAuth login not working"
**Solution**:
- Verify OAUTH_SERVER_URL is correct
- Check VITE_APP_ID matches your Manus app
- Ensure OAuth redirect URLs include production domain

---

## 🎯 Next Steps After Deployment

1. **SSL Certificate**: Verify HTTPS is working (Vercel does this automatically)
2. **Email Domain**: Set up SPF/DKIM records for better email delivery
3. **Google Search Console**: Submit sitemap for SEO
4. **Analytics**: Add Google Analytics or Vercel Analytics
5. **Backup Strategy**: Set up automated database backups via manus.im
6. **Monitoring**: Set up uptime monitoring (UptimeRobot, Pingdom)
7. **Legal Pages**: Ensure Terms of Service, Privacy Policy are accessible
8. **Support System**: Test AI support chat, set up support email

---

## 📞 Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Manus.im Support**: Check manus.im documentation
- **SendGrid Support**: https://sendgrid.com/docs
- **Authorize.Net**: https://developer.authorize.net

---

## Quick Reference Commands

```powershell
# Build for production
npm run build

# Test production build locally
npm run start

# Deploy to Vercel
vercel --prod

# View logs
vercel logs

# Add environment variable
vercel env add VARIABLE_NAME

# Pull environment variables
vercel env pull
```

---

**Ready to deploy? Start with Step 1 and work through each step carefully. Good luck! 🚀**
