# How to Link Your Domain (amerilendloan.com) in Vercel

Complete step-by-step guide to connect your Wix domain to Vercel.

---

## 📋 Prerequisites

Before starting, you need:

- ✅ Vercel account created
- ✅ GitHub repo imported to Vercel
- ✅ Application deployed to Vercel
- ✅ Domain purchased from Wix: `amerilendloan.com`
- ✅ Access to Wix domain settings

---

## 🎯 Overview: 3 Ways to Connect Domain

| Method | Difficulty | Time | Best For |
|--------|-----------|------|----------|
| **Vercel Nameservers** | Easy | 5 min | Complete control, recommended |
| **CNAME Record** | Medium | 10 min | If you want other DNS elsewhere |
| **A Record** | Medium | 10 min | Manual setup |

**Recommendation: Use Vercel Nameservers** (simplest)

---

## ✅ METHOD 1: Use Vercel Nameservers (Recommended)

### Step 1: Add Domain to Vercel

1. **Log into Vercel**: https://vercel.com/dashboard

2. **Go to your project**:
   - Click on your `amerilend2` project
   - Click **Settings** (gear icon, top right)
   - Select **Domains** from left sidebar

3. **Add Domain**:
   - Click **"Add"** button
   - Enter: `amerilendloan.com`
   - Click **"Add Domain"**

4. **Vercel Displays Options**:
   ```
   What's the best way to add amerilendloan.com?
   ○ Vercel Nameservers (Recommended)
   ○ A Record
   ○ CNAME Record
   ```
   - Select: **Vercel Nameservers** (default option)
   - Click **"Continue"**

5. **Vercel Shows Nameservers**:
   ```
   Use these nameservers at your domain registrar:
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ns3.vercel-dns.com
   ns4.vercel-dns.com
   ```
   - **COPY these nameservers** and save them

### Step 2: Update Wix Domain Settings

1. **Log into Wix**: https://www.wix.com

2. **Access Domain Settings**:
   - Click on your site
   - Click **Settings** (gear icon, top right)
   - Select **Domains**
   - Click on `amerilendloan.com`

3. **Find Nameserver Settings**:
   - Look for "Nameservers" or "Manage DNS"
   - Or click "I'm using external host" / "Point to external registrar"

4. **Replace Wix Nameservers with Vercel's**:

   **OLD (Wix Nameservers):**
   ```
   ns1.wix.com
   ns2.wix.com
   ns3.wix.com
   ns4.wix.com
   ```

   **NEW (Vercel Nameservers):**
   ```
   ns1.vercel-dns.com
   ns2.vercel-dns.com
   ns3.vercel-dns.com
   ns4.vercel-dns.com
   ```

5. **Save Changes**:
   - Click "Save" in Wix
   - You should see confirmation message

### Step 3: Wait for DNS Propagation

- ⏳ Takes 5 minutes to 48 hours (usually 1-2 hours)
- Check status: https://dnschecker.org
- Enter: `amerilendloan.com`

### Step 4: Verify in Vercel

1. Back in Vercel → Settings → Domains
2. You should see: `amerilendloan.com` with status:
   - 🟢 **Valid Configuration** (green checkmark)
   - OR 🟡 **Pending Verification** (wait a bit longer)

3. Once green ✅, your domain is connected!

---

## ✅ METHOD 2: Add www Subdomain

You probably want BOTH:
- `amerilendloan.com` (root domain)
- `www.amerilendloan.com` (with www)

### Step 1: Add www Domain to Vercel

1. In Vercel → Settings → Domains
2. Click **"Add"** again
3. Enter: `www.amerilendloan.com`
4. Vercel will show options:
   ```
   This subdomain will automatically point to your root domain
   via CNAME record
   ```
5. Click **"Add"**

### Step 2: Check DNS Records

If using Vercel Nameservers (Method 1), Vercel handles everything automatically. ✅

If using CNAME Records (Method 3), add:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 3: Verify Both Work

- ✅ Visit: https://amerilendloan.com
- ✅ Visit: https://www.amerilendloan.com
- Both should load your app

---

## ✅ METHOD 3: Manual DNS Records (Alternative)

Use this if you need more control or are using another registrar.

### Step 1: Get DNS Records from Vercel

1. In Vercel → Settings → Domains
2. Add your domain
3. Choose **"A Record"** or **"CNAME Record"**
4. Vercel shows you what to add

