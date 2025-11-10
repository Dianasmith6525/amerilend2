# Production Environment Setup

## Your Generated JWT Secret:
```
K50eRmIUVgauLDiy94f3ACHhZqp7Sx1r
```

## Next Steps:

### 1. Get Your Manus.im Database Connection String

You need to get your MySQL connection string from manus.im. It should look like:
```
mysql://username:password@host.manus.im:4000/database_name
```

**How to get it:**
1. Log into your manus.im dashboard
2. Go to your database/project
3. Look for "Connection String" or "MySQL Connection"
4. Copy the full connection string

### 2. Setup SendGrid (FREE - Required for OTP Login)

**Steps:**
1. Go to https://sendgrid.com
2. Sign up for free account (100 emails/day free)
3. Verify your account email
4. Go to Settings → API Keys
5. Create new API key (Full Access)
6. Copy the key (starts with `SG.`)

**Sender Email Setup:**
1. In SendGrid → Settings → Sender Authentication
2. Click "Verify Single Sender"
3. Add: noreply@amerilendloan.com (or use your email for testing)
4. Verify the email

### 3. Setup Authorize.Net (For Payments)

**For Testing:**
1. Sign up at https://sandbox.authorize.net
2. Get sandbox credentials
3. Use environment: `sandbox`

**For Production:**
1. Sign up at https://www.authorize.net
2. Get production credentials  
3. Use environment: `production`

### 4. Deploy to Vercel

Once you have the above, run:
```powershell
npx vercel
```

Follow the prompts:
- Project name: amerilend
- Directory: ./ (press Enter)
- Build Command: npm run build (press Enter)
- Output Directory: dist (press Enter)
- Development Command: npm run dev (press Enter)

Then add environment variables in Vercel Dashboard:
https://vercel.com/dashboard → Your Project → Settings → Environment Variables

### 5. Add Environment Variables in Vercel

Go to your project settings and add these:

| Variable | Value | Notes |
|----------|-------|-------|
| DATABASE_URL | `mysql://user:pass@host.manus.im:4000/db` | From manus.im |
| JWT_SECRET | `K50eRmIUVgauLDiy94f3ACHhZqp7Sx1r` | Generated above |
| NODE_ENV | `production` | Fixed value |
| SENDGRID_API_KEY | `SG.xxxxxx` | From SendGrid |
| SENDGRID_FROM_EMAIL | `noreply@amerilendloan.com` | Verified in SendGrid |
| AUTHORIZENET_API_LOGIN_ID | From Authorize.Net | |
| AUTHORIZENET_TRANSACTION_KEY | From Authorize.Net | |
| AUTHORIZENET_CLIENT_KEY | From Authorize.Net | |
| AUTHORIZENET_ENVIRONMENT | `sandbox` or `production` | Start with sandbox |
| OAUTH_SERVER_URL | Your OAuth server | From manus.im if using OAuth |
| VITE_APP_ID | Your app ID | From manus.im |

### 6. Deploy to Production
```powershell
npx vercel --prod
```

### 7. Configure Domain in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add: www.amerilendloan.com
3. Vercel will show DNS records

### 8. Configure DNS in Squarespace

1. Log into Squarespace
2. Go to Settings → Domains → www.amerilendloan.com → DNS Settings
3. Add CNAME record:
   - Type: CNAME
   - Host: www
   - Value: (from Vercel)
4. For root domain:
   - Type: A
   - Host: @
   - Value: 76.76.21.21

---

## Ready to Deploy?

**Do you have:**
- [ ] Manus.im database connection string?
- [ ] SendGrid API key?
- [ ] Authorize.Net credentials (at least sandbox)?

**If yes, run:**
```powershell
npx vercel
```

**If no, work through steps 1-3 above first!**
