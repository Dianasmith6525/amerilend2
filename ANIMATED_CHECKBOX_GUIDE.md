# Animated Checkbox Implementation Guide

This document covers the implementation of custom animated checkboxes in the Amerilend project.

## Overview

Three checkbox options are now available:

1. **Standard Checkbox** - The default Radix UI checkbox component
2. **Animated Checkbox** - Inline animated checkbox with scale and color transitions
3. **Flip Checkbox** - Advanced 3D flip animation with perspective transforms

## Files Created

### CSS
- `client/src/styles/checkbox.css` - All checkbox styling

### Components
- `client/src/components/ui/animated-checkbox.tsx` - Simple animated checkbox
- `client/src/components/ui/flip-checkbox.tsx` - 3D flip checkbox component

### Styles
- `client/src/index.css` - Updated to import checkbox styles

## Usage Examples

### Standard Checkbox (Existing)
```tsx
import { Checkbox } from "@/components/ui/checkbox";

export function MyComponent() {
  return <Checkbox id="terms" />
}
```

### Animated Checkbox
```tsx
import { AnimatedCheckbox } from "@/components/ui/animated-checkbox";

export function MyComponent() {
  return (
    <AnimatedCheckbox 
      id="newsletter" 
      label="Subscribe to newsletter"
      defaultChecked={false}
    />
  );
}
```

### Flip Checkbox
```tsx
import { FlipCheckbox } from "@/components/ui/flip-checkbox";

export function MyComponent() {
  return (
    <FlipCheckbox 
      id="premium" 
      label="Enable premium features"
    />
  );
}
```

## Colors

- **Border/Background (unchecked)**: `#e8e8eb` (light gray)
- **Checked Background**: `#0b76ef` (brand blue)
- **Text/Checkmark**: `#fff` (white)
- **Hover Border**: `#0b76ef` (brand blue)

## Animation Details

### AnimatedCheckbox
- Scale on hover: 1.05
- Transition duration: 0.3s
- Smooth color change on check
- Works with labels

### FlipCheckbox
- 3D rotation: rotateY(180deg)
- Transition duration: 0.4s
- SVG checkmark animation
- Full accessibility support

## Accessibility

All checkboxes:
- Support proper label association via `htmlFor`
- Include focus-visible styles
- Work with keyboard navigation
- Support disabled state
- Have proper ARIA roles

## Integration Points

### Where to Use AnimatedCheckbox
- User preferences/settings
- Newsletter subscriptions
- Feature toggles
- General form checkboxes where simplicity is preferred

### Where to Use FlipCheckbox
- Premium feature toggles
- Important agreement checkboxes
- High-visibility form elements
- Marketing/showcase sections

### Where to Use Standard Checkbox
- Complex forms
- Admin panels
- Data tables
- When consistency with other Radix UI components is needed

## Pages Already Using Checkboxes

1. **ApplyLoan.tsx** - Multiple checkboxes for agreements
   - Could migrate to AnimatedCheckbox for better UX
   
2. **LegalDocument.tsx** - Checkbox for document acceptance
   - Could migrate to FlipCheckbox for emphasis
   
3. **UserProfile.tsx** - Notification preferences
   - Could migrate to AnimatedCheckbox for consistency
   
4. **ComponentShowcase.tsx** - Demo/preview

## Migration Guide

To update existing checkboxes:

### From native input to AnimatedCheckbox
```tsx
// Before
<input type="checkbox" id="item" />

// After
import { AnimatedCheckbox } from "@/components/ui/animated-checkbox";
<AnimatedCheckbox id="item" />
```

### From Radix Checkbox to FlipCheckbox
```tsx
// Before
<Checkbox id="terms" />

// After
import { FlipCheckbox } from "@/components/ui/flip-checkbox";
<FlipCheckbox id="terms" label="I accept terms" />
```

## Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- CSS 3D Transforms required for FlipCheckbox
- Graceful degradation for older browsers (appears as regular checkbox)

## Performance Considerations

- CSS 3D transforms use GPU acceleration
- Minimal JavaScript overhead
- Smooth 60fps animations
- No layout thrashing
- ~500 bytes CSS + ~1KB JS per component

## Customization

### Change Colors
Edit `client/src/styles/checkbox.css`:
```css
.cbx:hover {
  border-color: #your-color;
}

#cbx:checked + .cbx {
  border-color: #your-color;
}
```

### Change Animation Speed
```css
.checkbox-animated {
  transition: all 0.5s ease; /* was 0.3s */
}

.flip {
  transition: all 0.5s ease; /* was 0.4s */
}
```

### Change Size
```css
.cbx {
  width: 24px; /* was 20px */
  height: 24px;
}
```

## Testing

All components support:
- React form hooks integration
- Controlled and uncontrolled modes
- onChange events
- defaultChecked prop
- disabled state

Example test:
```tsx
const { getByRole } = render(<AnimatedCheckbox id="test" />);
const checkbox = getByRole('checkbox');
expect(checkbox).not.toBeChecked();
fireEvent.click(checkbox);
expect(checkbox).toBeChecked();
```
