# 🔍 Application Submission Troubleshooting Guide

## Common Submission Errors

### ❌ Error: "All agreements must be accepted to proceed"

**Problem**: One or more legal agreements weren't checked before submission

**Solution**:
1. Go back to the **Review** step (Step 5)
2. Check all 5 boxes:
   - ✅ Terms of Use
   - ✅ Privacy Policy
   - ✅ Credit Check Authorization
   - ✅ Loan Agreement
   - ✅ E-Signature Consent
3. Click **Submit Application** again

---

### ❌ Error: "An application with this Social Security Number is already being processed"

**Problem**: Your SSN was already used in another application

**Possible Causes**:
- You submitted duplicate applications
- Someone else used your SSN (fraud)
- Your previous application is still processing

**Solution**:
1. **Check your dashboard**: Go to `/dashboard` and look at "My Applications"
2. **Contact support**: Call `945-212-1609`
3. **Verify identity**: Be prepared to provide proof of identity

---

### ❌ Error: "You can only submit one application per 24 hours"

**Problem**: You already submitted an application within the last 24 hours

**Solution**:
- Wait 24 hours before submitting another application
- Check your email for previous submission confirmation
- Go to `/dashboard` to view your existing application

---

### ❌ Error: "The Social Security Number provided is invalid"

**Problem**: The SSN format or pattern is invalid

**Valid SSN patterns**:
- Format: `XXX-XX-XXXX` (e.g., `123-45-6789`)
- Cannot start with: `000`, `666`, or `9`
- Cannot be all same digits: `111-11-1111`
- Cannot be sequential: `123-45-6789`

**Solution**:
1. Re-enter your SSN carefully
2. Double-check for typos
3. Make sure it's formatted as: `###-##-####`

---

### ❌ Error: "The phone number provided is invalid"

**Problem**: Phone number format or pattern is invalid

**Valid phone numbers**:
- Format: `(555) 123-4567` (automatically formatted)
- Must be 10 digits
- Cannot be all same digits: `(555) 555-5555`
- Cannot start with: `0` or `1`
- Area code cannot be `555` (reserved for fictional use)

**Solution**:
1. Enter a valid US phone number
2. Example: `(212) 555-1234` ❌ Invalid (555 area code)
3. Example: `(212) 555-0123` ❌ Invalid (0 in exchange)
4. Example: `(201) 234-5678` ✅ Valid

---

### ❌ Error: "Please use a valid, permanent email address for your application"

**Problem**: Email address is from a temporary/disposable service

**Blocked email providers**:
- tempmail.com
- guerrillamail.com
- mailinator.com
- 10minutemail.com
- throwaway.com
- sharklasers.com
- grr.la
- spam4.me
- temp-mail.org

**Solution**:
1. Use a permanent email (Gmail, Yahoo, Outlook, etc.)
2. Use your work or personal email
3. Do not use temporary email services

---

### ❌ Error: "Your application could not be processed at this time"

**Problem**: Application was flagged with high fraud risk score (>80)

**Common Fraud Flags**:
- ❌ Invalid SSN patterns
- ❌ Unusual age (under 21 or over 85)
- ❌ Zero income or very low income
- ❌ Loan amount much higher than income (>10x monthly)
- ❌ Brief or urgent loan purpose description
- ❌ Recent bankruptcy (within 2 years)
- ❌ Suspicious language ("urgent", "emergency", "desperate")

**Solution**:
1. **Review your application**: Make sure all information is accurate
2. **Be descriptive**: Write a detailed loan purpose (at least 20 characters)
3. **Avoid urgent language**: Don't use words like "urgent", "emergency", "quick"
4. **Verify income**: Make sure monthly income is realistic
5. **Contact support**: `945-212-1609` for manual review

---

## Form Validation Errors

### ❌ "Please enter your full name"

**Solution**: Full name is required (cannot be empty)

---

### ❌ "Please enter your middle initial"

**Solution**: Enter a single letter for middle initial (e.g., `J`)

---

### ❌ "Please enter a valid email address"

**Solution**: Email must be formatted correctly (e.g., `john@example.com`)

---

### ❌ "Please enter a valid phone number (at least 7 characters)"

**Solution**: Phone must have at least 7 digits (will auto-format to (XXX) XXX-XXXX)

---

### ❌ "Please enter your date of birth"

**Solution**: Format: `MM/DD/YYYY` (e.g., `05/10/1990`)

---

### ❌ "You must be at least 18 years old to apply for a loan"

**Solution**: Only applicants 18+ can apply. Enter a valid DOB.

---

### ❌ "SSN must be in format XXX-XX-XXXX"

**Solution**: Format: `123-45-6789` (will auto-format as you type)

---

### ❌ "Invalid SSN - cannot start with 000 or 666"

**Solution**: Use a valid SSN. Invalid patterns start with: `000`, `666`, or `9XX`

---

### ❌ "Please select your government-issued ID type"

**Solution**: Select one of:
- Driver's License
- Passport
- State ID
- Military ID

---

### ❌ "Please enter a valid government-issued ID number"

**Solution**: ID number must be at least 5 characters

---

### ❌ "Please select your marital status"

**Solution**: Select one of:
- Single
- Married
- Divorced
- Widowed
- Domestic Partnership

---

### ❌ "Please enter the number of dependents"

