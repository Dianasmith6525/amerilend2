# 🔑 API Key Troubleshooting Checklist

## ✅ Quick Checklist

Use this if you're having issues getting the API key.

### Step 1: Prepare
- [ ] Open Google Chrome (or Firefox/Safari)
- [ ] Make sure you're logged into Google (Gmail)
- [ ] Have a credit/debit card ready (for billing setup, won't be charged)
- [ ] Have 10 minutes free

### Step 2: Create Project
- [ ] Go to: https://console.cloud.google.com/
- [ ] Click "Select a Project" at top left
- [ ] Click "New Project"
- [ ] Enter name: `amerilend` (or any name)
- [ ] Click "Create"
- [ ] ⏳ Wait 1-2 minutes for project to be created

### Step 3: Enable API
- [ ] Make sure your new project is selected (top left)
- [ ] Go to: APIs & Services → Library
- [ ] Search: "Places API"
- [ ] Click on the Places API result
- [ ] Click "Enable" button
- [ ] Wait for it to enable

### Step 4: Get API Key
- [ ] Go to: APIs & Services → Credentials
- [ ] Click "Create Credentials" (top)
- [ ] Choose "API Key"
- [ ] Copy the API key (looks like: `AIzaSy...`)
- [ ] Save it somewhere (notepad, password manager, etc.)

### Step 5: Add to Project
- [ ] Open your `.env` file (in project root)
- [ ] Find or create this line:
  ```
  VITE_GOOGLE_PLACES_API_KEY=
  ```
- [ ] Paste your API key after the `=`
- [ ] Should look like:
  ```
  VITE_GOOGLE_PLACES_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXX
  ```
- [ ] Save the file

### Step 6: Restart & Test
- [ ] Stop your dev server (Ctrl+C in terminal)
- [ ] Run: `npm run dev`
- [ ] Go to: http://localhost:3000/apply
- [ ] Go to Step 2 (Address Information)
- [ ] Type an address: "1600 Amphitheatre"
- [ ] ✨ You should see Google suggestions!

---

## ❌ Not Working? Troubleshoot Here

### Problem: "Can't find Places API"

**Try:**
1. Make sure you're searching in the Library section
2. Search for exact name: "Places API"
3. Or use direct link: https://console.cloud.google.com/marketplace/product/google/maps-places-backend

### Problem: "Enable button is greyed out"

**Try:**
1. Refresh the page (F5)
2. It might already be enabled
3. Go to Credentials instead

### Problem: "Need to set up billing"

**Do:**
1. Click the billing notification
2. Create a billing account
3. Add a credit/debit card
4. ✅ You won't be charged (free tier is $200/month)

### Problem: "API Key doesn't work"

**Check:**
1. API key is copied exactly (no extra spaces)
2. API key is in `.env` file
3. Dev server was restarted after adding key
4. Places API is enabled in Google Cloud

### Problem: "Still no autocomplete"

**Try:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Try in a different browser
3. Try an incognito/private window
4. Check browser console for errors

---

## 🎯 If You're Really Stuck

### Option 1: Ask for Help
- Post on GitHub issues
- Ask your team members
- Ask on Stack Overflow

### Option 2: Use Without Autocomplete
- Leave API key empty in `.env`
- Address field works as regular text input
- Customers can manually type addresses
- Add autocomplete later when ready

### Option 3: Try Alternative
- Use MapBox instead of Google Places
- Use HERE Maps
- Use OpenStreetMap (free!)

---

## 📞 Support Links

- **Google Cloud Help**: https://cloud.google.com/docs/support
- **Places API Docs**: https://developers.google.com/maps/documentation/places
- **Stack Overflow**: Search "google places api" + your error
- **GitHub Issues**: https://github.com/Dianasmith6525/amerilend2/issues

---

## ✅ Success Indicator

When it's working, you'll see:

1. ✅ Google suggestions appear when typing
2. ✅ Clicking a suggestion fills all fields
3. ✅ Street, city, state, ZIP all populate
4. ✅ No error messages in browser console

---

## 🚀 All Set!

Once you see the autocomplete working:
- ✅ Address entry is faster
- ✅ Fewer errors for users
- ✅ Better experience overall

**Congratulations!** 🎉

---

**Status**: Ready to troubleshoot  
**Time needed**: 10-15 minutes  
**Difficulty**: Easy (mostly clicking)
