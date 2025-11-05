# Network Error Diagnosis & Fix

## Problem
You're getting "networkerror when attempting to fetch resources" when trying to submit your application.

## Root Causes (Common)

### 1. **Server not running or wrong port**
- Dev server should be running on port 3003 (or available port if 3000-3002 are busy)
- Client is connecting to `/api/trpc` (relative URL)
- Check terminal output for: "Server running on http://localhost:3003/"

### 2. **CORS issues**
- Server allows all hosts: `allowedHosts: true`
- Fetch requests include credentials: `credentials: "include"`
- Should not be blocking requests

### 3. **Database connection failed**
- Many tRPC procedures need database connection
- If DB isn't connected, ALL requests will fail
- Check server logs for connection errors

### 4. **Vite dev server not serving client**
- Vite middleware should serve at `/`
- Transforming `index.html` and loading React app
- JavaScript bundle might not be loading

## How to Debug

### Step 1: Check Server is Running
```powershell
# The server should print this:
# Port 3001 is busy, using port 3003 instead
# Server running on http://localhost:3003/

# If you don't see this, server crashed
npm run dev
```

### Step 2: Open Browser DevTools
Press `F12` or `Ctrl+Shift+I`, go to **Network** tab

- Click "Submit Application" button
- Look at the failed request
- Check:
  - URL (should be http://localhost:3003/api/trpc/...)
  - Status (should see 200, not 404 or 500)
  - Response (what error message?)

### Step 3: Check Application Tab
Go to **Application** tab in DevTools:

- **Cookies**: Look for session cookie
- **Local Storage**: Check for app state
- **Console**: Check for JavaScript errors

### Step 4: Check Server Logs
Look at terminal where `npm run dev` is running:

- Look for error messages after you submit
- Check for "[LoanApplication]", "[FRAUD_SCORE]", or error logs

## Most Likely Fixes

### Fix 1: Database Connection Issue
```bash
# Ensure DATABASE_URL environment variable is set
# Check .env file in root directory

# You should have:
DATABASE_URL=mysql://user:password@host:port/database

# Then restart server:
npm run dev
```

### Fix 2: Port Conflict
If Vite dev server won't start:
```bash
# Kill whatever is using ports 3000-3003
# Windows:
netstat -ano | findstr :3003
taskkill /PID <PID> /F

# Then restart:
npm run dev
```

### Fix 3: Node Modules Issue
```bash
# Reinstall dependencies
rm node_modules
pnpm install

# Then restart:
npm run dev
```

### Fix 4: TypeScript Compilation Error
```bash
# Check for compilation errors
npm run build

# If it fails, there's a type error preventing the server from starting
```

## Expected Behavior When Working

✅ When you submit the application:
1. Form validates on client (shows error if invalid)
2. Browser Network tab shows: `POST /api/trpc/loans.submit`
3. Response has status `200` with `{"result":{"data":{"success":true}}}`
4. Toast shows success message with confetti
5. Redirects to `/dashboard`

❌ When network error occurs:
1. Validation passes (or you see "networkerror" instead)
2. Browser Network tab shows request failed
3. Status might be: `0` (blocked), `500` (server error), or no response
4. Check Response tab for error message

## If Still Not Working

Share these details in a bug report:
1. Output of `npm run dev` (first 30 lines)
2. Browser DevTools Network tab (right-click failed request → Copy as cURL)
3. Browser Console errors (any red text)
4. Server terminal logs (any errors after submit attempt)
