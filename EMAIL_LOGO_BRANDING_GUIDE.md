# Email Branding with Logo Support

## Overview

The email notification system has been enhanced to support custom company logos and branding in all email templates. Customers will now see your company logo and name in approval, submission, and other status notification emails.

## Features Added

✅ **Custom Logo Image Support**
- Include your company logo in the email header
- Logo automatically resizes to 200px width × 60px height max
- Works with any image format (PNG, JPG, GIF, SVG)

✅ **Custom Company Name**
- Replace "AmeriLend" with your actual company name
- Appears in email header, signature, and footer
- Used in email subject lines

✅ **Backward Compatible**
- If no logo/name provided, defaults to "AmeriLend"
- Existing code continues to work without changes

## How to Use

### Option 1: Send Emails with Logo (Recommended)

When sending loan status emails, include the `companyLogo` and `companyName` properties:

```typescript
await sendLoanStatusEmailEnhanced({
  email: user.email,
  status: "approved",
  loanId: String(application.id),
  recipientName: user.name || "Applicant",
  approvalAmount: input.approvedAmount,
  additionalInfo: `Your approved amount is $${(input.approvedAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}...`,
  
  // NEW: Add your branding
  companyLogo: "https://your-domain.com/logo.png",
  companyName: "Your Company Name"
});
```

### Option 2: Configure Globally in Environment

Add to your `.env` file:

```env
# Email Branding
COMPANY_LOGO_URL=https://your-domain.com/images/logo.png
COMPANY_NAME=Your Company Name
```

Then create a helper to inject them automatically (optional):

```typescript
// In notification.ts
const DEFAULT_LOGO = process.env.COMPANY_LOGO_URL;
const DEFAULT_COMPANY = process.env.COMPANY_NAME || "AmeriLend";

// Use in all email functions
await sendLoanStatusEmailEnhanced({
  ...emailData,
  companyLogo: emailData.companyLogo || DEFAULT_LOGO,
  companyName: emailData.companyName || DEFAULT_COMPANY
});
```

## Updated Email Data Interface

```typescript
export interface LoanEmailData {
  // ... existing properties ...
  
  // NEW: Branding properties (optional)
  companyLogo?: string;      // URL to company logo image
  companyName?: string;      // Company name (defaults to "AmeriLend")
}
```

## Email Templates Updated

The following email templates now support logo and company name:

### ✅ Application Submitted
- **File**: `getApplicationSubmittedTemplate()`
- **When**: Customer submits a loan application
- **Shows**: Logo + company name in header and footer

### ✅ Application Approved
- **File**: `getApplicationApprovedTemplate()`
- **When**: Admin approves the loan
- **Shows**: Logo + company name + green branded header

### ✅ More Information Requested
- **File**: `getMoreInfoTemplate()`
- **When**: Admin requests additional documents
- **Shows**: Logo + company name + orange branded header

### ✅ Application Declined
- **File**: `getApplicationDeclinedTemplate()`
- **When**: Admin declines the loan
- **Shows**: Logo + company name + red branded header

## Logo Requirements

### Image Specifications
- **Format**: PNG, JPG, GIF, SVG recommended
- **Size**: 200px × 60px maximum display size (will auto-scale)
- **File Size**: Keep under 100KB for fast loading
- **Colors**: Full color or transparent background

### Hosting
- **URL**: Must be publicly accessible HTTPS URL
- **CDN Recommended**: Use CDN for reliability (e.g., CloudFlare, AWS S3)
- **Example**: `https://cdn.example.com/logo.png`

### Best Practices
✓ Use transparent PNG for flexibility in email clients
✓ Keep logo aspect ratio (e.g., 200:60 = 3.33:1)
✓ Test in major email clients (Gmail, Outlook, etc.)
✓ Include alt-text for accessibility

## Email Appearance

### With Logo (Example)
```
┌─────────────────────────────┐
│      [COMPANY LOGO]         │
│                             │
│  🎉 Application Approved!   │
│  Congratulations!           │
└─────────────────────────────┘
┌─────────────────────────────┐
│                             │
│ Dear John,                  │
│                             │
│ We're thrilled...           │
│                             │
│ Approved Amount: $10,000    │
│ Application ID: #12345      │
│                             │
└─────────────────────────────┘
┌─────────────────────────────┐
│ © 2024 Your Company. All    │
│ rights reserved.            │
└─────────────────────────────┘
```

### Without Logo (Default)
```
┌─────────────────────────────┐
│  🎉 Application Approved!   │
│  Congratulations!           │
└─────────────────────────────┘
```

## HTML Email Features

### Logo Section CSS
```css
.logo-section {
  margin-bottom: 20px;
}

.logo-section img {
  max-width: 200px;
  max-height: 60px;
  margin-bottom: 20px;
}
```

### Color-Coded Headers
- **Submitted** (Blue): #0033A0
- **Approved** (Green): #28a745
- **More Info** (Orange): #ff9800
- **Declined** (Red): #d32f2f

## Testing

### Test with Logo
1. Update email in `server/routers.ts`:
```typescript
await sendLoanStatusEmailEnhanced({
  email: user.email,
  status: "approved",
  // ... other fields ...
  companyLogo: "https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png",
  companyName: "Test Company"
});
```

2. Approve a test application
3. Check received email for logo in header
4. Verify company name appears in signature and footer

### Email Clients to Test
- ✅ Gmail
- ✅ Outlook
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ Mobile clients (iOS Mail, Gmail app)

## Backward Compatibility

**Existing Code**: All existing calls continue to work without modification:

```typescript
// Old code - still works!
await sendLoanStatusEmailEnhanced({
  email: user.email,
  status: "approved",
  loanId: String(application.id),
  recipientName: user.name,
  approvalAmount: input.approvedAmount,
  additionalInfo: "..."
});

// Result: Uses defaults (no logo, "AmeriLend" as company)
```

## Next Steps

1. **Get Your Logo Ready**
   - Prepare your company logo image
   - Upload to CDN or S3 bucket
   - Get HTTPS URL

2. **Update Environment Variables** (Optional)
   ```env
   COMPANY_LOGO_URL=https://cdn.example.com/logo.png
   COMPANY_NAME=Your Company
   ```

3. **Test Email Sending**
   - Approve a test loan application
   - Verify logo appears in email
   - Check all text is branded correctly

4. **Deploy to Production**
   - Configure production CDN URL
   - Set environment variables
   - Test with real email addresses

## Troubleshooting

### Logo Not Showing in Email
- **Check**: Is URL accessible via HTTPS?
- **Check**: Is image file size reasonable (<100KB)?
- **Test**: Open URL directly in browser
- **Fallback**: Email clients may block external images - provide alt-text

### Company Name Not Updating
- **Check**: Verify `companyName` parameter is set
- **Check**: Verify no typos in property name
- **Test**: Add console.log before sending email

### Email Formatting Issues
- **Check**: Rendering in multiple email clients
- **Check**: HTML is valid (no unclosed tags)
- **Test**: Use https://emailonacid.com/ or similar tool

## FAQ

**Q: Will all emails include the logo?**
A: Only if you provide `companyLogo` and `companyName` when calling `sendLoanStatusEmailEnhanced()`. Otherwise, defaults are used.

**Q: Can I use a different logo for each email type?**
A: Yes! Each call to `sendLoanStatusEmailEnhanced()` can specify different branding.

**Q: What if my logo is hosted locally during development?**
A: Use `http://localhost:3000/logo.png` during dev, production URL in production.

**Q: Are there size limits on logos?**
A: CSS limits display to 200×60px max, so keep source image reasonable size.

**Q: What about dark mode in email clients?**
A: Use transparent PNG background for better dark mode compatibility.

---

**Implementation Date**: November 4, 2025  
**Status**: ✅ Ready to Use  
**Files Modified**: `server/_core/loanEmailTemplates.ts`
