# Authorize.net Integration Guide

This guide explains how to set up and use the Authorize.net payment processor in AmeriLend.

## Overview

AmeriLend uses **Authorize.net Accept.js** for secure credit card processing. This implementation:
- ✅ Tokenizes card data on the client side (PCI DSS compliant)
- ✅ Never sends raw card numbers to your server
- ✅ Processes payments in real-time
- ✅ Supports webhook notifications for payment status
- ✅ Handles both sandbox and production environments

## Setup Instructions

### 1. Create Authorize.net Account

1. Go to [https://www.authorize.net](https://www.authorize.net)
2. Sign up for a merchant account
3. For testing, use the **sandbox account**: [https://sandbox.authorize.net](https://sandbox.authorize.net)

### 2. Get API Credentials

Login to your Authorize.net account and navigate to:

**Account → Settings → Security Settings → API Credentials & Keys**

You'll need to obtain:

1. **API Login ID** - Your merchant API login ID
2. **Transaction Key** - Generate a new transaction key
3. **Public Client Key** - For Accept.js (frontend)
4. **Signature Key** - For webhook validation

### 3. Configure Environment Variables

Add these to your `.env` file:

```bash
# Authorize.net Configuration
AUTHORIZENET_API_LOGIN_ID=your_api_login_id
AUTHORIZENET_TRANSACTION_KEY=your_transaction_key
AUTHORIZENET_CLIENT_KEY=your_public_client_key
AUTHORIZENET_SIGNATURE_KEY=your_webhook_signature_key
AUTHORIZENET_ENVIRONMENT=sandbox  # or "production"
```

### 4. Enable Accept.js

In the Authorize.net merchant interface:

1. Go to **Account → Settings → Security Settings**
2. Find **Accept.js** section
3. Enable Accept.js for your account
4. Copy the **Public Client Key**

### 5. Set Up Webhooks (Production)

To receive real-time payment notifications:

1. Go to **Account → Settings → Webhooks**
2. Add a new webhook endpoint:
   ```
   https://yourdomain.com/api/webhooks/authorizenet
   ```
3. Select events to listen for:
   - `net.authorize.payment.authorization.created`
   - `net.authorize.payment.authcapture.created`
   - `net.authorize.payment.capture.created`
   - `net.authorize.payment.void.created`
   - `net.authorize.payment.refund.created`
4. Copy the **Signature Key** to your `.env` file

## Testing

### Test Card Numbers (Sandbox Only)

Authorize.net provides test cards for sandbox testing:

| Card Type | Card Number      | CVV | Notes                    |
|-----------|------------------|-----|--------------------------|
| Visa      | 4111111111111111 | 123 | Successful transaction   |
| MasterCard| 5424000000000015 | 123 | Successful transaction   |
| Amex      | 370000000000002  | 1234| Successful transaction   |
| Discover  | 6011000000000012 | 123 | Successful transaction   |

**Test Scenarios:**
- Use any future expiry date (e.g., 12/25)
- Use any valid CVV (3 digits for Visa/MC, 4 for Amex)
- Amount < $100 will succeed
- Amount >= $100 will trigger specific responses

### Test Error Scenarios

To test specific error conditions, use these amounts in sandbox:

| Amount  | Result                        |
|---------|-------------------------------|
| $1.00   | Approved                      |
| $2.00   | Declined                      |
| $3.00   | Error                         |
| $4.00   | Held for Review               |

## How It Works

### Payment Flow

```
┌─────────────┐
│   User      │
│  Dashboard  │
└──────┬──────┘
       │ 1. Click "Pay Processing Fee"
       ▼
┌─────────────────────┐
│  Payment Page       │
│  /payment/:id       │
└──────┬──────────────┘
       │ 2. Load Accept.js script
       │ 3. Enter card details
       ▼
┌─────────────────────┐
│   Accept.js         │
│ (Client-Side)       │
└──────┬──────────────┘
       │ 4. Tokenize card data
       │ 5. Return opaqueData token
       ▼
┌─────────────────────┐
│  tRPC Endpoint      │
│ processCardPayment  │
└──────┬──────────────┘
       │ 6. Send token to Authorize.net API
       │ 7. Charge the card
       ▼
┌─────────────────────┐
│  Authorize.net API  │
└──────┬──────────────┘
       │ 8. Return transaction result
       ▼
┌─────────────────────┐
│  Database           │
│  - Update payment   │
│  - Update loan      │
└─────────────────────┘
```

### Frontend Implementation

The payment page (`client/src/pages/AuthorizeNetPayment.tsx`) handles:

1. **Loading Accept.js**: Dynamically loads the Accept.js library based on environment
2. **Card Form**: Collects card number, expiry, and CVV
3. **Tokenization**: Calls `Accept.dispatchData()` to tokenize card details
4. **Submission**: Sends the opaque token to your backend

### Backend Implementation

The backend (`server/routers.ts` → `processCardPayment`) handles:

1. **Validation**: Checks loan status and authorization
2. **Processing**: Calls `createAuthorizeNetTransaction()` with the token
3. **Recording**: Saves payment record with transaction ID
4. **Status Update**: Updates loan status to "fee_paid"

## API Endpoints

### Get Configuration

```typescript
trpc.payments.getAuthorizeNetConfig.useQuery()
```

Returns:
```json
{
  "apiLoginId": "your_api_login_id",
  "clientKey": "your_public_client_key",
  "environment": "sandbox"
}
```

### Process Card Payment

```typescript
trpc.payments.processCardPayment.useMutation({
  loanApplicationId: 123,
  opaqueData: {
    dataDescriptor: "COMMON.ACCEPT.INAPP.PAYMENT",
    dataValue: "eyJjb2RlIjoiNTBfMl8wNjAwMDUyOTE..."
  }
})
```

Returns:
```json
{
  "success": true,
  "paymentId": 456,
  "transactionId": "60198765432",
  "authCode": "ABC123"
}
```

## Security Features

### PCI DSS Compliance

✅ **Card data never touches your server**
- Accept.js tokenizes card data in the browser
- Only the token is sent to your backend
- Reduces PCI compliance scope

✅ **SSL/TLS Required**
- All communication encrypted
- Accept.js requires HTTPS in production

✅ **Webhook Signature Validation**
- HMAC-SHA512 signature verification
- Prevents webhook spoofing

### Implementation Details

```typescript
// Card tokenization (client-side)
window.Accept.dispatchData(secureData, callback);

// Server never sees raw card data
processCardPayment({
  opaqueData: { /* tokenized data */ }
});

// Webhook validation
validateAuthorizeNetWebhook(signature, payload, signatureKey);
```

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Card validation failed" | Invalid card number or expired | Check card details |
| "Payment configuration not loaded" | Missing API credentials | Check `.env` file |
| "Insufficient funds" | Declined by bank | Use different card |
| "Transaction failed" | Network or API error | Retry or contact support |

### Error Response Format

```typescript
{
  success: false,
  error: "Detailed error message from Authorize.net"
}
```

## Production Checklist

Before going live with Authorize.net:

- [ ] Switch `AUTHORIZENET_ENVIRONMENT` to `production`
- [ ] Update API credentials with production keys
- [ ] Configure production webhook endpoint
- [ ] Enable HTTPS/SSL on your domain
- [ ] Test with real cards (use small amounts)
- [ ] Set up transaction monitoring
- [ ] Configure email notifications
- [ ] Review settlement schedule
- [ ] Verify PCI compliance requirements
- [ ] Test refund/void procedures

## Monitoring & Reporting

### Transaction Dashboard

View transactions in Authorize.net dashboard:
1. Login to merchant interface
2. Navigate to **Home → Unsettled Transactions**
3. Filter by date, status, or amount

### Webhook Logs

Monitor webhook delivery:
1. Go to **Account → Settings → Webhooks**
2. Click on your webhook endpoint
3. View delivery history and retry attempts

## Support & Resources

- **Authorize.net Developer Center**: [https://developer.authorize.net](https://developer.authorize.net)
- **Accept.js Documentation**: [https://developer.authorize.net/api/reference/features/acceptjs.html](https://developer.authorize.net/api/reference/features/acceptjs.html)
- **Sandbox Login**: [https://sandbox.authorize.net](https://sandbox.authorize.net)
- **Support**: 1-877-447-3938 (Mon-Fri, 6am-6pm PST)

## Troubleshooting

### Accept.js Not Loading

```javascript
// Check if script loaded
if (!window.Accept) {
  console.error("Accept.js failed to load");
}

// Verify environment
console.log("Using environment:", config.environment);
```

### Payment Fails Silently

Check browser console for errors:
```javascript
window.Accept.dispatchData(secureData, (response) => {
  console.log("Accept.js response:", response);
  if (response.messages.resultCode === "Error") {
    console.error("Error:", response.messages.message);
  }
});
```

### Webhook Not Receiving Events

1. Check webhook URL is publicly accessible
2. Verify signature key matches
3. Check webhook event selection
4. Review webhook logs in merchant interface

---

**Last Updated**: November 2, 2025  
**Integration Status**: ✅ Complete & Production Ready
