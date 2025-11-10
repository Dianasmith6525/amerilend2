import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
}

/**
 * FeatureCard - A card component for displaying features
 * Used to showcase key features on the homepage
 */
export const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, icon, title, description, children, ...props }, ref) => (
    <Card ref={ref} className={cn("h-full", className)} {...props}>
      <CardContent className="pt-6">
        {icon && <div className="mb-4 flex justify-center">{icon}</div>}
        {title && <h3 className="font-semibold text-lg mb-2">{title}</h3>}
        {description && <p className="text-sm text-gray-600">{description}</p>}
        {children}
      </CardContent>
    </Card>
  )
);
FeatureCard.displayName = "FeatureCard";

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "highlight" | "success";
  icon?: React.ReactNode;
}

/**
 * EnhancedCard - An enhanced card component with variants
 * Can be used for different types of card displays
 */
export const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  (
    {
      className,
      variant = "default",
      icon,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default: "bg-white border border-gray-200",
      highlight: "bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200",
      success: "bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200",
    };

    return (
      <Card
        ref={ref}
        className={cn(variantClasses[variant], "rounded-lg shadow-sm", className)}
        {...props}
      >
        <CardContent className="p-6">
          {icon && <div className="mb-4 flex justify-center text-lg">{icon}</div>}
          {children}
        </CardContent>
      </Card>
    );
  }
);
EnhancedCard.displayName = "EnhancedCard";

interface LoanCardProps extends React.HTMLAttributes<HTMLDivElement> {
  loanAmount?: string;
  loanTerm?: string;
  interestRate?: string;
  status?: "pending" | "approved" | "rejected" | "active";
}

/**
 * LoanCard - A specialized card for displaying loan information
 * Shows loan details like amount, term, interest rate, and status
 */
export const LoanCard = React.forwardRef<HTMLDivElement, LoanCardProps>(
  (
    {
      className,
      loanAmount,
      loanTerm,
      interestRate,
      status = "pending",
      children,
      ...props
    },
    ref
  ) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      active: "bg-blue-100 text-blue-800",
    };

    return (
      <Card
        ref={ref}
        className={cn("border border-gray-200", className)}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Loan Details</h3>
            <span className={`px-2 py-1 rounded text-sm font-medium ${statusColors[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
          {loanAmount && (
            <div className="mb-3">
              <p className="text-sm text-gray-600">Loan Amount</p>
              <p className="text-xl font-bold text-gray-900">{loanAmount}</p>
            </div>
          )}
          {loanTerm && (
            <div className="mb-3">
              <p className="text-sm text-gray-600">Loan Term</p>
              <p className="text-lg font-semibold text-gray-900">{loanTerm}</p>
            </div>
          )}
          {interestRate && (
            <div className="mb-3">
              <p className="text-sm text-gray-600">Interest Rate</p>
              <p className="text-lg font-semibold text-gray-900">{interestRate}</p>
            </div>
          )}
          {children}
        </CardContent>
      </Card>
    );
  }
);
LoanCard.displayName = "LoanCard";

interface DataCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string;
  value?: string | number;
  unit?: string;
  icon?: React.ReactNode;
}

/**
 * DataCard - A simple card for displaying key data points
 * Used in dashboards to show metrics, statistics, etc.
 */
export const DataCard = React.forwardRef<HTMLDivElement, DataCardProps>(
  (
    {
      className,
      label,
      value,
      unit,
      icon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Card
        ref={ref}
        className={cn("border border-gray-200", className)}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {label && <p className="text-sm text-gray-600 mb-2">{label}</p>}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{value}</span>
                {unit && <span className="text-sm text-gray-500">{unit}</span>}
              </div>
            </div>
            {icon && <div className="ml-4 text-gray-400">{icon}</div>}
          </div>
          {children}
        </CardContent>
      </Card>
    );
  }
);
DataCard.displayName = "DataCard";
