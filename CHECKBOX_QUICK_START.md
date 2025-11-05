# Checkbox Quick Start Guide

## 🚀 Get Started in 30 Seconds

### 1. Import a Checkbox Component

```tsx
// Option 1: Animated checkbox (recommended for most uses)
import { AnimatedCheckbox } from "@/components/ui/animated-checkbox";

// Option 2: 3D Flip checkbox (for important items)
import { FlipCheckbox } from "@/components/ui/flip-checkbox";

// Option 3: Standard checkbox (traditional)
import { Checkbox } from "@/components/ui/checkbox";
```

### 2. Use in Your Component

```tsx
export function MyForm() {
  const [agreed, setAgreed] = useState(false);

  return (
    <form>
      {/* Simple checkbox with label */}
      <AnimatedCheckbox
        id="terms"
        label="I agree to the terms"
        checked={agreed}
        onChange={(e) => setAgreed(e.target.checked)}
      />

      {/* Without label */}
      <AnimatedCheckbox id="newsletter" defaultChecked />

      {/* Disabled state */}
      <AnimatedCheckbox id="old" disabled label="Already accepted" />
    </form>
  );
}
```

## 📋 Which Checkbox Should I Use?

| Situation | Use | Why |
|-----------|-----|-----|
| Loan agreement acceptance | `FlipCheckbox` | Emphasizes importance |
| Newsletter subscription | `AnimatedCheckbox` | Smooth, friendly feel |
| Data table column | `Checkbox` | Consistency with admin UI |
| User preferences | `AnimatedCheckbox` | Easy to notice changes |
| Legal/compliance | `FlipCheckbox` | Visually important |
| Settings panel | `AnimatedCheckbox` | Good visual feedback |

## 🎨 Styling

The components come with built-in styling:

```css
/* Unchecked: light gray */
border-color: #e8e8eb;

/* Checked/Hover: brand blue */
border-color: #0b76ef;
background-color: #0b76ef;
```

No additional CSS needed! The styles are already imported in `index.css`.

## 📱 Real-World Example

```tsx
import { AnimatedCheckbox } from "@/components/ui/animated-checkbox";
import { FlipCheckbox } from "@/components/ui/flip-checkbox";
import { useState } from "react";

export function LoanApplication() {
  const [formData, setFormData] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    emailUpdates: false,
  });

  const handleChange = (field: string, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const canSubmit = formData.termsAccepted && formData.privacyAccepted;

  return (
    <div className="space-y-6">
      <h2>Loan Agreement</h2>
      
      {/* Important agreements use FlipCheckbox */}
      <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
        <FlipCheckbox
          id="terms"
          label="I have read and agree to the Terms of Service"
          checked={formData.termsAccepted}
          onChange={(e) => handleChange("termsAccepted", e.target.checked)}
        />
        
        <FlipCheckbox
          id="privacy"
          label="I accept the Privacy Policy"
          checked={formData.privacyAccepted}
          onChange={(e) => handleChange("privacyAccepted", e.target.checked)}
        />
      </div>

      <h3>Preferences</h3>
      
      {/* Optional preferences use AnimatedCheckbox */}
      <div className="space-y-2">
        <AnimatedCheckbox
          id="emails"
          label="Send me email updates about my loan"
          checked={formData.emailUpdates}
          onChange={(e) => handleChange("emailUpdates", e.target.checked)}
        />
      </div>

      <button
        disabled={!canSubmit}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50"
      >
        Continue Application
      </button>

      {canSubmit && (
        <p className="text-green-600 text-sm">✓ Ready to proceed</p>
      )}
    </div>
  );
}
```

## ✨ Features

- ✅ 3D animations (FlipCheckbox)
- ✅ Smooth transitions (AnimatedCheckbox)
- ✅ Built-in label support
- ✅ Disabled state
- ✅ Full TypeScript support
- ✅ Accessible (ARIA roles, keyboard nav)
- ✅ Works with form libraries
- ✅ Zero dependencies (uses CSS transforms)

## 🔧 Props

### AnimatedCheckbox

```tsx
<AnimatedCheckbox
  id="my-checkbox"              // Required: unique identifier
  label="My option"             // Optional: displays next to checkbox
  checked={value}               // Optional: controlled input
  defaultChecked={false}        // Optional: uncontrolled initial state
  onChange={(e) => {}}          // Optional: change handler
  disabled={false}              // Optional: disable checkbox
  className="my-class"          // Optional: custom CSS class
  containerClassName="my-wrap"  // Optional: wrapper div CSS
/>
```

### FlipCheckbox

```tsx
<FlipCheckbox
  id="flip-box"                 // Required: unique identifier
  label="Flip option"           // Optional: displays next to checkbox
  checked={value}               // Optional: controlled input
  defaultChecked={false}        // Optional: uncontrolled initial state
  onChange={(e) => {}}          // Optional: change handler
  disabled={false}              // Optional: disable checkbox
  checkmarkSVG={<svg>...</svg>} // Optional: custom SVG checkmark
/>
```

### Standard Checkbox

```tsx
<Checkbox
  id="standard"                 // Optional: unique identifier
  checked={value}               // Optional: controlled input
  className="my-class"          // Optional: custom CSS class
/>
```

## 📚 See More Examples

Check out `client/src/components/CheckboxExamples.tsx` for:
- All three checkbox types in action
- Real-world form examples
- Comparison table
- State management patterns
- Accessibility features

## 🚨 Common Issues

### "CheckboxExamples is not found"
Make sure to import from the correct path:
```tsx
import CheckboxExamples from "@/components/CheckboxExamples";
```

### Checkbox not showing animations
Verify that `client/src/styles/checkbox.css` is imported in `index.css`. ✓ Already done!

### Styling conflicts
The components use scoped class names (`.cbx`, `.flip`, `.checkbox-animated`) that shouldn't conflict with other styles.

## 🎯 Next Steps

1. **Preview** the CheckboxExamples component
2. **Choose** which checkbox type fits your use case
3. **Copy-paste** the example code
4. **Customize** the styling if needed
5. **Test** your form submission

## 📖 More Info

- Full implementation guide: `ANIMATED_CHECKBOX_GUIDE.md`
- Complete summary: `CHECKBOX_IMPLEMENTATION_SUMMARY.md`
- CSS styles: `client/src/styles/checkbox.css`
- Component source: `client/src/components/ui/`

---

**Happy coding!** 🎉

Your animated checkboxes are ready to use. Mix and match them to create the perfect UX for your loan application!
