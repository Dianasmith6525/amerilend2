# 🏠 Address Autocomplete - Quick Reference

## ✅ What's Done

Address autocomplete has been added to your application. Customers can now:
- Start typing their address
- See real-time suggestions from Google Places
- Click to auto-fill street, city, state, and ZIP code

## 📍 Where It Works

1. **Loan Application** (`/apply`) - Step 2: Address Information
2. **User Profile** (`/profile`) - Personal Information section

## 🚀 Quick Setup (5 Minutes)

### Step 1: Get API Key
1. Go to: https://console.cloud.google.com/
2. Create/select a project
3. Enable "Places API" 
4. Create API key (Credentials → Create Credentials → API Key)

### Step 2: Add to .env
```bash
VITE_GOOGLE_PLACES_API_KEY=your_api_key_here
```

### Step 3: Restart Server
```bash
npm run dev
```

### Step 4: Test
1. Go to http://localhost:3000/apply
2. Navigate to Step 2
3. Type an address in "Street Address" field
4. Select from dropdown
5. Watch all fields auto-fill! 🎉

## 💰 Pricing

- **Free tier**: $200/month credit (~70,000 autocomplete sessions)
- **Paid**: $2.83 per 1,000 sessions after free tier
- **Most businesses**: Stay within free tier

Example: 1,000 applications/month = $2.83/month

## 🔒 Security

- ✅ `.env` file in `.gitignore` (not committed to git)
- ✅ API key stored securely in environment variables
- ✅ Can restrict to your domains in Google Cloud Console
- ✅ No sensitive data sent to Google

## 🛠️ Without API Key

Don't have an API key yet? **No problem!**
- Address fields work as regular text inputs
- Forms submit normally
- No errors or broken functionality
- Users can manually type addresses

## 📊 Component Details

**Component**: `client/src/components/ui/AddressAutocomplete.tsx`

**Features**:
- Loads Google Places API dynamically
- Restricts to US addresses only
- Parses address into components
- Auto-fills related fields
- Graceful fallback if API unavailable

**Props**:
```typescript
<AddressAutocomplete
  value={string}              // Current value
  onInputChange={function}    // Called when user types
  onAddressSelect={function}  // Called when address selected
  label={string}              // Field label
  placeholder={string}        // Placeholder text
  required={boolean}          // Is field required?
  apiKey={string}             // Google Places API key
/>
```

## 🎯 Benefits

### For Customers
- ⚡ Faster application completion
- ✅ Fewer typos and errors
- 📱 Works great on mobile
- 🎨 Modern, professional interface

### For Business
- 📮 Accurate mailing addresses
- 📊 Standardized data format
- 🔍 Better address validation
- 💼 Professional appearance

## 🐛 Troubleshooting

### Issue: Autocomplete not showing
**Solution**: 
1. Check if `VITE_GOOGLE_PLACES_API_KEY` is in `.env`
2. Restart dev server
3. Check browser console for errors

### Issue: "API project not authorized"
**Solution**: Enable Places API in Google Cloud Console

### Issue: "RefererNotAllowedMapError"
**Solution**: Add your domain to API key restrictions

## 📚 Full Documentation

For detailed guides, see:
- **Setup Guide**: `ADDRESS_AUTOCOMPLETE_SETUP.md`
- **Implementation Details**: `ADDRESS_AUTOCOMPLETE_IMPLEMENTATION_SUMMARY.md`

## 🔄 Rollback

To disable temporarily:
1. Remove `VITE_GOOGLE_PLACES_API_KEY` from `.env`
2. Restart server
3. Feature will work as regular text input

## 📞 Support Resources

- **Google Places Docs**: https://developers.google.com/maps/documentation/places
- **Google Cloud Console**: https://console.cloud.google.com/
- **Pricing Info**: https://developers.google.com/maps/billing-and-pricing/pricing

---

## 📋 Setup Checklist

- [ ] Create Google Cloud project
- [ ] Enable Places API
- [ ] Create API key
- [ ] Add `VITE_GOOGLE_PLACES_API_KEY` to `.env`
- [ ] Restart development server  
- [ ] Test on loan application page
- [ ] (Optional) Restrict API key to your domains
- [ ] (Optional) Set billing alerts

---

**Status**: ✅ Ready to use (just need API key)  
**Time to setup**: ~5 minutes  
**Cost**: Free for most usage  
**Risk**: None (graceful fallback)
