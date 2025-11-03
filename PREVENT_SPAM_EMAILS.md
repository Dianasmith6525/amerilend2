# Fix SendGrid Emails Going to Spam

## Why Emails Go to Spam

When sending from Gmail addresses (like `dianasmith6525@gmail.com`) through SendGrid, email providers flag them as suspicious because:
- The email claims to be from Gmail but comes from SendGrid's servers
- No proper email authentication (SPF, DKIM, DMARC)

## Solution: Set Up Domain Authentication

### Option 1: Use Your Own Domain (RECOMMENDED)

Instead of sending from `@gmail.com`, use your own domain (e.g., `noreply@amerilend.com`).

#### Step 1: Set Up Domain Authentication in SendGrid

1. Go to https://app.sendgrid.com/settings/sender_auth
2. Click **"Authenticate Your Domain"**
3. Choose your DNS host (e.g., GoDaddy, Namecheap, Cloudflare)
4. Enter your domain: `amerilend.com`
5. Click **"Next"**

#### Step 2: Add DNS Records

SendGrid will provide DNS records to add:

```
CNAME: em1234.amerilend.com → u12345.wl123.sendgrid.net
CNAME: s1._domainkey.amerilend.com → s1.domainkey.u12345.wl123.sendgrid.net
CNAME: s2._domainkey.amerilend.com → s2.domainkey.u12345.wl123.sendgrid.net
```

1. Log in to your domain registrar (GoDaddy, Namecheap, etc.)
2. Go to DNS settings
3. Add all the CNAME records provided by SendGrid
4. Wait 24-48 hours for DNS propagation
5. Return to SendGrid and click **"Verify"**

#### Step 3: Update Your .env File

```bash
SENDGRID_FROM_EMAIL=noreply@amerilend.com
```

### Option 2: Keep Using Gmail (Quick Fix)

If you don't have a domain yet, improve deliverability with these steps:

#### 1. Warm Up Your Sender Reputation

SendGrid accounts start with low reputation. Build it up:
- Send emails gradually (don't send hundreds immediately)
- Start with 10-20 emails per day
- Increase slowly over 2-3 weeks

#### 2. Improve Email Content

Update the email template to avoid spam triggers:

