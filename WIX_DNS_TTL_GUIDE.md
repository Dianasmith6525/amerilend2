# Wix DNS: TTL and Common Questions

Guide for adding DNS records in Wix when TTL is not shown.

---

## 🎯 TTL Explanation

**TTL = Time To Live**
- How long DNS servers cache the record
- Measured in seconds
- Example: 3600 = 1 hour

**Default TTL:**
- Wix usually sets it automatically
- You don't need to manually set it
- Default is typically 3600 (1 hour)

---

## ✅ If Wix Doesn't Ask for TTL

**Good news:** This is normal! ✅

Wix automatically sets TTL for you. You don't need to do anything.

### Why?

- Wix manages TTL behind the scenes
- Default TTL (3600 seconds) is perfect for this use case
- You can't customize it in Wix interface (by design)

---

## 🎯 What You Should See in Wix

When adding DNS records in Wix, you typically see:

```
Add DNS Record
┌─────────────────────────────┐
│ Type:      [CNAME ▼]        │
│ Name:      [www       ]     │
│ Value:     [cname.vercel-dns.com] │
│ [Add Record]                │
└─────────────────────────────┘
```

**Note:** No TTL field = Wix handles it automatically ✅

---

## ✅ What to Do

**Just ignore the TTL!**

Follow these steps:

### For Root Domain (A Record)

```
Type: A
Name: @ (or leave blank)
Value: 76.76.19.165
Click: Add Record
```

**That's it!** Wix sets TTL automatically.

### For WWW Subdomain (CNAME Record)

```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
Click: Add Record
```

**That's it!** Wix sets TTL automatically.

---

## ✅ Verification Checklist

After adding records in Wix:

- [ ] See 2 records in Wix DNS:
  ```
  A record: @ → 76.76.19.165
  CNAME record: www → cname.vercel-dns.com
  ```

- [ ] Both records show as "Active" or similar status

- [ ] Records are in Wix DNS settings (not deleted)

- [ ] No error messages

---

## 🔍 How to Check If Records Are Added

### In Wix:

1. Go to Settings → Domains
2. Click `amerilendloan.com`
3. Click "Advanced" or "Manage DNS"
4. You should see your records listed:

```
DNS Records:

Record 1:
Type: A
Name: @ (or blank)
Value: 76.76.19.165
Status: Active ✓

Record 2:
Type: CNAME
Name: www
Value: cname.vercel-dns.com
Status: Active ✓
```

### Online Verification:

Use https://dnschecker.org

1. Enter: `amerilendloan.com`
2. Check "A Record" - should show `76.76.19.165`
3. Enter: `www.amerilendloan.com`
4. Check "CNAME Record" - should show `cname.vercel-dns.com`

---

## ⏱️ Timeline After Adding Records

```
Immediately after adding:
└─ Records visible in Wix ✓

5-15 minutes:
└─ DNS servers start seeing records

1-2 hours:
└─ Most DNS servers updated
└─ Your domain should work ✓

24-48 hours:
└─ Fully propagated worldwide
```

---

## 🚀 Next Steps

### Step 1: Wait for DNS Propagation
- ⏳ Wait 1-2 hours

### Step 2: Verify Records Propagated
- 🔍 Check https://dnschecker.org
- Enter: `amerilendloan.com`
- Should show your A record

### Step 3: Test Your Domain
- 🌐 Open browser
- Visit: https://amerilendloan.com
- Should load your Vercel app ✅

### Step 4: Test WWW Version
- 🌐 Visit: https://www.amerilendloan.com
- Should also load your app ✅

---

## ✅ Success Indicators

You're done when you see:

```
✅ DNS records visible in Wix
✅ Records show as "Active"
✅ dnschecker.org shows correct records
✅ https://amerilendloan.com loads ✓
✅ https://www.amerilendloan.com loads ✓
✅ Green padlock 🔒 shows SSL is valid
✅ No errors in browser console (F12)
```

---

## ❌ Common Issues & Fixes

### Issue: DNS checker shows old records

**Cause:** DNS propagation still happening

**Fix:**
- Wait 24-48 hours
- Try different DNS checker
- Check from different device/location

### Issue: Domain still shows Wix landing page

**Cause:** DNS cache in browser

**Fix:**
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito/private window
- Try different browser
- Wait 24 hours

### Issue: Only www works, root doesn't

**Cause:** A record not set for root domain

**Fix:**
1. In Wix, verify A record exists
2. Name field should be: `@` or blank
3. Value should be: `76.76.19.165`
4. Wait for propagation

### Issue: Root works, www doesn't

**Cause:** CNAME record not set for www

**Fix:**
1. In Wix, verify CNAME record exists
2. Name field should be: `www`
3. Value should be: `cname.vercel-dns.com`
4. Wait for propagation

---

## 🔧 How to Edit Records in Wix

If you need to change a record:

1. Go to Settings → Domains
2. Click `amerilendloan.com`
3. Click "Advanced" or "Manage DNS"
4. Find the record you want to edit
5. Click **Edit** or **Delete**
6. Delete old record and add new one
7. Save changes

---

## 💡 About Wix DNS Interface

**Why no TTL field?**

- Wix simplifies DNS for users
- TTL is handled automatically
- Default TTL (3600) is perfect for most cases
- You don't need to change it

**Is automatic TTL OK?**

- ✅ Yes, perfectly fine
- ✅ Standard practice
- ✅ Works great for this setup
- ✅ No issues expected

---

## 📚 TTL Reference (For Your Knowledge)

| TTL Value | What It Means |
|-----------|--------------|
| 300 | 5 minutes - Quick updates |
| 3600 | 1 hour - Standard (Wix default) |
| 86400 | 24 hours - Long cache |

**For your setup:** 3600 (default) is perfect ✅

---

## ✨ You're Good!

Just to confirm:

✅ You added DNS records in Wix
✅ Wix doesn't show TTL (normal)
✅ Wix automatically sets TTL (3600)
✅ Your records are active

**Next:** Wait 1-2 hours for propagation, then test!

---

## 🎯 Quick Checklist Before Moving Forward

- [ ] A record added: `@ → 76.76.19.165`
- [ ] CNAME record added: `www → cname.vercel-dns.com`
- [ ] Both records show in Wix as "Active"
- [ ] No error messages in Wix
- [ ] Ready to wait for propagation

Once all checked, your domain will work! ✅

---

## 📞 Need More Help?

**Common Questions:**

Q: Do I need to add TTL manually?
A: No, Wix handles it automatically.

Q: Is 3600 TTL OK?
A: Yes, perfect for this setup.

Q: How long until it works?
A: Usually 1-2 hours, max 48 hours.

Q: Can I check if records are working?
A: Yes, use https://dnschecker.org

Q: What if it doesn't work after 24 hours?
A: Double-check records are correct in Wix, try different browser.

---

## ✅ Next Steps

1. ✅ DNS records added (no TTL needed)
2. ⏳ Wait 1-2 hours for propagation
3. 🔍 Check https://dnschecker.org
4. 🌐 Test: https://amerilendloan.com
5. ✅ Done!

