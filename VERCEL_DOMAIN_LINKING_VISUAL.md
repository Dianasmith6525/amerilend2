# Vercel Domain Linking - Quick Visual Guide

Super simple step-by-step with screenshots descriptions.

---

## 🎯 The Process (4 Steps)

```
Step 1: Vercel (Add Domain)
        ↓
        Get Vercel Nameservers
        ↓
Step 2: Wix (Update Nameservers)
        ↓
        Replace with Vercel's
        ↓
Step 3: Wait (DNS Propagation)
        ↓
        1-2 hours usually
        ↓
Step 4: Verify
        ↓
        Domain works! ✅
```

---

## 📍 STEP 1: Add Domain in Vercel

### Location in Vercel:
```
Vercel Dashboard
    ↓
Select Your Project (amerilend2)
    ↓
Settings (gear icon, top right)
    ↓
Domains (left sidebar)
```

### What You'll See:

```
Domains
────────────────────────
🔍 Search domains...        [ADD]
────────────────────────
No domains added yet
```

### Action:
1. Click **[ADD]** button
2. Enter: `amerilendloan.com`
3. Click **[Add Domain]**

### Vercel Shows:

```
What's the best way to add amerilendloan.com?

☑ Vercel Nameservers (Recommended)
  Use nameservers provided by Vercel
  
☐ A Record
  Point A record to 76.76.19.165
  
☐ CNAME Record
  Use CNAME for www only
```

### Select:
- **✓ Vercel Nameservers** (default, recommended)
- Click **[Continue]**

### Vercel Shows Nameservers:

```
╔══════════════════════════════════════════╗
║ Use these nameservers at your registrar: ║
║                                          ║
║ ns1.vercel-dns.com                       ║
║ ns2.vercel-dns.com                       ║
║ ns3.vercel-dns.com                       ║
║ ns4.vercel-dns.com                       ║
║                                          ║
║ [COPY]                                   ║
╚══════════════════════════════════════════╝
```

### Copy & Save These! 📋

---

## 📍 STEP 2: Update Wix Domain Settings

### Location in Wix:
```
Wix.com
    ↓
Your Site → Settings (gear icon)
    ↓
Domains
    ↓
Click: amerilendloan.com
    ↓
Look for: "Nameservers" or "Manage DNS"
```

### What You'll See in Wix:

```
Domain Settings
────────────────────────────
amerilendloan.com
    ├─ DNS Settings
    ├─ Nameservers
    └─ Advanced
```

### Option A: Simple (Recommended)
If you see "Nameservers" tab:
1. Click **Nameservers** tab
2. Select **External** or **Use external nameservers**
3. Replace Wix's nameservers with Vercel's:

```
Current (Wix):
ns1.wix.com
ns2.wix.com
ns3.wix.com
ns4.wix.com

    ↓ REPLACE WITH ↓

New (Vercel):
ns1.vercel-dns.com
ns2.vercel-dns.com
ns3.vercel-dns.com
ns4.vercel-dns.com
```

4. Click **Save** ✅

### Option B: If You See Advanced/DNS
1. Click **Advanced** or **DNS**
2. Look for "Nameserver" section
3. Update same as above
4. Click **Save** ✅

### What Wix Might Show:

```
Current Nameservers:
ns1.wix.com ❌
ns2.wix.com ❌
ns3.wix.com ❌
ns4.wix.com ❌

Replace with:
ns1.vercel-dns.com ✅
ns2.vercel-dns.com ✅
ns3.vercel-dns.com ✅
ns4.vercel-dns.com ✅
```

---

## ⏳ STEP 3: Wait for Propagation

**How long?**
- ⚡ Best case: 5-15 minutes
- ⏱️ Typical: 1-2 hours  
- 🐢 Worst case: 24-48 hours

**While waiting:**
- Don't refresh endlessly
- Check with online tool (see Step 4)
- Check back in 15 minutes

---

## ✅ STEP 4: Verify Domain Works

### Check #1: Vercel Dashboard

**In Vercel:**
```
Vercel Dashboard
    ↓
Settings → Domains
    ↓
Look for: amerilendloan.com
    ↓
Status should show:
    ✅ Valid Configuration  OR
    🟡 Pending Verification
```

If 🟡 Pending → Wait 15 minutes → Refresh → Check again

### Check #2: Online DNS Tool

Visit: **https://dnschecker.org**

```
Enter: amerilendloan.com
Click: Check
```

**You should see:**
```
Nameservers:
✅ ns1.vercel-dns.com
✅ ns2.vercel-dns.com  
✅ ns3.vercel-dns.com
✅ ns4.vercel-dns.com
```

### Check #3: Visit Your Domain

Open browser and go to:
```
https://amerilendloan.com
```

**You should see:**
- Your React app loads ✅
- Green padlock 🔒 (SSL active)
- No errors in console (F12)

### Check #4: Test www Subdomain

```
https://www.amerilendloan.com
```

Should also work ✅

---

## 🎉 Success Indicators

You're done when you see ALL of these:

```
✅ Vercel Dashboard shows: "Valid Configuration"
✅ DNS checker shows: Vercel nameservers
✅ https://amerilendloan.com loads your app
✅ https://www.amerilendloan.com loads your app
✅ Green padlock 🔒 shows in browser
✅ Console (F12) has no errors
```

---

## ❌ Troubleshooting Quick Fixes

| Problem | Quick Fix |
|---------|-----------|
| Still shows Wix site | Clear browser cache (Ctrl+Shift+Delete) |
| Shows 404 | Wait 24 hours, then refresh Vercel |
| Nameservers wrong | Check Wix DNS again, wait 24h |
| SSL error | Wait 24 hours for certificate |
| "Invalid Configuration" | Verify nameservers in Wix are exact |

---

## 📊 Visual Timeline

```
TIME PROGRESS
│
├─ 0 min: Add domain to Vercel
├─ 5 min: Update nameservers in Wix
├─ 5 min: Wait...
├─ 15 min: Check with dnschecker.org
├─ 30 min: Try visiting domain
├─ 1 hour: Should be working ✅
├─ 2 hours: Definitely working ✅
│
└─ 24-48 hours: Fully propagated everywhere
```

---

## 🔗 Useful Links

| Tool | URL |
|------|-----|
| DNS Checker | https://dnschecker.org |
| What's My DNS | https://www.whatsmydns.net/ |
| MX Toolbox | https://mxtoolbox.com |
| SSL Checker | https://www.sslshopper.com/ssl-checker.html |

---

## 🎯 Next Steps

**After domain is linked:**

1. ✅ Frontend domain working
2. ➡️ Deploy backend to Railway
3. ➡️ Add API subdomain: `api.amerilendloan.com`
4. ➡️ Update frontend API URL
5. ✅ System ready!

See: `VERCEL_RAILWAY_DEPLOYMENT_GUIDE.md`

---

## 💬 Common Questions

**Q: How long until it works?**
A: Usually 1-2 hours. Worst case 24-48 hours.

**Q: Can I use my Wix domain for other things?**
A: Yes! You can keep using Wix for email, etc. Nameservers route to your provider.

**Q: What if I need to undo this?**
A: Change nameservers back to Wix's in Wix domain settings.

**Q: Do I need both amerilendloan.com AND www?**
A: Yes! Add both in Vercel for best results.

**Q: Why does browser still show Wix?**
A: Cached DNS. Clear cache: Ctrl+Shift+Delete

---

## ✨ You're All Set!

Your domain is now linked to Vercel! 🎉

**Next: Set up backend on Railway**

