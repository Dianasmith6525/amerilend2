# Design System Integration Examples

## 📋 Table of Contents
1. [App-Level Integration](#app-level-integration)
2. [Page-by-Page Examples](#page-by-page-examples)
3. [Component Combinations](#component-combinations)
4. [Common Patterns](#common-patterns)
5. [Troubleshooting](#troubleshooting)

---

## App-Level Integration

### Global Setup in `App.tsx`

```tsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AccessibilityPanel } from '@/components/AccessibilityFeatures';
import { SkipToMainContent } from '@/components/AccessibilityFeatures';
import Home from '@/pages/Home';
import Dashboard from '@/pages/Dashboard';
import AdminPanel from '@/pages/AdminPanel';
import StripePayment from '@/pages/StripePayment';

export function App() {
  return (
    <BrowserRouter>
      {/* Accessibility Features (Global) */}
      <SkipToMainContent target="#main-content" />
      <AccessibilityPanel />

      {/* Main Application Routes */}
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/payment" element={<StripePayment />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
```

---

## Page-by-Page Examples

### Home Page with Hero

```tsx
// client/src/pages/Home.tsx
import React from 'react';
import { AnimatedHeroSection } from '@/components/AnimatedHeroSection';
import { useState } from 'react';

export default function Home() {
  const [isApplying, setIsApplying] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <AnimatedHeroSection />

      {/* Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 fade-in-up">
          Why Choose Amerilend?
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: '⚡',
              title: 'Fast Approval',
              description: 'Get approved in minutes, not days'
            },
            {
              icon: '💰',
              title: 'Best Rates',
              description: 'Competitive rates tailored to you'
            },
            {
              icon: '🔒',
              title: 'Secure',
              description: 'Bank-level encryption for your data'
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="p-6 bg-gray-50 rounded-lg border border-gray-200 fade-in-up hover:shadow-lg transition-shadow"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-2xl mx-auto text-center fade-in-up">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-8 text-blue-100">
            Join thousands of satisfied customers who've gotten their loans approved
          </p>
          <button
            onClick={() => setIsApplying(true)}
            className="px-8 py-3 bg-white text-blue-600 font-bold rounded-lg hover-lift transition-transform"
          >
            Apply Now
          </button>
        </div>
      </section>
    </div>
  );
}
```

### Dashboard with Analytics

```tsx
// client/src/pages/Dashboard.tsx
import React from 'react';
import { AdminDashboardEnhanced } from '@/components/AdminDashboardEnhanced';
import { useQuery } from '@tanstack/react-query';
import { AnimatedSpinner } from '@/components/AnimatedLoadingStates';
import { trpc } from '@/lib/trpc';

export default function Dashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      // Fetch dashboard data from tRPC
      return trpc.admin.getDashboardStats.query();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <AnimatedSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <AdminDashboardEnhanced />
    </div>
  );
}
```

### Payment Page with Flow

```tsx
// client/src/pages/StripePayment.tsx
import React, { useState } from 'react';
import { AnimatedPaymentFlow } from '@/components/AnimatedPaymentFlow';
import { A11yButton } from '@/components/AccessibilityFeatures';
import { useEffect } from 'react';

export default function StripePayment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    setPaymentStatus('processing');

    try {
      // Call tRPC endpoint to process payment
      const response = await fetch('/api/trpc/payments.processStripePayment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 40005.75,
          paymentMethodId: 'pm_test_visa',
        }),
      });

      if (response.ok) {
        setPaymentStatus('success');
        setCurrentStep(4); // Final step
      } else {
        setPaymentStatus('error');
      }
    } catch (error) {
      setPaymentStatus('error');
      console.error('Payment failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 fade-in-up">
          Complete Your Payment
        </h1>

        <AnimatedPaymentFlow />

        {/* Payment Actions */}
        <div className="mt-8 flex gap-4">
          <A11yButton
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            ariaLabel="Go to previous step"
          >
            ← Back
          </A11yButton>

          {currentStep < 3 && (
            <A11yButton
              onClick={() => setCurrentStep(currentStep + 1)}
              ariaLabel="Go to next step"
            >
              Next →
            </A11yButton>
          )}

          {currentStep === 3 && (
            <A11yButton
              onClick={handleProcessPayment}
              disabled={isProcessing}
              ariaLabel="Process payment"
            >
              {isProcessing ? 'Processing...' : 'Complete Payment'}
            </A11yButton>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Component Combinations

### Hero + Feature Cards + CTA

```tsx
import { AnimatedHeroSection } from '@/components/AnimatedHeroSection';
import { SuccessCheck } from '@/components/AnimatedLoadingStates';

export function HomepageComplete() {
  return (
    <>
      {/* Hero */}
      <AnimatedHeroSection />

      {/* Features Grid */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-lg border border-gray-200 fade-in-up hover:shadow-lg"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <SuccessCheck />
                <div>
                  <h3 className="font-bold text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{feature.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
```

### Dashboard + Admin Panel

```tsx
import { AdminDashboardEnhanced } from '@/components/AdminDashboardEnhanced';
import { MobileBottomNavigation } from '@/components/MobileUI';
import { useState } from 'react';

export function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <div className="pb-20 md:pb-0">
      {/* Dashboard */}
      <AdminDashboardEnhanced />

      {/* Mobile Navigation */}
      <MobileBottomNavigation
        activeTab={activeView}
        onTabChange={setActiveView}
      />
    </div>
  );
}
```

### Form with Accessibility

```tsx
import { A11yInput, A11yButton, A11yModal } from '@/components/AccessibilityFeatures';
import { useState } from 'react';

export function LoanApplicationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    // Submit form
    setIsSubmitting(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Apply for a Loan</h1>

        <A11yInput
          id="name"
          label="Full Name"
          type="text"
          required
          error={errors.name}
          placeholder="John Doe"
        />

        <A11yInput
          id="email"
          label="Email Address"
          type="email"
          required
          error={errors.email}
          placeholder="john@example.com"
        />

        <A11yInput
          id="amount"
          label="Loan Amount"
          type="number"
          required
          error={errors.amount}
          placeholder="$50,000"
        />

        <A11yButton disabled={isSubmitting} ariaLabel="Submit loan application">
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </A11yButton>
      </form>

      {/* Confirmation Modal */}
      <A11yModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Application"
      >
        <p>
          Please review your information before submitting. You will receive
          an email confirmation once your application is processed.
        </p>
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => setShowConfirm(false)}
            className="flex-1 px-4 py-2 bg-gray-200 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Confirm
          </button>
        </div>
      </A11yModal>
    </>
  );
}
```

---

## Common Patterns

### Loading State Pattern

```tsx
import { AnimatedLoadingSkeleton, AnimatedSpinner } from '@/components/AnimatedLoadingStates';

function MyComponent() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchData().then((result) => {
      setData(result);
      setIsLoading(false);
    });
  }, []);

  // Show skeleton during load
  if (isLoading) {
    return <AnimatedLoadingSkeleton />;
  }

  // Show content
  return <div>{/* Your content */}</div>;
}
```

### Error Handling Pattern

```tsx
import { ErrorShake } from '@/components/AnimatedLoadingStates';

function ErrorDisplay({ error }: { error: Error | null }) {
  if (!error) return null;

  return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-lg fade-in">
      <div className="flex gap-4">
        <ErrorShake />
        <div>
          <h3 className="font-bold text-red-900">Error</h3>
          <p className="text-red-700 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    </div>
  );
}
```

### Success Feedback Pattern

```tsx
import { SuccessCheck } from '@/components/AnimatedLoadingStates';

