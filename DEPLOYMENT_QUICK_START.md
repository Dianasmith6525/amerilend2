# AmeriLend Deployment Quick Start

Fast reference for deploying with Vercel + Railway.

---

## ⚡ 5-Minute Overview

1. **Sign up** Vercel and Railway (free tier)
2. **Import** GitHub repo to both platforms
3. **Configure** environment variables
4. **Deploy** (automatic)
5. **Point** domain DNS to both services

---

## 🎯 Credentials You'll Need

Gather these BEFORE starting deployment:

```
SENDGRID_API_KEY = (from SendGrid)
JWT_SECRET = (generate: openssl rand -base64 32)
OAUTH_SERVER_URL = (from your OAuth provider)
VITE_APP_ID = (from OAuth provider)
STRIPE_SECRET_KEY = (if using Stripe)
AUTHORIZE_NET_API_KEY = (if using Authorize.Net)
AUTHORIZE_NET_TRANSACTION_KEY = (if using Authorize.Net)
```

---

## 🚀 Vercel (Frontend) - 10 minutes

**1. Create Account:**
- Visit https://vercel.com
- Sign up with GitHub
- Authorize access

**2. Import Repository:**
- Click "Add New" → "Project"
- Select: `Dianasmith6525/amerilend2`
- Click "Import"

**3. Configure Build:**
- Leave root directory blank
- Build command: `pnpm build` (auto-detected)
- Output: `dist`

**4. Environment Variables:**
```
VITE_API_URL = https://api.amerilendloan.com
VITE_APP_ID = your_app_id
```

**5. Deploy:**
- Click "Deploy"
- Wait 3-5 minutes
- Get preview URL

**6. Add Domain:**
- Settings → Domains
- Add: `amerilendloan.com`
- Add: `www.amerilendloan.com`
- **SAVE DNS records** (needed for Wix)

---

## 🚀 Railway (Backend + Database) - 15 minutes

**1. Create Account:**
- Visit https://railway.app
- Sign up with GitHub
- Authorize access

**2. Create Project:**
- Click "New Project"
- "Deploy from GitHub"
- Select: `Dianasmith6525/amerilend2`

**3. Add PostgreSQL:**
- "Add Service"
- Select "Database" → "PostgreSQL"
- Railway creates database automatically

**4. Configure Backend:**
- Add backend service from GitHub
- Root: leave blank
- Build: `pnpm install && pnpm build`
- Start: `node dist/index.js`

**5. Environment Variables:**
```
NODE_ENV = production
VITE_CLIENT_URL = https://amerilendloan.com
VITE_API_URL = https://api.amerilendloan.com
SENDGRID_FROM_EMAIL = noreply@amerilendloan.com
```

**6. Add Secrets:**
```
JWT_SECRET = (your random string)
DATABASE_URL = (auto-set by PostgreSQL)
SENDGRID_API_KEY = (your SendGrid key)
OAUTH_SERVER_URL = (your OAuth URL)
VITE_APP_ID = (your app ID)
STRIPE_SECRET_KEY = (if using Stripe)
AUTHORIZE_NET_API_KEY = (if using Authorize.Net)
AUTHORIZE_NET_TRANSACTION_KEY = (if using Authorize.Net)
```

**7. Link Database:**
- Railway auto-links PostgreSQL to backend
- Verify in backend service settings

**8. Run Migrations:**
- In backend service → Shell
- Run: `pnpm run db:push`
- Wait for migrations to complete

**9. Deploy:**
- Click "Deploy"
- Wait 5-10 minutes
- Check logs for "Server running"

**10. Add API Domain:**
- Services → Backend → Domains
- Add: `api.amerilendloan.com`
- **SAVE CNAME record** (needed for Wix)

---

## 🌐 Wix DNS Setup - 10 minutes

**1. Access Wix Domain:**
- Login to Wix.com
- Settings → Domains
- Click `amerilendloan.com`
- Click "Manage DNS" or "Advanced"

**2. Add Vercel Records:**

From Vercel (Step 6):
```
Type: A
Name: @
Value: 76.76.19.165
TTL: 3600

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**3. Add Railway Record:**

From Railway (Step 10):
```
Type: CNAME
Name: api
Value: xxx.railway.app
TTL: 3600
```

**4. Wait for Propagation:**
- DNS takes 5 minutes to 48 hours
- Use https://dnschecker.org to check

---

## ✅ Verify Deployment

**Test Frontend:**
```
Visit: https://amerilendloan.com
Should see homepage (no 404)
Check console (F12) - no errors
```

**Test API:**
```
In console:
fetch('https://api.amerilendloan.com/api/trpc/health.query')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Test Email:**
- Sign up on site
- Check inbox for verification email
- Should be from: noreply@amerilendloan.com

**Test Login:**
- Try logging in
- Try OAuth if available

**Check SSL:**
- Look for green padlock 🔒
- Click it - should say "Certificate Valid"

---

## 🔧 If Something's Wrong

| Problem | Solution |
|---------|----------|
| 404 on amerilendloan.com | Wait 24h for DNS, check Vercel domain status |
| API not connecting | Check `api.amerilendloan.com` resolves, check Railway logs |
| Emails not sending | Check SENDGRID_API_KEY in Railway, verify email in SendGrid |
| Database won't connect | Check DatabaseURL in Railway, run `psql $DATABASE_URL -c "SELECT 1"` |
| OAuth fails | Check redirect URI in OAuth provider, verify VITE_APP_ID |

---

## 📊 URLs After Deployment

| Component | URL |
|-----------|-----|
| **Frontend** | https://amerilendloan.com |
| **Frontend (www)** | https://www.amerilendloan.com |
| **API** | https://api.amerilendloan.com |
| **Admin Dashboard** | https://amerilendloan.com/admin |
| **User Dashboard** | https://amerilendloan.com/dashboard |

---

## 📚 Full Guides

For detailed instructions, see:
- `VERCEL_RAILWAY_DEPLOYMENT_GUIDE.md` - Complete step-by-step
- `DEPLOYMENT_ENV_GUIDE.md` - Environment variables explained
- `DEPLOYMENT_CHECKLIST.md` - Full verification checklist

---

## 🆘 Need Help?

**Vercel Support:** https://vercel.com/support
**Railway Support:** https://railway.app/help
**SendGrid Support:** https://support.sendgrid.com
**GitHub Issues:** Check your repository issues

---

## ✨ You're Live!

Once all tests pass, your AmeriLend application is live and ready for users! 🎉

**Total time:** ~45 minutes
**Cost:** $0 (free tier for both services)
**Scalability:** Easy to upgrade when needed

