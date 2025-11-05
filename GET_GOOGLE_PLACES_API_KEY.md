# 🔑 Google Places API Key - Complete Getting Started Guide

## ❌ Having Trouble Getting the API Key?

Don't worry! This guide will help you through every step. Follow the option that works best for you.

---

## 📋 Prerequisites

You'll need:
- ✅ A **Google Account** (Gmail works)
- ✅ A **Credit/Debit card** (for billing alerts, even though tier is free)
- ✅ A few minutes of time

---

## 🎯 Step-by-Step: Get Your API Key

### Option 1: Fastest Method (Recommended)

#### Step 1: Create Google Cloud Project

1. **Go to**: https://console.cloud.google.com/projectselector2/home/dashboard
2. **Click**: "Select a Project" button (top left)
3. **Click**: "New Project"
4. **Enter**:
   - Project name: `amerilend-address-api` (or any name you like)
   - Leave other fields as default
5. **Click**: "Create"
6. **Wait**: 1-2 minutes for project to be created
7. **Click**: "Select Project" and choose your new project

#### Step 2: Enable Places API

1. **Click** the menu button (☰) at top left
2. **Go to**: APIs & Services → Library
3. **Search for**: "Places API" (in the search box)
4. **Click** on "Places API"
5. **Click**: "Enable" button
6. **Wait**: A few seconds for it to enable

#### Step 3: Create API Key

1. **Go to**: APIs & Services → Credentials (left sidebar)
2. **Click**: "Create Credentials" button (top)
3. **Select**: "API Key"
4. **Copy** your API key (it looks like: `AIzaSy...`)
5. **Click**: "Close"

✅ **You now have your API key!**

---

### Option 2: If You Already Have a Google Cloud Project

1. **Go to**: https://console.cloud.google.com/
2. **Select your project** (top left)
3. **Go to**: APIs & Services → Library
4. **Search**: "Places API"
5. **Click**: "Enable"
6. **Go to**: Credentials
7. **Create** new API Key (or use existing)
8. **Copy** your API key

---

### Option 3: Visual Step-by-Step (Screenshots)

See the full visual guide below ⬇️

---

## 🖼️ Visual Guide

### Screenshot 1: Google Cloud Console Home
```
Your browser address bar shows:
console.cloud.google.com

┌──────────────────────────────────────────────────┐
│ Google Cloud Console                             │
├──────────────────────────────────────────────────┤
│                                                  │
│  ☰ [Select a Project ▼]  [Search...]          │
│                                                  │
│  📊 Dashboard                                    │
│                                                  │
│  Welcome to Google Cloud!                        │
│  Let's get started with your project             │
│                                                  │
└──────────────────────────────────────────────────┘

👆 Click "Select a Project" to create new one
```

### Screenshot 2: Create New Project
```
┌──────────────────────────────────────────────────┐
│ Select a project                             ✕   │
├──────────────────────────────────────────────────┤
│                                                  │
│  [New Project]  button at top right              │
│                                                  │
│  My Projects                                     │
│  ├─ Your existing projects (if any)             │
│                                                  │
└──────────────────────────────────────────────────┘

👆 Click [New Project]
```

### Screenshot 3: Name Your Project
```
┌──────────────────────────────────────────────────┐
│ Create a new project                        ✕   │
├──────────────────────────────────────────────────┤
│                                                  │
│ Project name *                                   │
│ ┌──────────────────────────────────────────────┐ │
│ │ amerilend-address-api                       │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ Organization (optional)                          │
│ ┌──────────────────────────────────────────────┐ │
│ │ No organization                              │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ [Cancel]  [Create]                              │
│                                                  │
└──────────────────────────────────────────────────┘

👆 Click [Create]
```

### Screenshot 4: Wait for Project Creation
```
⏳ Creating project 'amerilend-address-api'...

(May take 1-2 minutes)
```

### Screenshot 5: APIs & Services Library
```
Your browser shows:
console.cloud.google.com/apis/library

┌──────────────────────────────────────────────────┐
│ ☰ Select: APIs & Services → Library             │
├──────────────────────────────────────────────────┤
│                                                  │
│ Search all APIs:                                 │
│ ┌────────────────────────────────────────────┐  │
│ │ Places API                              🔍 │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
│ Results:                                         │
│ ┌────────────────────────────────────────────┐  │
│ │ 📍 Places API                             │  │
│ │    Use Places data in your app             │  │
│ │    [Enable]  button                       │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘

👆 Click [Enable]
```

### Screenshot 6: Credentials Page
```
Your browser shows:
console.cloud.google.com/apis/credentials

┌──────────────────────────────────────────────────┐
│ APIs & Services > Credentials                    │
├──────────────────────────────────────────────────┤
│                                                  │
│ [Create Credentials ▼]  button                  │
│                                                  │
│ API Keys:                                        │
│ ┌────────────────────────────────────────────┐  │
│ │ API Key 1 (Default)                       │  │
│ │ AIzaSyC...(hidden)                        │  │
│ │ [Click to show]                           │  │
│ └────────────────────────────────────────────┘  │
│                                                  │
└──────────────────────────────────────────────────┘

👆 Click [Create Credentials] → Choose "API Key"
```

### Screenshot 7: Your API Key!
```
┌──────────────────────────────────────────────────┐
│ API Key Created!                            ✕   │
├──────────────────────────────────────────────────┤
│                                                  │
│ ⚠️ Keep this API key secure                     │
│                                                  │
│ Your API key:                                    │
│ ┌──────────────────────────────────────────────┐ │
│ │ AIzaSyDvXJ3b7Q8K9L2M1N3P4Q5R6S7T8U9V0W │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ [Copy ▼]  [Close]                              │
│                                                  │
└──────────────────────────────────────────────────┘

👆 Click [Copy] to copy your API key!
```

