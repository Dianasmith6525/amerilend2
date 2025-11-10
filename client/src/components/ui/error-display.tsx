import React from 'react';

interface ErrorDisplayProps {
  error?: string | Error | null;
  title?: string;
  children?: React.ReactNode;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, title = 'Error', children }) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string' ? error : error?.message || 'An error occurred';

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <h3 className="text-red-900 font-semibold">{title}</h3>
      <p className="text-red-800 mt-2">{errorMessage}</p>
      {children}
    </div>
  );
};

export const InlineError: React.FC<{ error?: string | null }> = ({ error }) => {
  if (!error) return null;

  return <p className="text-red-600 text-sm mt-1">{error}</p>;
};

export default { ErrorDisplay, InlineError };
