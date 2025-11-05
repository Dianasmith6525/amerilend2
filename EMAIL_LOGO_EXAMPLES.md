# Email Logo Implementation Examples

## Current Status

The email notification system **NOW SUPPORTS** custom logos and company branding in all notification emails!

## Data Interface

The `LoanEmailData` interface has been updated:

```typescript
export interface LoanEmailData {
  type: LoanEmailType;
  recipientEmail: string;
  recipientName: string;
  loanAmount?: number;
  loanType?: string;
  loanId: string;
  applicationDate?: string;
  additionalInfo?: string;
  approvalAmount?: number;
  declineReason?: string;
  
  // NEW FIELDS:
  companyLogo?: string;      // URL to company logo image
  companyName?: string;      // Company name (defaults to "AmeriLend")
}
```

## Example 1: With Logo and Company Name

### Send Email with Branding

```typescript
// In server/routers.ts - adminApprove mutation

await sendLoanStatusEmailEnhanced({
  email: user.email,
  status: "approved",
  loanId: String(application.id),
  recipientName: user.name || "Applicant",
  approvalAmount: input.approvedAmount,
  additionalInfo: `Your approved amount is $${(input.approvedAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}. Please pay the processing fee of $${(processingFeeAmount / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} to proceed.`,
  
  // NEW: Add your branding
  companyLogo: "https://cdn.example.com/logo.png",
  companyName: "MyFinance Inc"
});
```

### Email Output (HTML)

```html
<div class="header">
  <div class="logo-section">
    <img src="https://cdn.example.com/logo.png" alt="MyFinance Inc Logo" style="max-width: 200px; max-height: 60px; margin-bottom: 20px;">
  </div>
  <h1>🎉 Application Approved!</h1>
  <p style="margin: 10px 0 0 0;">Congratulations! Your loan has been approved</p>
</div>

<div class="content">
  <p>Dear John,</p>
  <p>We're thrilled to inform you...</p>
  <p>Best regards,<br><strong>The MyFinance Inc Team</strong></p>
</div>

<div class="footer">
  <p>© 2024 MyFinance Inc. All rights reserved.</p>
</div>
```

## Example 2: Without Logo (Default)

```typescript
// Old code still works - no changes needed
await sendLoanStatusEmailEnhanced({
  email: user.email,
  status: "approved",
  loanId: String(application.id),
  recipientName: user.name || "Applicant",
  approvalAmount: input.approvedAmount,
  additionalInfo: "..."
  
  // No logo/company specified - uses defaults
});
```

### Email Output (Uses Defaults)

```html
<div class="header">
  <h1>🎉 Application Approved!</h1>
  <p style="margin: 10px 0 0 0;">Congratulations! Your loan has been approved</p>
</div>

<div class="content">
  <p>Dear John,</p>
  <p>We're thrilled to inform you...</p>
  <p>Best regards,<br><strong>The AmeriLend Team</strong></p>
</div>

<div class="footer">
  <p>© 2024 AmeriLend. All rights reserved.</p>
</div>
```

## Example 3: Using Environment Variables

### Update .env File

```env
# Email Branding Configuration
COMPANY_LOGO_URL=https://cdn.example.com/my-company-logo.png
COMPANY_NAME=My Lending Company
```

### Modify notification.ts to Use Defaults

```typescript
import { ENV } from "./env";

const DEFAULT_LOGO = ENV.COMPANY_LOGO_URL;
const DEFAULT_COMPANY_NAME = ENV.COMPANY_NAME || "AmeriLend";

export async function sendLoanStatusEmailEnhanced(data: LoanEmailData) {
  // ... existing code ...
  
  // Inject defaults if not provided
  const emailData = {
    ...data,
    companyLogo: data.companyLogo || DEFAULT_LOGO,
    companyName: data.companyName || DEFAULT_COMPANY_NAME,
  };
  
  // Get the appropriate template with branding
  const template = getLoanEmailTemplate(emailData);
  
  // ... send email ...
}
```

### Now All Emails Use Defaults

```typescript
// No need to add logo/company - uses .env values
await sendLoanStatusEmailEnhanced({
  email: user.email,
  status: "approved",
  loanId: String(application.id),
  recipientName: user.name || "Applicant",
  approvalAmount: input.approvedAmount,
  additionalInfo: "..."
  // Automatically uses COMPANY_LOGO_URL and COMPANY_NAME from .env
});
```

## Example 4: Dynamic Logo per Email Type

```typescript
// Different logo for different scenarios
const logos = {
  production: "https://cdn.example.com/logo-production.png",
  staging: "https://cdn.example.com/logo-staging.png",
  development: "http://localhost:3000/logo.png"
};

await sendLoanStatusEmailEnhanced({
  email: user.email,
  status: "approved",
  // ... other fields ...
  companyLogo: logos[process.env.NODE_ENV || "development"],
  companyName: "MyFinance"
});
```

## Example 5: All 4 Email Types with Logo

### Application Submitted

```typescript
await sendLoanStatusEmailEnhanced({
  email: user.email,
  status: "submitted",
  loanId: String(application.id),
  recipientName: user.name,
  loanAmount: input.requestedAmount,
  companyLogo: "https://cdn.example.com/logo.png",
  companyName: "MyFinance"
});
```

**Result**: Blue header with logo + "MyFinance" branding

### Application Approved

```typescript
await sendLoanStatusEmailEnhanced({
  email: user.email,
  status: "approved",
  loanId: String(application.id),
  recipientName: user.name,
  approvalAmount: input.approvedAmount,
  additionalInfo: "Please pay processing fee...",
  companyLogo: "https://cdn.example.com/logo.png",
  companyName: "MyFinance"
});
```

**Result**: Green header with logo + "MyFinance" branding + approval amount

### More Information Requested

```typescript
await sendLoanStatusEmailEnhanced({
  email: user.email,
  status: "more_info",
  loanId: String(application.id),
  recipientName: user.name,
  additionalInfo: "Please provide recent bank statements",
  companyLogo: "https://cdn.example.com/logo.png",
  companyName: "MyFinance"
});
```

**Result**: Orange header with logo + "MyFinance" branding + required documents list

### Application Declined

```typescript
await sendLoanStatusEmailEnhanced({
  email: user.email,
  status: "declined",
  loanId: String(application.id),
  recipientName: user.name,
  declineReason: "Did not meet credit requirements",
  companyLogo: "https://cdn.example.com/logo.png",
  companyName: "MyFinance"
});
```

**Result**: Red header with logo + "MyFinance" branding + decline reason

## Example 6: Conditional Logo Based on Customer

```typescript
// Use different branding per customer/partner
const getCustomerBranding = (userId: number) => {
  const partnerLogos: Record<number, { logo: string; company: string }> = {
    1: { logo: "https://cdn.example.com/partner1-logo.png", company: "Partner 1 Finance" },
    2: { logo: "https://cdn.example.com/partner2-logo.png", company: "Partner 2 Finance" },
  };
  
  return partnerLogos[userId] || {
    logo: "https://cdn.example.com/default-logo.png",
    company: "MyFinance"
  };
};

// Use in email sending
const branding = getCustomerBranding(application.userId);

await sendLoanStatusEmailEnhanced({
  email: user.email,
  status: "approved",
  // ... other fields ...
  companyLogo: branding.logo,
  companyName: branding.company
});
```

## HTML Output Structure

### Email Header (with logo)

```html
<div class="header" style="background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
  <div class="logo-section" style="margin-bottom: 20px;">
    <img src="https://cdn.example.com/logo.png" alt="MyFinance Inc Logo" style="max-width: 200px; max-height: 60px; margin-bottom: 20px;">
  </div>
  <h1 style="margin: 0; font-size: 24px;">🎉 Application Approved!</h1>
  <p style="margin: 10px 0 0 0;">Congratulations! Your loan has been approved</p>
</div>
```

### Email Footer (with company name)

```html
<div class="footer" style="text-align: center; padding: 20px; font-size: 12px; color: #999; border-top: 1px solid #e0e0e0; margin-top: 30px;">
  <p>© 2024 MyFinance Inc. All rights reserved.</p>
</div>
```

## Testing Checklist

- [ ] Logo image is accessible via HTTPS
- [ ] Logo displays correctly in Gmail
- [ ] Logo displays correctly in Outlook
- [ ] Company name appears in header
- [ ] Company name appears in signature
- [ ] Company name appears in footer
- [ ] Email renders on mobile devices
- [ ] Dark mode email rendering looks good
- [ ] Plain text email version includes company name
- [ ] Default behavior works (no logo provided)

## Deployment Checklist

- [ ] Logo hosted on production CDN with HTTPS
- [ ] Update `.env` with production logo URL
- [ ] Update `.env` with production company name
- [ ] Test email delivery to real mailbox
- [ ] Verify rendering in multiple email clients
- [ ] Document logo URL and branding in team wiki
- [ ] Test in production before going live

---

**Implementation**: Complete  
**Files Modified**: `server/_core/loanEmailTemplates.ts`  
**Backward Compatible**: Yes - existing code works unchanged