### Step 2: Add A Record for Root Domain

**In Wix DNS Settings**, add:

```
Type: A
Name: @ (or blank/root)
Value: 76.76.19.165
TTL: 3600
```

### Step 3: Add CNAME Record for www

**In Wix DNS Settings**, add:

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

### Step 4: Save and Wait

- Save in Wix
- Wait for DNS propagation
- Verify with: https://dnschecker.org

---

## 🆘 Troubleshooting

### Problem: "Invalid Configuration" in Vercel

**Cause:** DNS records not correct or not propagated

**Solution:**
1. Check DNS records in Wix are correct
2. Wait 24 hours
3. In Vercel, click **"Refresh"** button
4. Try again

### Problem: Domain Shows Wix Landing Page

**Cause:** Nameservers not updated in Wix yet

**Solution:**
1. In Wix → Domain Settings, verify you updated nameservers
2. Wait 24-48 hours for propagation
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try https://dnschecker.org to verify

### Problem: "Pointing to External Host" Still Shows Wix

**Cause:** DNS hasn't propagated

**Solution:**
1. Wait 24-48 hours
2. Try incognito/private browser window
3. Try from different device or mobile
4. Check with: https://www.whatsmydns.net/

### Problem: SSL Certificate Error

**Cause:** Certificate not yet issued

**Solution:**
1. Wait 24 hours
2. In Vercel, certificate should auto-generate
3. Verify HTTPS loads correctly
4. Check: https://www.sslshopper.com/ssl-checker.html

### Problem: "Too Many Redirects"

**Cause:** Conflicting redirect rules

**Solution:**
1. In Vercel → Settings → Redirects, remove custom redirects
2. Or ensure redirect goes to HTTPS not HTTP
3. Redeploy application

---

## ✅ Verification Checklist

After linking your domain:

- [ ] `https://amerilendloan.com` loads your app
- [ ] `https://www.amerilendloan.com` loads your app
- [ ] Green padlock 🔒 shows (SSL valid)
- [ ] No "Cannot reach API" errors (check after API deployment)
- [ ] DNS status: `Valid Configuration` ✅ in Vercel
- [ ] DNS checker shows correct records: https://dnschecker.org

---

## 📊 DNS Record Status Check

Use these tools to verify:

1. **DNS Propagation**: https://dnschecker.org
2. **What's My DNS**: https://www.whatsmydns.net/
3. **MX Toolbox**: https://mxtoolbox.com
4. **SSL Check**: https://www.sslshopper.com/ssl-checker.html

Enter `amerilendloan.com` and check records are correct.

---

## ⏱️ Timeline

| Step | Time |
|------|------|
| Add domain to Vercel | 2 minutes |
| Update Wix nameservers | 3 minutes |
| DNS propagation | 5 min - 48 hours |
| SSL certificate issued | 5 min - 24 hours |
| **Total** | **~2 hours** |

---

## 🎯 What Happens Next

Once your domain is linked to Vercel:

1. **Frontend is live**: https://amerilendloan.com loads your React app ✅
2. **SSL automatic**: HTTPS enabled automatically ✅
3. **www works**: Both root and www versions work ✅
4. **Next: Link API** (when Railway is deployed)
   - Add `api.amerilendloan.com` CNAME to Railway
   - Update Wix DNS with Railway CNAME record

---

## 🚀 Next: Link API Domain (Railway)

After frontend is live, you'll add:
```
Type: CNAME
Name: api
Value: (from Railway)
```

See `VERCEL_RAILWAY_DEPLOYMENT_GUIDE.md` for Railway setup.

---

## 💡 Pro Tips

1. **Use Vercel Nameservers**: Simplest and most reliable
2. **Add www**: Always add both `amerilendloan.com` and `www.amerilendloan.com`
3. **Check propagation**: Use online tools, don't just refresh browser
4. **Clear cache**: Old DNS cached in browser (Ctrl+Shift+Del)
5. **Wait patiently**: DNS can take 24-48 hours to fully propagate
6. **Monitor logs**: Check Vercel logs for any deployment errors

---

## ✨ You're Done!

Once domain is linked and verified:
- ✅ Frontend deployed to Vercel
- ✅ Domain linked to Vercel
- ✅ SSL certificate active
- ✅ Ready for users!

Next: Link your backend API domain (when Railway deployed)

