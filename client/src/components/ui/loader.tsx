import { cn } from "@/lib/utils";

interface LoaderProps {
  /**
   * Size of the loader block (default: 120px)
   */
  size?: number;
  /**
   * Color of the loader dots (default: primary brand color #0033A0)
   */
  color?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Text to display below the loader (optional)
   */
  text?: string;
}

/**
 * Loader Component - Animated loading indicator with sliding dots
 * Uses loader--2 animation style from the design system
 */
export function Loader({ size = 120, color, className, text }: LoaderProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <div 
        className="loader loader--2" 
        style={{
          '--block-size': `${size}px`,
          ...(color ? { color } : {})
        } as React.CSSProperties}
        aria-label="Loading"
        role="status"
      />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

/**
 * FullPageLoader - Centered loading screen that fills the viewport
 */
export function FullPageLoader({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader text={text} size={150} />
    </div>
  );
}
