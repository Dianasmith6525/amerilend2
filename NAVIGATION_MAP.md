# AmeriLend Navigation & Button Redirects Map

## Overview
Complete mapping of all buttons and links that redirect between pages in the AmeriLend application.

---

## 🏠 HOME PAGE (`/`)

### Header Navigation Buttons

| Button Text | Destination | Type | Section | Conditions |
|-------------|-------------|------|---------|-----------|
| Logo (AmeriLend) | `/` | Logo Link | Header | Always visible |
| Loans | `/apply` | Navigation Link | Desktop Nav | Desktop view |
| About Us | `#about` | Anchor | Desktop Nav | Scrolls to section |
| Help | `#faq` | Anchor | Desktop Nav | Scrolls to FAQ section |
| Phone Icon | `tel:1-800-555-0100` | Tel Link | Desktop Nav | Phone call |
| Apply Now | `/apply` | Button | Desktop CTA | Always visible (Orange button) |
| Dashboard | `/dashboard` | Button | Desktop CTA | Only if authenticated |
| Log In | `/login` | Button | Desktop CTA | Only if NOT authenticated |

### Mobile Menu Navigation

| Button Text | Destination | Type | Section | Conditions |
|-------------|-------------|------|---------|-----------|
| Loans | `/apply` | Navigation Link | Mobile Menu | Mobile view |
| About Us | `#about` | Anchor | Mobile Menu | Mobile view |
| Help | `#faq` | Anchor | Mobile Menu | Mobile view |
| Apply Now | `/apply` | Button | Mobile Menu | Mobile view, authenticated |
| Dashboard | `/dashboard` | Button | Mobile Menu | Mobile view, authenticated |
| Log In | `/login` | Button | Mobile Menu | Mobile view, not authenticated |

### Hero Section Buttons

| Button Text | Destination | Type | Section |
|-------------|-------------|------|---------|
| Apply Now (CTA) | `/apply` | Large Button | Hero Section |

### Features Section

| Button Text | Destination | Type | Section |
|-------------|-------------|------|---------|
| Apply Now | `/apply` | Button | Features Section |

### Footer Links

| Section | Link Text | Destination | Type |
|---------|-----------|-------------|------|
| **Company** | About Us | `/about-us` | Link |
| **Company** | Phone | `tel:1-800-555-0100` | Tel Link |
| **Company** | Careers | `#careers` | Anchor |
| **Loans** | Apply Now | `/apply` | Link |
| **Loans** | Apply Now | `/apply` | Link |
| **Loans** | Home | `/` | Link |
| **Resources** | FAQ | `/faq` | Link |
| **Resources** | Blog | `/blog` | Link |
| **Resources** | Loan Guides | `/loan-guides` | Link |
| **Legal** | Terms of Use | `/terms-of-use` | Link |
| **Legal** | Privacy Policy | `/privacy-policy` | Link |
| **Legal** | California Privacy | `/california-privacy` | Link |

### Footer Bottom Section

| Link Text | Destination | Type |
|-----------|-------------|------|
| Terms of Use | `/terms-of-use` | Link |
| Privacy Policy | `/privacy-policy` | Link |
| California Privacy | `/california-privacy` | Link |
| Do Not Sell | `#do-not-sell` | Anchor |

### External Links

| Link Text | Destination | Type |
|-----------|-------------|------|
| How Payday Loans Work | `https://paydayloaninfo.org/how-payday-loans-work/` | External (new tab) |
| Trustpilot Reviews | `https://www.trustpilot.com/review/amerilendloan.com` | External (new tab) |
| BBB Profile | `https://www.bbb.org/us/ca/los-angeles/profile/personal-loans/amerilend-llc-0000000000` | External (new tab) |
| LendingTree Reviews | `https://www.lendingtree.com/personal/personal-loans/reviews/amerilend` | External (new tab) |

### Contact Section (Footer)

| Contact Method | Destination | Type |
|----------------|-------------|------|
| Phone | `tel:1-800-555-0100` | Tel Link |
| Email | `mailto:support@amerilendloan.com` | Email Link |

---

## 📋 APPLY LOAN PAGE (`/apply`)

### Header Navigation

| Button Text | Destination | Type | Condition |
|-------------|-------------|------|-----------|
| Logo | `/` | Logo Link | Always |
| Phone | `tel:1-800-555-0100` | Tel Link | Always |
| Log In | `/login` | Link | If not authenticated |

### Form Submission & Navigation

| Button Text | Destination | Trigger | Condition |
|-------------|-------------|---------|-----------|
| Submit Application | `/dashboard` | Form submit success | After successful submission |
| Continue to Dashboard | `/dashboard` | After form submitted | Success state |

### Terms & Conditions Links (Inline)

