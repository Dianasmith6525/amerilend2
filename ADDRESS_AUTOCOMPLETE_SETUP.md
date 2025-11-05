# Address Autocomplete Setup Guide

This guide will help you set up Google Places Autocomplete for address input fields in your application.

## Overview

The address autocomplete feature has been added to:
- **Loan Application Page** (`ApplyLoan.tsx`) - Step 2: Address Information
- **User Profile Page** (`UserProfile.tsx`) - Personal Information section

## Features

✅ **Real-time address suggestions** as customers type
✅ **Automatic field population** for street, city, state, and ZIP code
✅ **US-only address filtering** to ensure data quality
✅ **Mobile-friendly** autocomplete dropdown
✅ **Seamless integration** with existing forms

## Setup Instructions

### Step 1: Get Google Places API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - **Places API**
   - **Geocoding API** (optional, but recommended)
4. Go to **Credentials** → **Create Credentials** → **API Key**
5. Copy your API key
6. (Recommended) Restrict your API key:
   - Click on your API key
   - Under "Application restrictions", select "HTTP referrers (web sites)"
   - Add your domains:
     - `http://localhost:*` (for development)
     - `https://yourdomain.com/*` (for production)
   - Under "API restrictions", select "Restrict key"
   - Enable only: Places API, Geocoding API

### Step 2: Add API Key to Environment Variables

1. Open your `.env` file (or create one from `.env.example`)
2. Add the following line:
   ```bash
   VITE_GOOGLE_PLACES_API_KEY=YOUR_API_KEY_HERE
   ```
3. Replace `YOUR_API_KEY_HERE` with your actual Google Places API key
4. Save the file

### Step 3: Restart Development Server

After adding the environment variable, restart your development server:

```bash
npm run dev
```

## How It Works

### For Users

1. Customer starts typing their address in the "Street Address" field
2. Google Places shows a dropdown with matching address suggestions
3. Customer clicks on their address from the dropdown
4. All address fields are automatically filled:
   - Street Address
   - City
   - State
   - ZIP Code

### Technical Implementation

The `AddressAutocomplete` component (`client/src/components/ui/AddressAutocomplete.tsx`):
- Loads the Google Places API script dynamically
- Initializes Google Places Autocomplete on the input field
- Restricts suggestions to US addresses only
- Parses selected address into components
- Automatically fills related fields (city, state, ZIP)

## Pricing

Google Places Autocomplete is **pay-as-you-go**:

- **Autocomplete - Per Session**: $2.83 per 1,000 sessions
- **Free tier**: $200 monthly credit (covers ~70,000 sessions/month)
- A "session" starts when user types and ends when they select an address

Most small to medium businesses stay within the free tier.

### Cost Optimization Tips

1. Use session-based pricing (already implemented)
2. Set billing alerts in Google Cloud Console
3. Restrict API key to your domains only
4. Monitor usage in Google Cloud Console

## Testing

### Without API Key

If you haven't set up the API key yet, the address fields will work as regular text inputs. Users can still manually enter their address.

### With API Key

1. Go to the loan application page: `/apply`
2. Navigate to Step 2: Address Information
3. Start typing an address (e.g., "1600 Amphitheatre")
4. Select an address from the dropdown
5. Verify that all fields are automatically populated

## Fallback Behavior

The component is designed to degrade gracefully:
- If API key is missing → Works as regular input field
- If Google Places API fails to load → Works as regular input field
- Users can always manually type/edit addresses

## Troubleshooting

### Autocomplete not showing suggestions

1. **Check API key**: Verify `VITE_GOOGLE_PLACES_API_KEY` is set in `.env`
2. **Check browser console**: Look for errors related to Google Places API
3. **Verify API is enabled**: Ensure Places API is enabled in Google Cloud Console
4. **Check API restrictions**: Make sure your domain is allowed in API key settings

### "This API project is not authorized to use this API"

- Go to Google Cloud Console → APIs & Services → Library
- Search for "Places API" and enable it

### "RefererNotAllowedMapError"

- Your website domain is not authorized for this API key
- Add your domain to the API key restrictions in Google Cloud Console

### Browser console shows "Google is not defined"

- The Google Places API script failed to load
- Check your internet connection
- Verify the API key is valid

## Alternative: Without Google Places API

If you prefer not to use Google Places API, the forms will work perfectly fine with manual address entry. Simply remove or don't set the `VITE_GOOGLE_PLACES_API_KEY` environment variable.

## Support

For issues related to:
- **Google API**: Visit [Google Maps Platform Support](https://developers.google.com/maps/support)
- **Implementation**: Check the component code at `client/src/components/ui/AddressAutocomplete.tsx`

## Security Notes

⚠️ **Important**:
- Never commit your `.env` file to version control
- Restrict your API key to specific domains
- Monitor API usage regularly
- Use environment variables for all sensitive keys
- The `.env` file is already in `.gitignore`

---

**Quick Start Checklist:**
- [ ] Get Google Places API key from Google Cloud Console
- [ ] Add `VITE_GOOGLE_PLACES_API_KEY=your_key` to `.env` file
- [ ] Restart development server
- [ ] Test address autocomplete on loan application page
- [ ] (Optional) Set up billing alerts in Google Cloud Console
