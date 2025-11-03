CREATE TABLE IF NOT EXISTS loanDocumentRequirements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  loanType VARCHAR(50) NOT NULL,
  documentName VARCHAR(255) NOT NULL,
  description TEXT,
  isRequired TINYINT DEFAULT 1 NOT NULL,
  category VARCHAR(100) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE KEY uq_loan_doc (loanType, documentName)
);

CREATE TABLE IF NOT EXISTS submittedDocuments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  loanApplicationId INT NOT NULL,
  documentType VARCHAR(100) NOT NULL,
  fileName VARCHAR(255) NOT NULL,
  fileUrl VARCHAR(500) NOT NULL,
  fileSize INT NOT NULL,
  mimeType VARCHAR(50) NOT NULL,
  uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  verificationStatus ENUM('pending', 'approved', 'rejected', 'needs_reupload') DEFAULT 'pending' NOT NULL,
  verifiedBy INT,
  verifiedAt TIMESTAMP NULL,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (loanApplicationId) REFERENCES loanApplications(id) ON DELETE CASCADE,
  INDEX idx_loan_application (loanApplicationId),
  INDEX idx_verification_status (verificationStatus)
);

-- Insert loan type document requirements
INSERT INTO loanDocumentRequirements (loanType, documentName, description, isRequired, category) VALUES
-- Personal Loans
('personal', 'Valid ID', 'Driver\'s License, Passport, or State ID', 1, 'identity'),
('personal', 'Proof of Income', 'Recent pay stubs (last 2 months)', 1, 'income'),
('personal', 'Bank Statements', 'Bank statements (last 2-3 months)', 1, 'financial'),
('personal', 'Proof of Address', 'Utility bill or mortgage statement', 1, 'identity'),
('personal', 'Employment Verification', 'Letter from employer', 0, 'employment'),

-- Installment Loans
('installment', 'Valid ID', 'Driver\'s License, Passport, or State ID', 1, 'identity'),
('installment', 'Proof of Income', 'Recent pay stubs (last 2 months)', 1, 'income'),
('installment', 'Bank Statements', 'Bank statements (last 2-3 months)', 1, 'financial'),
('installment', 'Proof of Address', 'Utility bill or mortgage statement', 1, 'identity'),

-- Short-Term Loans
('short_term', 'Valid ID', 'Driver\'s License or Passport', 1, 'identity'),
('short_term', 'Recent Pay Stub', 'Current pay period pay stub', 1, 'income'),
('short_term', 'Bank Account Info', 'Active checking account details', 1, 'financial'),
('short_term', 'Employment Verification', 'Current employment confirmation', 1, 'employment'),
('short_term', 'Proof of Address', 'Utility bill or lease agreement', 1, 'identity'),

-- Auto Loans
('auto', 'Driver\'s License', 'Valid driver\'s license', 1, 'identity'),
('auto', 'Proof of Income', 'Pay stubs (last 2 months)', 1, 'income'),
('auto', 'Bank Statements', 'Bank statements (last 2-3 months)', 1, 'financial'),
('auto', 'Vehicle Information', 'VIN, make, model, and year', 1, 'vehicle'),
('auto', 'Insurance Quote', 'Auto insurance quote for the vehicle', 1, 'vehicle'),

-- Debt Consolidation
('debt_consolidation', 'Valid ID', 'Government-issued ID', 1, 'identity'),
('debt_consolidation', 'Proof of Income', 'Pay stubs (last 2 months)', 1, 'income'),
('debt_consolidation', 'Bank Statements', 'Bank statements (last 2-3 months)', 1, 'financial'),
('debt_consolidation', 'List of Debts', 'Credit card statements and loan documents', 1, 'financial'),
('debt_consolidation', 'Proof of Address', 'Utility bill', 1, 'identity'),

-- Business Loans
('business', 'Valid ID', 'Government-issued ID', 1, 'identity'),
('business', 'Business License', 'Current business license', 1, 'business'),
('business', 'Business Tax Returns', 'Last 2-3 years (existing businesses)', 1, 'financial'),
('business', 'Personal Tax Returns', 'Last 2-3 years', 1, 'financial'),
('business', 'Business Bank Statements', 'Last 3 months', 1, 'financial'),
('business', 'Financial Statements', 'Balance sheet and income statement', 1, 'financial'),

-- Student Loans
('student', 'Valid ID', 'Government-issued ID', 1, 'identity'),
('student', 'Proof of Enrollment', 'Acceptance letter or enrollment verification', 1, 'education'),
('student', 'FAFSA Completion', 'FAFSA (for federal loans)', 0, 'education'),
('student', 'Proof of Address', 'Utility bill or similar', 1, 'identity'),

-- Home Equity
('home_equity', 'Valid ID', 'Government-issued ID', 1, 'identity'),
('home_equity', 'Proof of Income', 'Pay stubs (last 2 months)', 1, 'income'),
('home_equity', 'Tax Returns', 'Tax returns (last 2 years)', 1, 'financial'),
('home_equity', 'Proof of Home Ownership', 'Mortgage statement, deed, or property tax bill', 1, 'property'),

-- HELOC
('heloc', 'Valid ID', 'Government-issued ID', 1, 'identity'),
('heloc', 'Proof of Income', 'Pay stubs (last 2 months)', 1, 'income'),
('heloc', 'Home Appraisal', 'Professional home appraisal', 1, 'property'),
('heloc', 'Proof of Home Ownership', 'Mortgage statement or deed', 1, 'property'),

-- Title Loans
('title', 'Driver\'s License', 'Valid driver\'s license', 1, 'identity'),
('title', 'Vehicle Title', 'Clear or in process of being cleared', 1, 'vehicle'),
('title', 'Vehicle Registration', 'Current vehicle registration', 1, 'vehicle'),
('title', 'Insurance Proof', 'Current vehicle insurance', 1, 'vehicle'),

-- Credit Builder
('credit_builder', 'Valid ID', 'Government-issued ID', 1, 'identity'),
('credit_builder', 'Proof of Income', 'Pay stubs or tax returns', 1, 'income'),
('credit_builder', 'Bank Statements', 'Proof of deposit capability', 1, 'financial'),
('credit_builder', 'Savings Account Proof', 'Proof of savings account', 1, 'financial'),

-- Signature Loans
('signature', 'Valid ID', 'Government-issued ID', 1, 'identity'),
('signature', 'Proof of Income', 'Pay stubs (last 2 months)', 1, 'income'),
('signature', 'Bank Statements', 'Bank statements (last 2-3 months)', 1, 'financial'),
('signature', 'Proof of Address', 'Utility bill', 1, 'identity'),

-- P2P Loans
('peer_to_peer', 'Valid ID', 'Government-issued ID', 1, 'identity'),
('peer_to_peer', 'Proof of Income', 'Pay stubs or tax returns', 1, 'income'),
('peer_to_peer', 'Bank Statements', 'Last 3 months of bank statements', 1, 'financial'),
('peer_to_peer', 'Employment Verification', 'Employment details', 1, 'employment');