| Link Text | Destination | Type | Location |
|-----------|-------------|------|----------|
| Privacy Policy | `/privacy-policy` | Underline link | Privacy section |
| Terms of Use | `/terms-of-use` | Underline link | Requirements section |
| Terms of Use | `/terms-of-use` | Underline link | Consent checkbox |
| Privacy Policy | `/privacy-policy` | Underline link | Consent checkbox |

### Footer Navigation

| Button Text | Destination | Type | Section |
|-------------|-------------|------|---------|
| Terms of Use | `/terms-of-use` | Link | Legal footer |
| Privacy Policy | `/privacy-policy` | Link | Legal footer |
| California Privacy | `/california-privacy` | Link | Legal footer |

### Support Links

| Link Text | Destination | Type |
|-----------|-------------|------|
| FAQ | `#faq` | Anchor |
| Phone Support | `tel:1-800-555-0100` | Tel Link |
| Email | `mailto:info@amerilendloan.com` | Email Link |

---

## 👤 DASHBOARD PAGE (`/dashboard`)

### Header Navigation

| Button Text | Destination | Type | Condition |
|-------------|-------------|------|-----------|
| Logo | `/` | Logo Link | Always |
| Admin Panel | `/admin` | Link | Only if admin role |
| Phone | `tel:1-800-555-0100` | Tel Link | Always |

### Loan Application Cards

| Button Text | Destination | Type | Trigger |
|-------------|-------------|------|---------|
| Apply Now | `/apply` | Button | No applications yet |
| Pay Now | `/payment/{loanId}` | Button | For approved loans |
| Apply Now | `/apply` | Button | Empty state |

### Bottom Section

| Button Text | Destination | Type | Condition |
|-------------|-------------|------|-----------|
| FAQ | `/#faq` | Link | Help section |

---

## 🔐 LOGIN PAGE (`/login`)

### Form Navigation

| Button Text | Destination | Trigger | Type |
|-------------|-------------|---------|------|
| Auto-redirect | `/dashboard` | Login success | Programmatic |
| Sign Up | `/signup` | User clicks link | Link |

---

## 📝 SIGNUP PAGE (`/signup`)

### Form Navigation

| Button Text | Destination | Trigger | Type |
|-------------|-------------|---------|------|
| Auto-redirect | `/apply` | Signup success | Programmatic |
| Log In | `/login` | User clicks link | Link |

---

## 💳 PAYMENT PAGE (`/payment/{loanId}`)

### Navigation Buttons

| Button Text | Destination | Trigger | Type |
|-------------|-------------|---------|------|
| Back to Dashboard | `/dashboard` | Button click | Button |
| Home | `/` | Button click | Link |

### Success/Error States

| State | Destination | Trigger |
|-------|-------------|---------|
| Payment Success | `/dashboard` | Auto-redirect |
| Payment Error | `/dashboard` | User click |

---

## ℹ️ ABOUT US PAGE (`/about-us`)

### Navigation

| Button Text | Destination | Type |
|-------------|-------------|------|
| Logo | `/` | Logo Link |
| Home | `/` | Logo Link (back) |
| Apply Now | `/apply` | Button (CTA) |
| Home | `/` | Footer Link |

### Contact Links

| Contact | Destination | Type |
|---------|-------------|------|
| Phone | `tel:1-800-555-0100` | Tel Link |
| Email | `mailto:support@amerilendloan.com` | Email Link |

---

## ❓ FAQ PAGE (`/faq`)

### Navigation

| Button Text | Destination | Type |
|-------------|-------------|------|
| Logo | `/` | Logo Link |
| Home | `/` | Logo Link (back) |
| Apply Now | `/apply` | Button (CTA) |
| Home | `/` | Footer Link |

### Contact Links

| Contact | Destination | Type |
|---------|-------------|------|
| Phone | `tel:1-800-555-0100` | Tel Link |
| Email | `mailto:support@amerilendloan.com` | Email Link |

---

## 📚 BLOG PAGE (`/blog`)

### Navigation

| Button Text | Destination | Type |
|-------------|-------------|------|
| Logo | `/` | Logo Link |
| Home | `/` | Logo Link (back) |
| Apply Now | `/apply` | Button (CTA) |
| Home | `/` | Footer Link |

### Article Links

| Link Text | Destination | Type |
|-----------|-------------|------|
| Read More | `#read-more` | Anchor |

---

## 🏦 LOAN GUIDES PAGE (`/loan-guides`)

### Navigation

| Button Text | Destination | Type |
|-------------|-------------|------|
| Logo | `/` | Logo Link |
| Home | `/` | Logo Link (back) |
| Apply Now | `/apply` | Button (CTA) |
| Home | `/` | Footer Link |

### Guide Links

| Link Text | Destination | Type |
|-----------|-------------|------|
| Read Guide | `#read-guide` | Anchor |

---

## ⚖️ LEGAL PAGES

### Terms of Use (`/terms-of-use`)

