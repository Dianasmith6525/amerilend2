import * as React from "react";
import { cn } from "@/lib/utils";
import "@/styles/checkbox.css";

interface FlipCheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  containerClassName?: string;
  checkmarkSVG?: React.ReactNode;
}

/**
 * FlipCheckbox - Advanced 3D flip checkbox component with SVG checkmark
 * Uses CSS 3D transforms for smooth flip animation
 * Inspired by Uiverse.io design by SharpTH
 *
 * Features:
 * - Full 3D perspective flip animation
 * - Custom SVG checkmark on flip
 * - Premium smooth transitions
 * - Brand-aligned blue color (#0b76ef)
 *
 * Usage:
 * <FlipCheckbox id="premium" label="Enable premium features" />
 */
const FlipCheckbox = React.forwardRef<HTMLInputElement, FlipCheckboxProps>(
  (
    {
      label,
      containerClassName,
      className,
      checkmarkSVG,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `flip-checkbox-${Math.random()}`;
    const [isChecked, setIsChecked] = React.useState(props.defaultChecked || false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setIsChecked(e.target.checked);
      props.onChange?.(e);
    };

    const defaultCheckmark = (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        className="mt-0.5"
      >
        <path
          d="M20 6L9 17L4 12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    );

    if (label) {
      return (
        <div className={cn("checkbox-wrapper", containerClassName)}>
          <div className="relative w-5 h-5">
            <input
              ref={ref}
              type="checkbox"
              id={inputId}
              className={cn("hidden", className)}
              onChange={handleChange}
              {...props}
            />
            <label
              htmlFor={inputId}
              className="flip cursor-pointer"
              data-checked={isChecked}
            >
              <div className="front bg-white border border-gray-200 rounded-sm"></div>
              <div className="back flex items-center justify-center bg-[#0b76ef] border border-[#0b76ef] rounded-sm text-white">
                {checkmarkSVG || defaultCheckmark}
              </div>
            </label>
          </div>
          <label htmlFor={inputId} className="cursor-pointer">
            {label}
          </label>
        </div>
      );
    }

    return (
      <div className="relative w-5 h-5">
        <input
          ref={ref}
          type="checkbox"
          id={inputId}
          className={cn("hidden", className)}
          onChange={handleChange}
          {...props}
        />
        <label
          htmlFor={inputId}
          className="flip cursor-pointer"
          data-checked={isChecked}
        >
          <div className="front bg-white border border-gray-200 rounded-sm"></div>
          <div className="back flex items-center justify-center bg-[#0b76ef] border border-[#0b76ef] rounded-sm text-white">
            {checkmarkSVG || defaultCheckmark}
          </div>
        </label>
      </div>
    );
  }
);

FlipCheckbox.displayName = "FlipCheckbox";

export { FlipCheckbox };
