import React from 'react';

const ServerError: React.FC = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold mb-4">Server Error</h1>
      <p className="text-lg mb-6">An error occurred on the server.</p>
      <div className="bg-red-50 p-6 rounded-lg">
        <p>Server error details coming soon...</p>
      </div>
    </div>
  );
};

export default ServerError;
