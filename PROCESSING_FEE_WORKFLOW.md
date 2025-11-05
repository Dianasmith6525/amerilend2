# AmeriLend Processing Fee Workflow

## Overview

**YES - Processing fees ARE asked AFTER the loan is approved.**

The processing fee payment is a critical part of the loan approval workflow and must be completed before funds can be disbursed to the borrower.

## Loan Status Workflow

```
Application Submitted
        ↓
    PENDING
        ↓
  UNDER_REVIEW
        ↓
    APPROVED ← Admin approves with amount
        ↓
   FEE_PENDING ← User initiates payment (clicks "Pay Processing Fee")
        ↓
    FEE_PAID ← Payment confirmed/succeeded
        ↓
   DISBURSED ← Admin triggers disbursement (after fee is paid)
```

## Step-by-Step Flow

### 1. **Loan Approval (Admin Action)**
   - Admin reviews the loan application
   - Admin approves the loan with an `approvedAmount`
   - System automatically **calculates the processing fee** based on fee configuration:
     - **Percentage Mode**: Fee = (Approved Amount × Percentage Rate) / 10,000
     - **Fixed Mode**: Fee = Fixed Amount (typically $5.75)
   - Loan status changes to `"approved"`
   - Processing fee amount is stored in the database

### 2. **Payment Initiation (User Action)**
   - Borrower is notified of approval via email
   - Borrower logs into dashboard and sees **"Pay Processing Fee"** button
   - Borrower clicks button to initiate payment
   - A payment record is created with status `"pending"`
   - Loan status changes to `"fee_pending"`

### 3. **Payment Processing**
   - Borrower completes payment using one of these methods:
     - **Credit/Debit Card** (Visa, Mastercard, American Express, Discover)
     - **Cryptocurrency** (Bitcoin, Ethereum, USDT, USDC)
   - Payment is processed through:
     - **Authorize.net** (primary for card payments)
     - **Crypto Payment Provider** (for cryptocurrency)
   - System receives payment confirmation via webhook or direct callback

### 4. **Payment Confirmation**
   - Payment record status updates to `"succeeded"`
   - Loan status changes to `"fee_paid"`
   - Borrower receives payment confirmation email
   - Processing fee is marked as **non-refundable**

### 5. **Disbursement (Admin Action)**
   - Admin can now initiate loan disbursement
   - **Critical Validation**: System verifies:
     ✅ Loan status is `"fee_paid"`
     ✅ Processing fee was actually paid (payment record exists)
     ✅ Processing fee amount is valid
   - If all validations pass, funds are disbursed to borrower
   - Loan status changes to `"disbursed"`

## Key Points

### Processing Fee Details
- **Timing**: Asked AFTER loan approval, BEFORE disbursement
- **Refundable**: NO - Processing fees are non-refundable
- **Amount**: Configured by admin (percentage 1.5%-2.5% OR fixed $5.75)
- **Covers**: Administrative costs, underwriting, and processing services

### Payment Methods Accepted
1. **Card Payments**
   - Credit cards
   - Debit cards
   - Processed via Authorize.net

2. **Cryptocurrency**
   - Bitcoin (BTC)
   - Ethereum (ETH)
   - USDT (stablecoin)
   - USDC (stablecoin)

### Critical Business Rules

**Rule #1**: No disbursement without fee payment
```
if (application.status !== "fee_paid") {
  ❌ Disbursement BLOCKED
  ❌ Error: "Processing fee must be paid before disbursement"
}
```

**Rule #2**: Payment only available for approved loans
```
if (application.status !== "approved") {
  ❌ Payment initiation BLOCKED
  ❌ Error: "Loan must be approved before payment"
}
```

**Rule #3**: Fee amount must be calculated
```
if (!application.processingFeeAmount) {
  ❌ Payment cannot be initiated
  ❌ Error: "Processing fee not calculated"
}
```

## Customer Communication

### Approval Email
When a loan is approved, the customer receives:
- Loan approval notification
- Approved amount
- Processing fee amount
- Instructions to pay the processing fee

### Payment Flow
1. Customer logs in → Sees "Pay Processing Fee" button
2. Customer clicks → Payment page opens
3. Customer enters payment details → Payment submitted
4. Payment confirmed → Dashboard updates with "Fee Paid" status
5. Customer sees → Ready for disbursement message

### Timeline Example

```
Day 1: Customer applies for $5,000 loan
Day 2: Admin approves → Fee calculated ($100 for 2% fee)
Day 2: Customer receives approval email with fee amount
Day 2-3: Customer pays $100 processing fee
Day 3: Payment confirmed → Status: "fee_paid"
Day 3-5: Admin initiates disbursement
Day 5: Funds transferred to customer account
```

## Fee Configuration (Admin Settings)

### Percentage Mode (Default)
```typescript
calculationMode: "percentage"
percentageRate: 200  // Basis points (200 = 2.00%)
// Example: $5,000 loan → $100 fee
```

### Fixed Mode Alternative
```typescript
calculationMode: "fixed"
fixedFeeAmount: 575  // In cents ($5.75)
// Example: $500 loan → $5.75 fee
// Example: $100,000 loan → $5.75 fee (same)
```

## Related API Endpoints

### User Endpoints
- `loans.approve` - ❌ User CANNOT approve (admin only)
- `payments.createIntent` - ✅ Create payment for fee (requires `approved` status)
- `payments.confirmPayment` - ✅ Confirm payment received

### Admin Endpoints
- `loans.adminApprove` - ✅ Admin approves + calculates fee
- `loans.adminDisburst` - ✅ Admin initiates disbursement (validates fee_paid)
- `fees.setConfiguration` - ✅ Admin configures fee rules

## Security & Validation

### Payment Security
✅ SSL/TLS encryption for card data  
✅ PCI compliance via Authorize.net  
✅ Cryptocurrency payments validated on-chain  
✅ Payment verification before status update  

### Business Logic Validation
✅ Fee only collected after approval  
✅ Fee payment verified before disbursement  
✅ Non-refundable fee protection  
✅ Audit trail of all transactions  

## Summary Table

| Phase | Action | Who | Status Before | Status After | Fee Amount |
|-------|--------|-----|---------------|--------------|-----------|
| Approval | Admin approves | Admin | `pending` | `approved` | Calculated |
| Payment Init | Request payment | Customer | `approved` | `fee_pending` | Same |
| Payment Process | Process payment | Payment Gateway | `fee_pending` | `fee_pending` | Same |
| Payment Confirm | Confirm payment | System/Webhook | `fee_pending` | `fee_paid` | Same |
| Disbursement | Initiate disbursement | Admin | `fee_paid` | `disbursed` | Paid |

---

**Last Updated**: November 4, 2025
