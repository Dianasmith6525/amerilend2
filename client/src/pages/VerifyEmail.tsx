import React from 'react';

const VerifyEmail: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-4">Verify Email</h1>
      <p className="text-lg mb-6">Verify your email address.</p>
      <div className="bg-blue-50 p-6 rounded-lg">
        <p>Email verification in progress...</p>
      </div>
    </div>
  );
};

export default VerifyEmail;
