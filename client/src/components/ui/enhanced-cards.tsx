import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const FeatureCard: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow ${className}`} {...props}>
      {children}
    </div>
  );
};

export const EnhancedCard: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-md border border-blue-100 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const LoanCard: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-600 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const DataCard: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white p-4 rounded-md border border-gray-200 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default { FeatureCard, EnhancedCard, LoanCard, DataCard };
