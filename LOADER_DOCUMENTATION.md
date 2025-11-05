# Loader Component Documentation

## Overview

The new **Loader** component uses the elegant **loader-2** animation style - a horizontal sliding dots animation that provides a professional loading experience throughout your application.

## Features

✅ **Smooth Animation**: Two dots sliding horizontally on a line  
✅ **Brand Colors**: Uses your primary brand color (#0033A0)  
✅ **Customizable**: Size, color, and optional text  
✅ **Accessible**: Includes proper ARIA labels  
✅ **Responsive**: Works on all screen sizes  

## Usage

### 1. Full Page Loader

Use `FullPageLoader` for page-level loading states:

```tsx
import { FullPageLoader } from "@/components/ui/loader";

function MyPage() {
  const { isLoading } = useQuery();
  
  if (isLoading) {
    return <FullPageLoader text="Loading your data..." />;
  }
  
  return <div>Your content</div>;
}
```

### 2. Inline Loader

Use `Loader` for inline loading states:

```tsx
import { Loader } from "@/components/ui/loader";

function MyComponent() {
  return (
    <div className="flex justify-center py-8">
      <Loader text="Loading applications..." size={120} />
    </div>
  );
}
```

### 3. Custom Styling

Customize the loader with props:

```tsx
<Loader 
  size={150}                    // Size in pixels (default: 120)
  color="#FF5733"               // Custom color (default: #0033A0)
  text="Please wait..."         // Optional loading text
  className="my-custom-class"   // Additional CSS classes
/>
```

## Props

### Loader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `number` | `120` | Size of the loader block in pixels |
| `color` | `string` | `#0033A0` | Color of the animated dots |
| `className` | `string` | `undefined` | Additional CSS classes |
| `text` | `string` | `undefined` | Optional text below the loader |

### FullPageLoader Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | `"Loading..."` | Text to display below the loader |

## Where It's Used

The loader-2 animation has been implemented in:

✅ **Dashboard** - Loading dashboard data  
✅ **Admin Dashboard** - Verifying admin access and loading applications  
✅ **Apply Loan** - Loading application form  
✅ **Payment Pages** - Loading payment details  
✅ **User Profile** - Loading profile data  
✅ **Google Callback** - OAuth authentication  

## Animation Details

The **loader-2** animation features:

- **Duration**: 1 second per cycle
- **Style**: Two dots sliding horizontally on a line
- **Easing**: `cubic-bezier(0.27, 0.08, 0.26, 0.7)` for smooth motion
- **Delay**: Second dot starts 1/3 through the animation for a cascading effect

## CSS Variables

The loader uses CSS custom properties for flexibility:

```css
--block-size: 120px;           /* Base size */
--loader-size: calc(var(--block-size) / 3);
--dot-size: 5px;               /* Dot diameter */
--anim-duration: 1s;           /* Animation speed */
```

## Accessibility

The loader includes proper accessibility attributes:

```tsx
<div 
  className="loader loader--2"
  aria-label="Loading"
  role="status"
/>
```

## Browser Support

Works in all modern browsers that support:
- CSS Custom Properties
- CSS Animations
- CSS calc()

## Examples

### Minimal Usage
```tsx
<Loader />
```

### With Text
```tsx
<Loader text="Loading your applications..." />
```

### Large with Custom Color
```tsx
<Loader 
  size={200} 
  color="#00A86B" 
  text="Processing payment..." 
/>
```

### Full Page
```tsx
<FullPageLoader text="Initializing dashboard..." />
```

## Migration

Old loading pattern:
```tsx
<div className="min-h-screen flex items-center justify-center">
  <Loader2 className="h-8 w-8 animate-spin text-primary" />
</div>
```

New loading pattern:
```tsx
<FullPageLoader text="Loading..." />
```

## Notes

- The loader automatically centers itself within its container
- Optional text appears below the loader with a subtle pulse animation
- The component is fully typed with TypeScript
- CSS is in `client/src/index.css` under the "Loader Styles" section
