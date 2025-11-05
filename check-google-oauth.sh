#!/bin/bash
# Google OAuth Configuration Diagnostic Script
# Run this to verify your Google OAuth setup

echo "========================================="
echo "Google OAuth Configuration Diagnostic"
echo "========================================="
echo ""

# Check if .env file exists
echo "1. Checking for .env file..."
if [ -f ".env" ]; then
    echo "   ✅ .env file found"
else
    echo "   ❌ .env file NOT found"
    echo "   Create one by copying .env.example: cp .env.example .env"
fi

echo ""
echo "2. Checking environment variables..."

# Check GOOGLE_CLIENT_ID
if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo "   ❌ GOOGLE_CLIENT_ID is missing or empty"
    echo "      Add to .env: GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com"
else
    echo "   ✅ GOOGLE_CLIENT_ID is set"
    echo "      Value: ${GOOGLE_CLIENT_ID:0:30}... (truncated)"
fi

# Check GOOGLE_CLIENT_SECRET
if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "   ❌ GOOGLE_CLIENT_SECRET is missing or empty"
    echo "      Add to .env: GOOGLE_CLIENT_SECRET=your-client-secret"
else
    echo "   ✅ GOOGLE_CLIENT_SECRET is set"
    echo "      Value: (hidden for security)"
fi

# Check GOOGLE_CALLBACK_URL
if [ -z "$GOOGLE_CALLBACK_URL" ]; then
    echo "   ❌ GOOGLE_CALLBACK_URL is missing or empty"
    echo "      Add to .env: GOOGLE_CALLBACK_URL=http://localhost:3001/api/auth/google/callback"
else
    echo "   ✅ GOOGLE_CALLBACK_URL is set"
    echo "      Value: $GOOGLE_CALLBACK_URL"
fi

echo ""
echo "3. Verifying credentials format..."

# Check GOOGLE_CLIENT_ID format
if [[ $GOOGLE_CLIENT_ID == *".apps.googleusercontent.com"* ]]; then
    echo "   ✅ GOOGLE_CLIENT_ID has correct format"
else
    echo "   ⚠️  GOOGLE_CLIENT_ID format looks incorrect"
    echo "      Should end with: .apps.googleusercontent.com"
fi

# Check GOOGLE_CALLBACK_URL format
if [[ $GOOGLE_CALLBACK_URL == *"/api/auth/google/callback"* ]]; then
    echo "   ✅ GOOGLE_CALLBACK_URL has correct format"
else
    echo "   ⚠️  GOOGLE_CALLBACK_URL format looks incorrect"
    echo "      Should end with: /api/auth/google/callback"
fi

echo ""
echo "========================================="
echo "Summary:"
echo "========================================="

if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ] || [ -z "$GOOGLE_CALLBACK_URL" ]; then
    echo "❌ Google OAuth is NOT configured"
    echo ""
    echo "Next steps:"
    echo "1. Get credentials from: https://console.cloud.google.com/apis/credentials"
    echo "2. Update your .env file with the credentials"
    echo "3. Restart the dev server"
else
    echo "✅ Google OAuth appears to be configured"
    echo ""
    echo "If you're still having issues:"
    echo "1. Verify the credentials are correct"
    echo "2. Check that callback URL matches Google Cloud Console"
    echo "3. Check server logs for detailed error messages"
fi

echo ""