function SuccessMessage({ message }: { message: string }) {
  return (
    <div className="p-6 bg-green-50 border border-green-200 rounded-lg fade-in">
      <div className="flex gap-4">
        <SuccessCheck />
        <div>
          <h3 className="font-bold text-green-900">Success</h3>
          <p className="text-green-700 text-sm mt-1">{message}</p>
        </div>
      </div>
    </div>
  );
}
```

### Mobile Responsive Pattern

```tsx
import { MobileBottomSheet, MobileCard } from '@/components/MobileUI';
import { useState } from 'react';

function ResponsiveCard({ title, children }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop: always visible */}
      <div className="hidden md:block bg-white rounded-lg p-6 border">
        <h3 className="font-bold mb-4">{title}</h3>
        {children}
      </div>

      {/* Mobile: bottom sheet */}
      <MobileCard>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="w-full text-blue-600 font-medium"
        >
          {title}
        </button>
      </MobileCard>

      <MobileBottomSheet
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      >
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4">{title}</h2>
          {children}
        </div>
      </MobileBottomSheet>
    </>
  );
}
```

---

## Troubleshooting

### Animations Not Playing

**Problem**: Animations created but not visible

**Solutions**:
1. Check if `animations.css` is imported in `index.css`
   ```css
   /* client/src/index.css */
   @import "./styles/animations.css";
   ```

2. Verify Tailwind config has animation support
   ```js
   // tailwind.config.ts
   export default {
     theme: {
       extend: {
         animation: {
           // Animations auto-loaded from CSS file
         }
       }
     }
   }
   ```

3. Check browser DevTools for animation class presence

### Focus/Accessibility Not Working

**Problem**: Keyboard navigation or screen reader not working

**Solutions**:
1. Ensure you're using `A11yButton` and `A11yInput` components
2. Verify ARIA labels are present:
   ```tsx
   <button aria-label="Close menu">
     {icon}
   </button>
   ```
3. Check focus-visible is enabled in Tailwind
4. Test with keyboard: Tab, Enter, Escape keys

### Mobile Navigation Not Showing

**Problem**: Mobile bottom navigation not visible

**Solutions**:
1. Ensure `pb-20` (padding-bottom) is on parent container
2. Check `md:hidden` class is hiding nav on desktop
3. Verify z-index: `z-30` is highest on page
4. Test on actual mobile device or DevTools mobile view

### Performance Issues

**Problem**: Animations are stuttering or slow

**Solutions**:
1. Reduce number of animated elements at once
2. Use CSS animations instead of JavaScript
3. Profile with Chrome DevTools Performance tab
4. Consider lazy-loading heavy components
5. Check GPU acceleration with `transform: translateZ(0)`

### TypeScript Errors

**Problem**: Component props not recognized

**Solutions**:
1. Ensure component is exported properly
2. Check import path is correct
3. Rebuild TypeScript: `npm run build`
4. Clear cache: `rm -rf node_modules/.cache`

---

## Testing Components

### Visual Testing Checklist

- [ ] Animations render smoothly
- [ ] Colors match design system
- [ ] Text is readable and properly sized
- [ ] Buttons have hover/active states
- [ ] Icons display correctly
- [ ] Responsive breakpoints work

### Interaction Testing

- [ ] Buttons can be clicked
- [ ] Forms capture input
- [ ] Navigation works
- [ ] Mobile swipes work
- [ ] Modals can be closed

### Accessibility Testing

- [ ] Tab navigation works
- [ ] Screen reader announces text
- [ ] Focus visible on all elements
- [ ] High contrast mode works
- [ ] Text size changes apply

---

## Performance Optimization Tips

1. **Lazy load heavy components**
   ```tsx
   const AdminDashboard = React.lazy(() => import('@/components/AdminDashboardEnhanced'));
   ```

2. **Use React.memo for static components**
   ```tsx
   export const AnimatedHeroSection = React.memo(HeroComponent);
   ```

3. **Profile animations**
   - Chrome DevTools → Performance → Record
   - Look for janky frames (>60fps)

4. **Optimize SVGs**
   - Use inline SVG for animations
   - Simplify paths and reduce nodes

---

**Happy building! 🚀**