---

## ❓ Common Issues & Solutions

### Issue 1: "Billing Account Required"

**What it means**: Google Cloud needs a billing method on file

**Solution**:
1. Click the notification about billing
2. Create a billing account
3. Add a credit/debit card
4. You won't be charged (free tier is $200/month)

### Issue 2: "Places API Not Found"

**What it means**: You searched but can't find it

**Solution**:
1. Make sure you're in the right project (top left)
2. Try exact search: "Places API"
3. If still stuck, use this direct link:
   - https://console.cloud.google.com/marketplace/product/google/maps-places-backend

### Issue 3: Can't Create API Key

**What it means**: There might be permission issues

**Solution**:
1. Verify you're logged in with your personal Google account
2. Check you have Editor role for the project
3. Try in an incognito window
4. Clear browser cache and try again

### Issue 4: "Project Creation Failed"

**What it means**: Google couldn't create the project

**Solution**:
1. Try a different project name
2. Wait a few minutes and try again
3. Check you're not hitting quotas
4. Try creating in a different browser

### Issue 5: "Enable Button Greyed Out"

**What it means**: API might already be enabled

**Solution**:
1. Refresh the page
2. The button should say "Manage" instead
3. Go to Credentials to get your key

---

## 🔐 Restricting Your API Key (Security)

After creating your API key, it's good practice to restrict it:

### Option A: Domain Restriction (Recommended)

1. **Go to**: APIs & Services → Credentials
2. **Click** on your API key
3. **Find**: "Application restrictions"
4. **Select**: "HTTP referrers (web sites)"
5. **Add**:
   - `http://localhost:*` (for development)
   - `https://yourdomain.com/*` (for production)
6. **Click**: "Save"

### Option B: API Restriction

1. **Same page**, find: "API restrictions"
2. **Select**: "Restrict key"
3. **Check only**: "Places API"
4. **Click**: "Save"

---

## 📋 API Key Checklist

Before using your API key, verify:

- [ ] You have a Google Cloud project
- [ ] Places API is enabled
- [ ] You have an API key created
- [ ] API key is copied (save it somewhere safe)
- [ ] You have billing enabled (won't be charged)
- [ ] (Optional) API key is restricted to your domains

---

## 🚀 Next Steps

### Once You Have Your API Key:

1. **Open** your project's `.env` file
2. **Add** this line:
   ```bash
   VITE_GOOGLE_PLACES_API_KEY=AIzaSyYOUR_KEY_HERE
   ```
3. **Replace** `AIzaSyYOUR_KEY_HERE` with your actual key
4. **Save** the file
5. **Restart** your dev server:
   ```bash
   npm run dev
   ```
6. **Test** it at: http://localhost:3000/apply

---

## 🆘 Still Having Issues?

### Try These Troubleshooting Steps:

1. **Clear Browser Cache**
   - Press: Ctrl + Shift + Delete
   - Select "All time"
   - Clear browsing data

2. **Try Different Browser**
   - Chrome, Firefox, Safari all work
   - Try an incognito/private window

3. **Check Google Status**
   - Visit: https://status.cloud.google.com/
   - Make sure Google Cloud services aren't down

4. **Verify Email**
   - Check your Google account email is verified
   - Some features require email verification

5. **Wait and Retry**
   - Sometimes it just needs a few minutes
   - Try again in 5-10 minutes

### If Still Stuck:

1. **Check Google Cloud Help**: https://cloud.google.com/docs/support
2. **Search the error**: Copy-paste the error into Google
3. **Visit Stack Overflow**: Many users post solutions there
4. **Check this repo's issues**: https://github.com/Dianasmith6525/amerilend2/issues

---

## 🎯 Alternative: Test Without API Key

**Don't have an API key yet?** 

No problem! The feature works fine without it:

1. **Leave** `VITE_GOOGLE_PLACES_API_KEY` empty in `.env`
2. **Restart** dev server
3. **Test** the form - it works as a regular text input
4. **Users can** still fill in addresses manually

Once you get your API key later:
1. **Add** it to `.env`
2. **Restart** server
3. **Autocomplete activates** automatically!

---

## 📞 Need More Help?

### Resources

- **Google Cloud Setup**: https://cloud.google.com/docs/get-started
- **Places API Docs**: https://developers.google.com/maps/documentation/places
- **Google Cloud FAQ**: https://cloud.google.com/support/faq
- **API Pricing**: https://developers.google.com/maps/billing-and-pricing/pricing

### Local Documentation

In your project, see:
- `README_ADDRESS_AUTOCOMPLETE.md` - Main guide
- `ADDRESS_AUTOCOMPLETE_SETUP.md` - Detailed setup
- `ADDRESS_AUTOCOMPLETE_QUICK_REFERENCE.md` - Quick reference

---

## ✅ Success!

Once you see this in your `.env`:
```bash
VITE_GOOGLE_PLACES_API_KEY=AIzaSy...
```

And restart the server - **you're all set!** 🎉

Try it: http://localhost:3000/apply → Step 2 → Type an address → Watch it auto-fill!

---

**Remember**: You don't NEED the API key to use the feature - it's just a bonus! The form works perfectly fine as a regular text input without it.

**Status**: ⏳ Waiting for your API key (or proceed without it)
**Time to get key**: 5-10 minutes
**Cost**: Free! ($200/month free tier)
