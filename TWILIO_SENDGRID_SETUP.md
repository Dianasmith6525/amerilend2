# Twilio & SendGrid Integration Guide

## Overview

AmeriLend now supports **dual-channel OTP verification** using:
- **SendGrid** for email OTP delivery
- **Twilio** for SMS OTP delivery

This provides enhanced security and better user experience with multiple verification options.

---

## 🚀 Quick Start

### 1. SendGrid Setup (Email OTP)

#### Create SendGrid Account
1. Go to [SendGrid.com](https://sendgrid.com/)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

#### Get API Key
1. Navigate to **Settings → API Keys**
2. Click **Create API Key**
3. Name it `AmeriLend OTP`
4. Select **Restricted Access**
5. Grant **Mail Send → Full Access**
6. Click **Create & View**
7. **Copy the API key** (you'll only see it once!)

#### Verify Sender Email
1. Go to **Settings → Sender Authentication**
2. Click **Verify a Single Sender**
3. Fill in your email details:
   - **From Name**: AmeriLend
   - **From Email**: noreply@yourdomain.com
   - **Reply To**: support@yourdomain.com
4. Click **Create**
5. Check your email and click the verification link

#### Add to .env
```bash
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

---

### 2. Twilio Setup (SMS OTP)

#### Create Twilio Account
1. Go to [Twilio.com](https://www.twilio.com/)
2. Sign up for a free trial account
3. Verify your phone number

#### Get Credentials
1. Navigate to **Console Dashboard**
2. Find your **Account SID** and **Auth Token**
3. Copy both values

#### Get Phone Number
1. Go to **Phone Numbers → Manage → Buy a number**
2. Select your country
3. Choose **SMS** capability
4. Purchase a number (free trial includes $15.50 credit)
5. Copy your **Twilio Phone Number**

#### Add to .env
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

---

## 📋 Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# SendGrid Configuration (Email OTP)
SENDGRID_API_KEY=SG.your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Twilio Configuration (SMS OTP)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```

### Phone Number Format

SMS OTP requires phone numbers in **E.164 format**:
- ✅ `+12025551234` (USA)
- ✅ `+442071234567` (UK)
- ✅ `+919876543210` (India)
- ❌ `(202) 555-1234` (Invalid)
- ❌ `202-555-1234` (Invalid)

---

## 🔧 How It Works

### Email OTP Flow

1. User enters email address
2. System generates 6-digit code
3. Code stored in database with 10-minute expiry
4. **SendGrid sends HTML email** with:
   - Large, formatted code
   - Expiry time
   - Security notice
5. User enters code to verify

### SMS OTP Flow

1. User enters phone number
2. System generates 6-digit code
3. Code stored in database with 10-minute expiry
4. **Twilio sends SMS** with code and expiry
5. User enters code to verify

### Fallback Behavior

If SendGrid or Twilio is **not configured**:
- Code will be **logged to console** for development
- Function returns `false` (no error thrown)
- Application continues to work

---

## 🔒 Security Features

### Rate Limiting
- **5 OTP requests** per 15 minutes per IP
- **10 verification attempts** per 15 minutes per IP
- Prevents brute force attacks

### Code Validation
- **6-digit numeric codes** only
- **10-minute expiry** time
- **5 max attempts** per code
- Codes invalidated after use

### Data Protection
- Codes stored hashed in database
- Expired codes auto-cleaned
- No sensitive data in logs (production)

---

## 📧 Email Template

The SendGrid integration sends professional HTML emails:

```html
AmeriLend Verification Code

Your verification code is:
[123456]

This code will expire in 10 minutes.

If you didn't request this code, please ignore this email.
```

### Customization

Edit the email template in `server/_core/notification.ts`:
```typescript
export async function sendEmailOTP(payload: EmailOTPPayload) {
  // Customize HTML template here
}
```

---

## 📱 SMS Template

The Twilio integration sends concise SMS messages:

```
Your AmeriLend verification code is: 123456

Expires in 10 minutes.
```

### Customization

Edit the SMS template in `server/_core/notification.ts`:
```typescript
export async function sendSMSOTP(payload: SMSOTPPayload) {
  // Customize SMS text here
}
```

---

## 🧪 Testing

### Test Email OTP (Development)

If SendGrid is NOT configured, codes log to console:

```
═══════════════════════════════════════
  OTP CODE FOR SIGNUP
═══════════════════════════════════════
  Email: user@example.com
  Code: 123456
  Expires in: 10 minutes
═══════════════════════════════════════
```

### Test SMS OTP (Development)

If Twilio is NOT configured, codes log to console:

```
═══════════════════════════════════════
  SMS OTP CODE FOR LOGIN
═══════════════════════════════════════
  Phone: +12025551234
  Code: 654321
  Expires in: 10 minutes
═══════════════════════════════════════
```

### Test with Real Credentials

1. Add SendGrid and Twilio credentials to `.env`
2. Restart server: `npm run dev`
3. Navigate to `/signup`
4. Enter email or phone number
5. Check email inbox or SMS messages
6. Enter received code

---

## 💰 Pricing

### SendGrid Free Tier
- **100 emails/day** forever free
- No credit card required
- Perfect for development and small apps

### SendGrid Paid Plans
- **Essentials**: $19.95/month - 50K emails
- **Pro**: $89.95/month - 100K emails
- Custom enterprise plans available

### Twilio Free Trial
- **$15.50 free credit** (500+ SMS)
- Trial numbers have limitations
- Must verify recipient phone numbers

### Twilio Paid Plans
- **Pay-as-you-go**: $0.0079/SMS (USA)
- No monthly fees
- Scale automatically
- Custom pricing for high volume

---

## 🚨 Troubleshooting

### SendGrid Issues

**Error: "Unauthorized"**
- Check API key is correct
- Verify API key has **Mail Send** permissions
- Ensure no extra spaces in `.env` file

**Error: "From email not verified"**
- Complete sender verification
- Check spam folder for verification email
- Use exact email address from verification

**Emails not arriving**
- Check spam/junk folder
- Verify SendGrid dashboard for delivery status
- Check daily sending limit (100/day free tier)

### Twilio Issues

**Error: "Invalid credentials"**
- Verify Account SID and Auth Token
- Check for copy-paste errors
- Ensure credentials match trial/production account

**Error: "Invalid phone number"**
- Use E.164 format (+1234567890)
- Include country code
- Remove spaces, dashes, parentheses

**SMS not arriving**
- Trial accounts require verified numbers
- Check Twilio logs in console
- Verify phone number is valid
- Check account balance

---

## 📚 API Reference

### sendEmailOTP()

```typescript
import { sendEmailOTP } from "./server/_core/notification";

await sendEmailOTP({
  to: "user@example.com",
  code: "123456",
  expiryMinutes: 10, // optional, defaults to 15
});
```

### sendSMSOTP()

```typescript
import { sendSMSOTP } from "./server/_core/notification";

await sendSMSOTP({
  to: "+12025551234",
  code: "654321",
  expiryMinutes: 10, // optional, defaults to 15
});
```

---

## 🔐 Production Checklist

Before deploying to production:

- [ ] SendGrid account created and verified
- [ ] Sender email verified in SendGrid
- [ ] SendGrid API key generated (Restricted Access)
- [ ] Twilio account created and phone number purchased
- [ ] Environment variables set in production
- [ ] Test email delivery in production
- [ ] Test SMS delivery in production
- [ ] Monitor SendGrid dashboard for bounces
- [ ] Monitor Twilio console for failed messages
- [ ] Set up billing alerts (both services)
- [ ] Review and accept terms of service
- [ ] Configure webhook endpoints (optional)
- [ ] Enable two-factor auth on both accounts

---

## 📞 Support

### SendGrid Support
- Documentation: https://docs.sendgrid.com/
- Support: https://support.sendgrid.com/
- Status Page: https://status.sendgrid.com/

### Twilio Support
- Documentation: https://www.twilio.com/docs
- Support: https://support.twilio.com/
- Status Page: https://status.twilio.com/

### AmeriLend Issues
- Check server logs for error details
- Verify environment variables are set
- Test with fallback (console logging)
- Contact development team

---

## ✅ Summary

You now have a complete dual-channel OTP verification system:

1. ✅ **SendGrid** sends professional HTML emails
2. ✅ **Twilio** sends SMS to mobile phones
3. ✅ **Fallback** to console logging in development
4. ✅ **Rate limiting** prevents abuse
5. ✅ **Security** with expiry and attempt limits

**Next Steps:**
1. Sign up for SendGrid and Twilio
2. Add credentials to `.env`
3. Restart server
4. Test OTP delivery
5. Deploy to production!