**Solution**: Enter a number (0, 1, 2, etc.)

---

### ❌ "Please select your citizenship status"

**Solution**: Select one of:
- US Citizen
- Permanent Resident

---

### ❌ "Please enter a valid street address"

**Solution**: Street address is required

---

### ❌ "Please enter your city"

**Solution**: City is required

---

### ❌ "Please select a state"

**Solution**: Select your state from the dropdown

---

### ❌ "Please enter a valid zip code (at least 5 characters)"

**Solution**: Zip code must be at least 5 characters (e.g., `10001`)

---

### ❌ "Please select your employment status"

**Solution**: Select one of:
- Employed
- Self-Employed
- Unemployed
- Retired

---

### ❌ "Please enter a valid monthly income"

**Solution**: Monthly income must be a positive number

---

### ❌ "Please select a loan type"

**Solution**: Select a loan type:
- Personal Loan
- Installment Loan
- Short-Term Loan
- Auto Loan
- Home Equity Loan
- HELOC
- Student Loan
- Business Loan
- Debt Consolidation
- Mortgage
- Private Money
- Title Loan
- Credit Builder
- Signature Loan
- Peer-to-Peer

---

### ❌ "Please enter a valid loan amount"

**Solution**: Loan amount must be a positive number between $500 and $100,000

---

### ❌ "Maximum loan amount is $100,000"

**Solution**: Requested amount cannot exceed $100,000

---

### ❌ "Minimum loan amount is $500"

**Solution**: Requested amount must be at least $500

---

### ❌ "Please enter a loan purpose (at least 5 characters)"

**Solution**: Describe the loan purpose in at least 5 characters

---

### ❌ "You must agree to the Terms of Use"

**Solution**: Check the "Terms of Use" checkbox on Step 5

---

### ❌ "You must agree to the Privacy Policy"

**Solution**: Check the "Privacy Policy" checkbox on Step 5

---

### ❌ "You must authorize the credit check"

**Solution**: Check the "Credit Check Authorization" checkbox on Step 5

---

### ❌ "You must agree to the Loan Agreement"

**Solution**: Check the "Loan Agreement" checkbox on Step 5

---

### ❌ "You must agree to E-Signature Consent"

**Solution**: Check the "E-Signature Consent" checkbox on Step 5

---

## Database Connection Issues

### ❌ "Database not available"

**Problem**: Server cannot connect to database

**Check**:
1. Is `DATABASE_URL` environment variable set?
2. Is database server running?
3. Is connection string valid?

**Solution**:
- Contact support: `945-212-1609`
- Check server logs for database error messages

---

## Bankruptcy-Related Errors

### ❌ "Please enter the date of your bankruptcy"

**Problem**: You checked "Filed for bankruptcy" but didn't enter the date

**Solution**:
1. If you haven't filed for bankruptcy: Uncheck the box
2. If you have: Enter the date in format `MM/DD/YYYY`

---

## Advanced Troubleshooting

### Check Your Application Status

1. Go to `/dashboard`
2. Look for "My Applications" section
3. View status of your application:
   - **Submitted**: Application received, waiting for review
   - **Under Review**: We're reviewing your application
   - **Approved**: Your application was approved!
   - **Denied**: Application was denied
   - **Pending Info**: We need more information

---

### View Submission History

1. Go to `/dashboard`
2. Check "My Applications"
3. See all your submitted applications and their statuses

---

### Contact Support

**Phone**: `945-212-1609`  
**Hours**: Monday-Friday, 9 AM - 5 PM EST  
**Email**: Check the footer for contact email

**When calling, have ready**:
- Your email address
- Approximate time of submission attempt
- Error message you received
- SSN (last 4 digits only, for verification)

---

## Fraud Score Explanation

Your application is scored on several factors:

### Fraud Score Breakdown

| Factor | Points | Description |
|--------|--------|-------------|
| SSN Pattern | 0-25 | Invalid patterns (000, 666, 9xx) |
| Age | 0-10 | Under 21 or over 85 |
| Income | 0-20 | Zero or very low income |
| Loan-to-Income Ratio | 0-20 | Loan amount vs monthly income |
| Loan Purpose | 0-15 | Vague or suspicious description |
| Bankruptcy | 0-20 | Recent bankruptcy |

**Fraud Score**:
- **0-30**: Low risk ✅ (Approved)
- **30-60**: Medium risk ⚠️ (Manual review)
- **60-80**: High risk ⚠️ (Manual review + conditions)
- **>80**: Very high risk ❌ (Denied)

---

## Testing Your Form

### Use Valid Test Data

```
Full Name: John Doe
Middle Initial: Q
Email: john@example.com
Phone: (201) 234-5678
DOB: 05/10/1985 (must be 18+)
SSN: 123-45-6789
ID Type: Driver's License
ID Number: ABC123456789
Marital Status: Single
Dependents: 0
Citizenship: US Citizen
Prior Bankruptcy: No

Street: 123 Main Street
City: New York
State: NY
Zip: 10001

Employment: Employed
Employer: Tech Corp
Monthly Income: $5,000

Loan Type: Personal Loan
Requested Amount: $10,000
Loan Purpose: To consolidate existing debts and reduce monthly payments
```

---

**Last Updated**: November 4, 2025  
**Support**: `945-212-1609`
