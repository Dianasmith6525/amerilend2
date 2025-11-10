import React from 'react';
import { Loader } from '@/components/ui/loader';

interface EnhancedFullPageLoaderProps {
  message?: string;
  isLoading?: boolean;
  variant?: 'default' | 'minimal' | 'with-message';
}

/**
 * EnhancedFullPageLoader Component
 * A full-page loading indicator with multiple variants
 */
export const EnhancedFullPageLoader: React.FC<EnhancedFullPageLoaderProps> = ({
  message = 'Loading...',
  isLoading = true,
  variant = 'default',
}) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col items-center gap-4">
        {variant !== 'minimal' && <Loader />}
        {variant === 'with-message' && message && (
          <p className="text-lg font-medium text-gray-700">{message}</p>
        )}
        {variant === 'default' && message && (
          <p className="text-sm text-gray-500">{message}</p>
        )}
      </div>
    </div>
  );
};

export default EnhancedFullPageLoader;
