# AI Support Setup Guide

## 🤖 Enabling AI Support Chat

The AI Support feature is fully implemented but requires an API key to function. Follow these steps to enable it:

---

## Quick Setup (5 minutes)

### Option 1: OpenAI (Recommended - Most Reliable)

1. **Get an API Key from OpenAI:**
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in
   - Click "Create new secret key"
   - Copy the key (starts with `sk-proj-...`)

2. **Add to your `.env` file:**
   ```env
   BUILT_IN_FORGE_API_URL=https://api.openai.com/v1/chat/completions
   BUILT_IN_FORGE_API_KEY=sk-proj-your-actual-key-here
   ```

3. **Restart your dev server:**
   ```bash
   npm run dev
   ```

4. **Test AI Support:**
   - Go to the homepage
   - Click the chat bubble in the bottom-right corner
   - Type a message like "What loan options are available?"

---

### Option 2: Google Gemini (Free Tier Available)

1. **Get a Gemini API Key:**
   - Go to https://makersuite.google.com/app/apikey
   - Sign in with Google
   - Click "Create API Key"
   - Copy the key

2. **Update your `.env` file:**
   ```env
   BUILT_IN_FORGE_API_URL=https://generativelanguage.googleapis.com/v1beta/chat/completions
   BUILT_IN_FORGE_API_KEY=your-gemini-api-key-here
   ```

3. **Restart the server and test**

---

## Current Status

✅ **Implemented Features:**
- AI-powered customer support chat
- Context-aware responses about loans, payments, and applications
- Suggested questions based on user context
- Floating chat widget on homepage and dashboard
- Integration with loan application data

❌ **What's Missing:**
- Just the API key in your `.env` file!

---

## What the AI Support Can Do

The AI assistant can help users with:

- **Loan Information:** Types of loans, requirements, rates
- **Application Status:** Check loan application progress
- **Payment Questions:** Payment methods, schedules, history
- **Account Help:** Profile updates, security, general navigation
- **General Support:** FAQ, contact information, business hours

---

## Error Handling

If users try to use AI Support without the API key configured, they will see:

- A toast notification: "AI Support needs configuration"
- A helpful message with contact information for human support
- No application crashes or technical errors exposed to users

---

## API Costs

### OpenAI Pricing (GPT-4o-mini):
- **Input:** $0.150 per 1M tokens (~$0.0002 per conversation)
- **Output:** $0.600 per 1M tokens (~$0.0006 per conversation)
- **Typical Cost:** ~$0.001 per conversation (very affordable)

### Google Gemini Pricing:
- **Free Tier:** 15 requests per minute (great for development)
- **Paid Tier:** Very competitive pricing

---

## Security Notes

⚠️ **Important:**
- Never commit your `.env` file to version control (already in `.gitignore`)
- Keep API keys secure
- Set usage limits in your API provider dashboard
- Monitor API usage regularly

---

## Testing Checklist

After adding the API key:

- [ ] Server starts without errors
- [ ] Chat widget appears in bottom-right corner
- [ ] Can open chat and see welcome message
- [ ] Can send a message and receive AI response
- [ ] Suggested questions appear and work
- [ ] Error messages are user-friendly

---

## Troubleshooting

### "AI Support is not configured" error
- Check that `BUILT_IN_FORGE_API_KEY` is set in `.env`
- Make sure the key is not the placeholder `your-forge-api-key`
- Restart the dev server after changing `.env`

### Chat widget not appearing
- Clear browser cache
- Check browser console for errors
- Ensure you're on the homepage or dashboard

### API requests failing
- Verify API key is valid
- Check API provider dashboard for usage/limits
- Ensure `BUILT_IN_FORGE_API_URL` is correct for your provider

---

## Support

Need help? The AI Support setup is independent of the main application functionality. 

If you can't get it working right now, users can still:
- Use the contact form
- Call support directly
- Submit applications normally

The AI Support is an enhancement, not a requirement for the core application to function.

---

**Last Updated:** November 3, 2025
