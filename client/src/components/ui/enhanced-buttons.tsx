import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnhancedButtonProps extends React.ComponentProps<typeof Button> {
  icon?: React.ReactNode;
}

/**
 * PrimaryButton - Main action button with brand color (blue)
 * Used for primary calls-to-action like "Apply Now"
 */
export const PrimaryButton = React.forwardRef<
  HTMLButtonElement,
  EnhancedButtonProps
>(({ className, icon, children, ...props }, ref) => (
  <Button
    ref={ref}
    className={cn(
      "bg-[#0033A0] text-white hover:bg-[#0033A0]/90 font-semibold",
      className
    )}
    {...props}
  >
    {children}
    {icon && <span className="ml-1">{icon}</span>}
  </Button>
));
PrimaryButton.displayName = "PrimaryButton";

/**
 * SecondaryButton - Secondary action button with outline style
 * Used for secondary calls-to-action like "Log In", "Dashboard"
 */
export const SecondaryButton = React.forwardRef<
  HTMLButtonElement,
  EnhancedButtonProps
>(({ className, icon, children, ...props }, ref) => (
  <Button
    ref={ref}
    variant="outline"
    className={cn(
      "border-2 border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white font-semibold transition-all",
      className
    )}
    {...props}
  >
    {children}
    {icon && <span className="ml-1">{icon}</span>}
  </Button>
));
SecondaryButton.displayName = "SecondaryButton";
