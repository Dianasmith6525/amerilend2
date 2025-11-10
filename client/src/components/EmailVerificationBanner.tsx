import React from 'react';

export const EmailVerificationBanner: React.FC = () => {
  return (
    <div className="email-verification-banner bg-blue-50 border border-blue-200 rounded p-4 mb-4">
      <h3 className="font-semibold text-blue-900">Email Verification Needed</h3>
      <p className="text-blue-800 mt-2">Please verify your email address to continue.</p>
    </div>
  );
};

export default EmailVerificationBanner;
