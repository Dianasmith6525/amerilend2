import * as React from "react";
import { cn } from "@/lib/utils";
import "@/styles/checkbox.css";

interface AnimatedCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  containerClassName?: string;
}

/**
 * AnimatedCheckbox - A 3D animated checkbox component with flip animation
 * Inspired by Uiverse.io design by SharpTH
 *
 * Features:
 * - Smooth 3D flip animation on toggle
 * - Blue accent color (#0b76ef) matching the brand
 * - Hover effects with scale and color changes
 * - Accessibility-friendly with proper ARIA support
 *
 * Usage:
 * <AnimatedCheckbox id="terms" label="I agree to terms" />
 * <AnimatedCheckbox id="newsletter" />
 */
const AnimatedCheckbox = React.forwardRef<
  HTMLInputElement,
  AnimatedCheckboxProps
>(({ label, containerClassName, className, ...props }, ref) => {
  const inputId = props.id || `checkbox-${Math.random()}`;

  if (label) {
    return (
      <div className={cn("checkbox-wrapper", containerClassName)}>
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={cn("checkbox-animated", className)}
          {...props}
        />
        <label htmlFor={inputId}>{label}</label>
      </div>
    );
  }

  return (
    <input
      ref={ref}
      type="checkbox"
      id={inputId}
      className={cn("checkbox-animated", className)}
      {...props}
    />
  );
});

AnimatedCheckbox.displayName = "AnimatedCheckbox";

export { AnimatedCheckbox };
