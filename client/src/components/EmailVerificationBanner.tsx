import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailVerificationBannerProps {
  email?: string;
  isVerified?: boolean;
  onResend?: () => void | Promise<void>;
  onDismiss?: () => void;
  className?: string;
}

/**
 * EmailVerificationBanner Component
 * Displays email verification status and allows user to resend verification email
 */
export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  email = '',
  isVerified = false,
  onResend,
  onDismiss,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed || isVerified) {
    return null;
  }

  const handleResend = async () => {
    if (onResend) {
      setIsLoading(true);
      try {
        await Promise.resolve(onResend());
      } catch (error) {
        console.error('Error resending verification email:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <Card className={`border-l-4 border-l-yellow-500 bg-yellow-50 ${className}`}>
      <div className="p-4 flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-yellow-900 mb-1">Verify Your Email</h3>
          <p className="text-sm text-yellow-800 mb-3">
            We sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to verify your email address.
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleResend}
              disabled={isLoading}
              className="text-yellow-600 border-yellow-300 hover:bg-yellow-100"
            >
              {isLoading ? 'Sending...' : 'Resend Email'}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-yellow-600 hover:bg-yellow-100"
            >
              Dismiss
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-yellow-600 hover:text-yellow-700 flex-shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </Card>
  );
};

export default EmailVerificationBanner;
