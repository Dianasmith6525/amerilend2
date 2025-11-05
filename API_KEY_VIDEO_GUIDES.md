# 🔑 Getting API Key - Video Tutorials & Quick Links

## 🎬 Video Tutorials

If you prefer watching instead of reading, here are some video guides:

### Official Google Tutorials
1. **Create Google Cloud Project**: https://www.youtube.com/watch?v=mLKvFGF0G-o
2. **Enable API**: https://www.youtube.com/watch?v=RiFKwAWFl-A
3. **Create API Key**: https://www.youtube.com/watch?v=LYCh4l7HBuE

### Community Tutorials
- **Full Setup**: https://www.youtube.com/watch?v=b7yXf9nnFvI (Places API tutorial)
- **Beginners Guide**: https://www.youtube.com/results?search_query=google+places+api+key+tutorial

---

## 🔗 Direct Links (Fastest)

### One-Click Links (Use These!)

**Click one of these links directly:**

1. **Create New Project**:
   - https://console.cloud.google.com/projectselector2/home/dashboard
   - Click "New Project"

2. **Enable Places API** (after creating project):
   - https://console.cloud.google.com/marketplace/product/google/maps-places-backend
   - Click "Enable"

3. **Get Your API Key** (after enabling):
   - https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "API Key"

---

## ⚡ Super Quick (2-Minute Method)

If you're in a hurry, here's the absolute fastest way:

### Steps:
1. Go to: https://console.cloud.google.com/
2. Click "Select a Project" → "New Project"
3. Name it: `amerilend` → "Create"
4. Go to: https://console.cloud.google.com/marketplace/product/google/maps-places-backend
5. Click "Enable"
6. Go to: https://console.cloud.google.com/apis/credentials
7. Click "Create Credentials" → "API Key"
8. **Copy** your key!

**Total time**: ~3-5 minutes ⏱️

---

## 🆘 Stuck? Try These Alternatives

### Alternative 1: Use Your Own Maps Instance

If Google Cloud is being difficult:

**Try using a different browser:**
- ❌ Having issues in Chrome?
- ✅ Try Firefox or Safari instead
- ✅ Try an incognito/private window

### Alternative 2: Work Without API Key

**You can still use the feature!**

The address field works perfectly as a regular text input:
1. Leave `VITE_GOOGLE_PLACES_API_KEY` out of `.env`
2. Restart the server
3. Address field is ready to use
4. Users type addresses manually
5. No autocomplete (but form still works!)

You can add the API key later whenever you're ready.

### Alternative 3: Ask Your Team

If you have a team member:
- ✅ Ask them for an existing API key
- ✅ Add it to your `.env`
- ✅ No need to create a new project

### Alternative 4: Use a Different Service

If Google isn't working, try these alternatives:

| Service | How to Get Key | Setup Time |
|---------|---|---|
| **HERE Maps** | https://developer.here.com/ | 5 min |
| **MapBox** | https://www.mapbox.com/ | 5 min |
| **OpenStreetMap** | Open source (no key!) | 1 min |

---

## 💡 Pro Tips

### Tip 1: Save Your API Key Somewhere Safe
- ✅ Write it down in a password manager
- ✅ Save in a team secrets file
- ❌ Don't share publicly
- ❌ Don't commit to Git

### Tip 2: Test Before Production
- Create the key in development first
- Make sure autocomplete works
- Then set up production key

### Tip 3: Monitor Costs
- Set billing alerts in Google Cloud
- Check usage monthly
- Most businesses stay free ($200 credit)

### Tip 4: Restrict Your Key
- Limits which websites can use it
- Makes it more secure
- Instructions in `GET_GOOGLE_PLACES_API_KEY.md`

---

## 📱 Mobile Friendly Setup

### If Setting Up on Your Phone

1. **Go to**: Google Cloud (use mobile browser)
2. **Log in** with your Google account
3. **Create** project (same steps, but tap instead of click)
4. **Copy** API key
5. **Go to**: `.env` file
6. **Paste**: `VITE_GOOGLE_PLACES_API_KEY=your_key`

---

## 🆘 Common Error Messages & Fixes

### "Need to create a billing account"
```
✅ Solution: Click the link, add a credit card
   (You won't be charged - free tier!)
```

### "Places API not found in search"
```
✅ Solution: Use direct link:
   https://console.cloud.google.com/marketplace/product/google/maps-places-backend
```

### "You don't have permission"
```
✅ Solution: Make sure you're the project owner
   - Ask admin to add you with "Editor" role
   - Or create your own project
```

### "API Key creation failed"
```
✅ Solution: Try these steps:
   1. Refresh the page
   2. Try a different browser
   3. Clear cookies and cache
   4. Wait 5 minutes and try again
```

---

## 📋 Copy-Paste Template

Once you get your API key, use this template:

### Your `.env` file should have:

```bash
# Google Places API for address autocomplete
VITE_GOOGLE_PLACES_API_KEY=AIzaSy_YOUR_API_KEY_HERE
```

**Replace** `AIzaSy_YOUR_API_KEY_HERE` with your actual key

Example:
```bash
VITE_GOOGLE_PLACES_API_KEY=AIzaSyDvXJ3b7Q8K9L2M1N3P4Q5R6S7T8U9V0W
```

---

## ✅ Verify It's Working

After adding your API key to `.env` and restarting:

1. **Open**: http://localhost:3000/apply
2. **Go to**: Step 2 (Address Information)
3. **Type**: An address (e.g., "1600 Amphitheatre")
4. **You should see**: Google suggestions in a dropdown ✨

If you see suggestions → **It's working!** 🎉

If no suggestions appear → Check:
- [ ] API key is in `.env`
- [ ] Server was restarted after adding key
- [ ] API key is valid (copied correctly)
- [ ] Places API is enabled in Google Cloud

---

## 🎯 Still Stuck?

### Try This:

1. **Re-read** `GET_GOOGLE_PLACES_API_KEY.md` (detailed guide)
2. **Check** if billing account is set up
3. **Verify** Places API is enabled
4. **Wait** a few minutes (sometimes takes time to activate)
5. **Clear** browser cache (Ctrl+Shift+Delete)
6. **Try** a different browser
7. **Ask** in project issues/discussions

---

## ⏭️ What's Next?

### Option A: You Got Your API Key! 🎉
1. Add to `.env` file
2. Restart dev server
3. Test at http://localhost:3000/apply
4. Done! Enjoy autocomplete! ✨

### Option B: Still Getting Key
1. Follow the step-by-step guide
2. Use the direct links provided
3. Come back when you have it

### Option C: Want to Skip for Now
1. Leave API key out of `.env`
2. Form works as regular text input
3. Add API key anytime later
4. Autocomplete activates automatically

---

**Remember**: You've got this! It's easier than it looks. The whole process takes 5-10 minutes max. 💪

If all else fails, the form works perfectly fine WITHOUT the API key - it's just an enhancement, not required!

---

**Last Updated**: November 4, 2025  
**Status**: Ready to help you get that API key! ✅
