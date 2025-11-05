# 🔗 Connection Guide - How to Access Your Application

## Current Server Status

✅ **Server is running on: `http://localhost:3001/`**

## How to Connect

### Step 1: Open Your Browser
- **Chrome**: Open `http://localhost:3001/`
- **Firefox**: Open `http://localhost:3001/`
- **Safari**: Open `http://localhost:3001/`
- **Edge**: Open `http://localhost:3001/`

### Step 2: You Should See
- AmeriLend loan application interface
- Navigation menu
- Login/Signup options
- Loan application form

### Step 3: Submit Your Application
1. Click "Apply for Loan" or navigate to application page
2. Fill in all required fields:
   - Personal information
   - Address details
   - Employment information
   - Loan details (amount, purpose)
   - **Loan purpose: 10+ characters minimum** ⚠️
3. Check all 5 agreement checkboxes ✅
4. Click "Submit"
5. See success message with confetti! 🎉

## If You See "Unable to Connect"

### Quick Fixes

**Option 1: Verify Server is Running**
```
Look at terminal where you ran: npm run dev

Should show:
[Server] Listening on http://localhost:3001/
```

**Option 2: Try Different Port**
- If 3001 is busy, server uses 3002, 3003, 3004, 3005, etc.
- Check terminal output for actual port
- Example: `[Server] Listening on http://localhost:3002/`

**Option 3: Kill Background Processes**
```powershell
# Kill any existing Node processes
taskkill /F /IM node.exe

# Then restart server
npm run dev
```

**Option 4: Check Firewall**
- Windows Firewall might block localhost connections
- Try: Control Panel → Firewall → Allow app through firewall
- Or temporarily disable firewall for testing

## Connection Troubleshooting

| Problem | Symptom | Solution |
|---------|---------|----------|
| Server not running | "Connection refused" | Run `npm run dev` in terminal |
| Wrong port | Can connect but blank page | Check terminal for actual port |
| Firewall blocking | Connection times out | Check Windows Firewall settings |
| Port in use | Server exits immediately | Kill Node.js: `taskkill /F /IM node.exe` |
| Database down | 500 errors on submit | Check `.env` has DATABASE_URL |

## Technical Details

- **Frontend**: React + Vite on localhost:3001
- **Backend**: Express + tRPC on same port
- **Database**: TiDB Cloud MySQL (remote)
- **Protocol**: HTTP (development), HTTPS (production)
- **Port Range**: 3001-3020 (tries each if previous busy)

## Browser Console Debugging

If page loads but shows errors:

1. Press `F12` to open DevTools
2. Click **Console** tab
3. Look for red error messages
4. Common errors and fixes:

| Error | Cause | Fix |
|-------|-------|-----|
| `API Error: FETCH_ERROR` | Backend not responding | Ensure server running with `npm run dev` |
| `Cannot read property 'data'` | Bad response format | Check server logs for errors |
| `401 Unauthorized` | Session expired | Log in again |
| `CORS error` | Frontend/backend mismatch | Verify both use same protocol/port |

## If Still Cannot Connect

**Check these:**

1. ✅ Terminal shows `[Server] Listening on http://localhost:3001/`
2. ✅ No firewall blocking localhost
3. ✅ Browser can access `http://localhost:3001/`
4. ✅ DevTools Console has no red errors
5. ✅ `.env` file exists with DATABASE_URL set
6. ✅ Network tab (F12) shows successful requests to `/api/trpc`

## Contact Support

If you've checked all above and still can't connect:

1. Share terminal output (first 50 lines from `npm run dev`)
2. Share browser console errors (F12 → Console)
3. Share network request details (F12 → Network → failed request)
4. Describe what you see (blank page, error message, connection refused, etc.)

---

**Your application should now be accessible at `http://localhost:3001/`** ✅

Try opening it in your browser now! 🚀