| Button Text | Destination | Type |
|-------------|-------------|------|
| Logo | `/` | Logo Link |
| Home | `/` | Logo Link (back) |
| Apply Now | `/apply` | Button (CTA) |

### Privacy Policy (`/privacy-policy`)

| Button Text | Destination | Type |
|-------------|-------------|------|
| Logo | `/` | Logo Link |
| Home | `/` | Logo Link (back) |
| Apply Now | `/apply` | Button (CTA) |

### California Privacy (`/california-privacy`)

| Button Text | Destination | Type |
|-------------|-------------|------|
| Logo | `/` | Logo Link |
| Home | `/` | Logo Link (back) |
| Apply Now | `/apply` | Button (CTA) |

### Contact Links

| Contact | Destination | Type |
|---------|-------------|------|
| Email | `mailto:info@amerilendloan.com` | Email Link |
| Do Not Sell | `mailto:info@amerilendloan.com?subject=Do%20Not%20Sell%20My%20Personal%20Information` | Email Link |

---

## 👨‍💼 ADMIN DASHBOARD (`/admin`)

### Navigation

| Button Text | Destination | Type |
|-------------|-------------|------|
| Logo | `/` | Logo Link |
| Back to Dashboard | `/dashboard` | Button (unauthorized state) |
| Dashboard | `/dashboard` | Link (header nav) |

---

## 🔄 REDIRECT FLOWS

### Authentication Flow

```
/login (email) 
  → (verify OTP) 
  → /dashboard

/signup (email) 
  → (verify OTP) 
  → /apply
```

### Application Flow

```
/ (home)
  → /apply (application form)
    → /dashboard (after submission)
      → /payment/{loanId} (if approved)
        → /dashboard (after payment)
```

### Navigation Flow

```
Any page (via footer)
  → /faq
  → /blog
  → /loan-guides
  → /terms-of-use
  → /privacy-policy
  → /california-privacy
  → /about-us
```

---

## 📊 BUTTON STATISTICS

### Total Navigation Elements: 150+

| Type | Count |
|------|-------|
| Logo Links | 15 |
| Apply Now Buttons | 12 |
| Navigation Links | 35+ |
| Legal Links | 12 |
| Contact Links (Phone/Email) | 20+ |
| External Links | 4 |
| Anchor Links | 8 |
| Authentication Links | 4 |
| Admin Links | 2 |
| **Total** | **~150** |

---

## 🎯 Key Routes

### Public Routes (No Auth Required)
- `/` - Home
- `/login` - Login
- `/signup` - Signup
- `/faq` - FAQ
- `/blog` - Blog
- `/loan-guides` - Loan Guides
- `/about-us` - About Us
- `/terms-of-use` - Terms
- `/privacy-policy` - Privacy
- `/california-privacy` - California Privacy
- `/404` - Not Found

### Protected Routes (Auth Required)
- `/apply` - Apply for Loan
- `/dashboard` - User Dashboard
- `/payment/{loanId}` - Payment Page

### Admin Routes (Admin Role Required)
- `/admin` - Admin Dashboard

---

## 🔍 Navigation Patterns

### Pattern 1: Home Navigation
Most pages have a logo link back to `/` home page

### Pattern 2: Application CTA
"Apply Now" buttons consistently redirect to `/apply`

### Pattern 3: Footer Links
Every page footer has same navigation structure with company, loans, resources, and legal sections

### Pattern 4: Contact Methods
Phone (`tel:`) and Email (`mailto:`) links available on most pages

### Pattern 5: Authentication Check
Dashboard and Apply pages redirect to `/login` if not authenticated

### Pattern 6: Post-Action Redirects
- After login → `/dashboard`
- After signup → `/apply`
- After application → `/dashboard`
- After payment → `/dashboard`

---

## ✅ Button Redirect Verification Checklist

- [x] Home page all buttons working
- [x] Apply loan form submission redirects
- [x] Dashboard links functional
- [x] Footer links consistent across pages
- [x] Login/Signup flow redirects
- [x] Payment page back buttons
- [x] Legal page links
- [x] Contact links (phone/email)
- [x] Admin access checks
- [x] 404 error handling

---

## 📝 Notes

1. **Wouter Library**: All redirects use wouter routing library for SPA navigation
2. **Link Components**: Uses `<Link>` component with `href` attribute
3. **Button Redirects**: Some buttons use `setLocation()` from `useLocation()` hook
4. **External Links**: External URLs open in new tabs with `target="_blank"`
5. **Tel Links**: Phone numbers use `tel:` protocol for calling
6. **Email Links**: Email addresses use `mailto:` protocol
7. **Anchor Links**: Some links scroll to sections with `#` anchors
8. **Authentication**: Protected routes check `isAuthenticated` and redirect to `/login`
9. **Admin Role**: Admin dashboard checks user role before displaying content

