/**
 * Loan Type to Required Documents Mapping
 * Defines which documents are required for each loan type
 */

export interface DocumentRequirement {
  name: string;
  description: string;
  required: boolean;
  category: "identity" | "income" | "assets" | "property" | "employment" | "financial" | "vehicle" | "education" | "business";
}

export const loanTypeDocuments: Record<string, DocumentRequirement[]> = {
  // Personal Loans - Unsecured personal loans
  personal: [
    { name: "Valid ID", description: "Driver's License, Passport, or State ID", required: true, category: "identity" },
    { name: "Proof of Income", description: "Recent pay stubs (last 2 months)", required: true, category: "income" },
    { name: "Bank Statements", description: "Bank statements (last 2-3 months)", required: true, category: "financial" },
    { name: "Proof of Address", description: "Utility bill or mortgage statement", required: true, category: "identity" },
    { name: "Employment Verification", description: "Letter from employer (optional but recommended)", required: false, category: "employment" },
  ],

  // Installment Loans - Fixed-term loans
  installment: [
    { name: "Valid ID", description: "Driver's License, Passport, or State ID", required: true, category: "identity" },
    { name: "Proof of Income", description: "Recent pay stubs (last 2 months)", required: true, category: "income" },
    { name: "Bank Statements", description: "Bank statements (last 2-3 months)", required: true, category: "financial" },
    { name: "Proof of Address", description: "Utility bill or mortgage statement", required: true, category: "identity" },
    { name: "Credit History Documentation", description: "Optional previous credit records", required: false, category: "financial" },
  ],

  // Short-Term Loans (Payday/Cash Advance)
  short_term: [
    { name: "Valid ID", description: "Driver's License or Passport", required: true, category: "identity" },
    { name: "Recent Pay Stub", description: "Current pay period pay stub", required: true, category: "income" },
    { name: "Bank Account Info", description: "Active checking account details", required: true, category: "financial" },
    { name: "Employment Verification", description: "Current employment confirmation", required: true, category: "employment" },
    { name: "Proof of Address", description: "Utility bill or lease agreement", required: true, category: "identity" },
  ],

  // Auto Loans - Vehicle purchase loans
  auto: [
    { name: "Driver's License", description: "Valid driver's license", required: true, category: "identity" },
    { name: "Proof of Income", description: "Pay stubs (last 2 months)", required: true, category: "income" },
    { name: "Bank Statements", description: "Bank statements (last 2-3 months)", required: true, category: "financial" },
    { name: "Vehicle Information", description: "VIN, make, model, and year", required: true, category: "vehicle" },
    { name: "Insurance Quote", description: "Auto insurance quote for the vehicle", required: true, category: "vehicle" },
    { name: "Trade-in Documentation", description: "If applicable, trade-in paperwork", required: false, category: "vehicle" },
    { name: "Employment Letter", description: "Optional employment verification", required: false, category: "employment" },
  ],

  // Home Equity Loans - Secured by home equity
  home_equity: [
    { name: "Valid ID", description: "Government-issued ID", required: true, category: "identity" },
    { name: "Proof of Income", description: "Pay stubs (last 2 months)", required: true, category: "income" },
    { name: "Tax Returns", description: "Tax returns (last 2 years)", required: true, category: "financial" },
    { name: "Bank Statements", description: "Bank statements (last 2-3 months)", required: true, category: "financial" },
    { name: "Proof of Home Ownership", description: "Mortgage statement, deed, or property tax bill", required: true, category: "property" },
    { name: "Home Appraisal", description: "Professional home appraisal", required: false, category: "property" },
    { name: "Proof of Address", description: "Recent utility bill", required: true, category: "identity" },
  ],

  // HELOC - Home Equity Line of Credit
  heloc: [
    { name: "Valid ID", description: "Government-issued ID", required: true, category: "identity" },
    { name: "Proof of Income", description: "Pay stubs (last 2 months)", required: true, category: "income" },
    { name: "Tax Returns", description: "Tax returns (last 2 years)", required: true, category: "financial" },
    { name: "Bank Statements", description: "Bank statements (last 2-3 months)", required: true, category: "financial" },
    { name: "Proof of Home Ownership", description: "Mortgage statement or deed", required: true, category: "property" },
    { name: "Home Appraisal", description: "Professional home appraisal", required: true, category: "property" },
    { name: "Proof of Address", description: "Recent utility bill", required: true, category: "identity" },
  ],

  // Student Loans - Education funding
  student: [
    { name: "Valid ID", description: "Government-issued ID", required: true, category: "identity" },
    { name: "Proof of Enrollment", description: "Acceptance letter or enrollment verification", required: true, category: "education" },
    { name: "FAFSA Completion", description: "FAFSA (for federal loans)", required: false, category: "education" },
    { name: "Proof of Address", description: "Utility bill or similar", required: true, category: "identity" },
    { name: "Bank Statements", description: "Bank statements (last 2-3 months)", required: false, category: "financial" },
    { name: "Proof of Income", description: "For parent PLUS loans", required: false, category: "income" },
    { name: "Tax Returns", description: "For parent PLUS loans (last 2 years)", required: false, category: "financial" },
  ],

  // Business Loans - Business funding
  business: [
    { name: "Valid ID", description: "Government-issued ID", required: true, category: "identity" },
    { name: "Business License", description: "Current business license", required: true, category: "business" },
    { name: "Business Plan", description: "For startups or expansion", required: false, category: "business" },
    { name: "Business Tax Returns", description: "Last 2-3 years (existing businesses)", required: true, category: "financial" },
    { name: "Personal Tax Returns", description: "Last 2-3 years", required: true, category: "financial" },
    { name: "Business Bank Statements", description: "Last 3 months", required: true, category: "financial" },
    { name: "Financial Statements", description: "Balance sheet and income statement", required: true, category: "financial" },
    { name: "Articles of Incorporation", description: "For corporations and LLCs", required: true, category: "business" },
    { name: "Collateral Documentation", description: "If applicable", required: false, category: "assets" },
  ],

  // Debt Consolidation Loans
  debt_consolidation: [
    { name: "Valid ID", description: "Government-issued ID", required: true, category: "identity" },
    { name: "Proof of Income", description: "Pay stubs (last 2 months)", required: true, category: "income" },
    { name: "Bank Statements", description: "Bank statements (last 2-3 months)", required: true, category: "financial" },
    { name: "List of Debts", description: "Credit card statements and loan documents", required: true, category: "financial" },
    { name: "Proof of Address", description: "Utility bill", required: true, category: "identity" },
    { name: "Credit Report Authorization", description: "Permission to pull credit report", required: true, category: "financial" },
  ],

  // Mortgage Loans - Home purchase
  mortgage: [
    { name: "Valid ID", description: "Government-issued ID", required: true, category: "identity" },
    { name: "Pay Stubs", description: "Last 2 months of pay stubs", required: true, category: "income" },
    { name: "W2s", description: "Last 2 years of W2 forms", required: true, category: "income" },
    { name: "Tax Returns", description: "Last 2-3 years of tax returns", required: true, category: "financial" },
    { name: "Bank Statements", description: "Last 2-3 months of bank statements", required: true, category: "financial" },
    { name: "Employment Letter", description: "Letter from employer", required: true, category: "employment" },
    { name: "Credit Report Authorization", description: "Permission to pull credit", required: true, category: "financial" },
    { name: "Purchase Agreement", description: "For new home purchase", required: true, category: "property" },
    { name: "Home Appraisal", description: "Professional appraisal", required: true, category: "property" },
    { name: "Title Search", description: "Title search documentation", required: true, category: "property" },
    { name: "Proof of Assets", description: "Asset verification", required: true, category: "assets" },
  ],

  // Private Money Loans
  private_money: [
    { name: "Valid ID", description: "Government-issued ID", required: true, category: "identity" },
    { name: "Proof of Income", description: "Recent pay stubs or tax returns", required: true, category: "income" },
    { name: "Bank Statements", description: "Last 3 months of bank statements", required: true, category: "financial" },
    { name: "Proof of Address", description: "Utility bill or lease", required: true, category: "identity" },
    { name: "Business License", description: "If self-employed", required: false, category: "business" },
    { name: "Collateral Documentation", description: "If secured loan", required: false, category: "assets" },
  ],

  // Title Loans - Vehicle title as collateral
  title: [
    { name: "Driver's License", description: "Valid driver's license", required: true, category: "identity" },
    { name: "Vehicle Title", description: "Clear or in process of being cleared", required: true, category: "vehicle" },
    { name: "Proof of Address", description: "Utility bill or ID", required: true, category: "identity" },
    { name: "Vehicle Registration", description: "Current vehicle registration", required: true, category: "vehicle" },
    { name: "Insurance Proof", description: "Current vehicle insurance", required: true, category: "vehicle" },
    { name: "Proof of Income", description: "Optional", required: false, category: "income" },
  ],

  // Credit Builder Loans
  credit_builder: [
    { name: "Valid ID", description: "Government-issued ID", required: true, category: "identity" },
    { name: "Proof of Income", description: "Pay stubs or tax returns", required: true, category: "income" },
    { name: "Bank Statements", description: "Proof of deposit capability", required: true, category: "financial" },
    { name: "Proof of Address", description: "Utility bill", required: true, category: "identity" },
    { name: "Savings Account Proof", description: "Proof of savings account", required: true, category: "financial" },
  ],

  // Signature Loans - Unsecured personal loans
  signature: [
    { name: "Valid ID", description: "Government-issued ID", required: true, category: "identity" },
    { name: "Proof of Income", description: "Pay stubs (last 2 months)", required: true, category: "income" },
    { name: "Bank Statements", description: "Bank statements (last 2-3 months)", required: true, category: "financial" },
    { name: "Proof of Address", description: "Utility bill", required: true, category: "identity" },
    { name: "Employment Verification", description: "Optional employment letter", required: false, category: "employment" },
  ],

  // Peer-to-Peer (P2P) Loans
  peer_to_peer: [
    { name: "Valid ID", description: "Government-issued ID", required: true, category: "identity" },
    { name: "Proof of Income", description: "Pay stubs or tax returns", required: true, category: "income" },
    { name: "Bank Statements", description: "Last 3 months of bank statements", required: true, category: "financial" },
    { name: "Proof of Address", description: "Utility bill", required: true, category: "identity" },
    { name: "Employment Verification", description: "Employment details", required: true, category: "employment" },
    { name: "Loan Purpose Description", description: "Description of intended use", required: true, category: "financial" },
  ],
};

/**
 * Get required documents for a specific loan type
 */
export function getRequiredDocuments(loanType: string): DocumentRequirement[] {
  return loanTypeDocuments[loanType.toLowerCase()] || [];
}

/**
 * Get only required documents (not optional)
 */
export function getRequiredDocumentsOnly(loanType: string): DocumentRequirement[] {
  return getRequiredDocuments(loanType).filter(doc => doc.required);
}

/**
 * Get document categories for a loan type
 */
export function getDocumentCategories(loanType: string): string[] {
  const documents = getRequiredDocuments(loanType);
  const categories = new Set<string>();
  documents.forEach(doc => categories.add(doc.category));
  return Array.from(categories);
}

/**
 * Check if a document is required for a loan type
 */
export function isDocumentRequired(loanType: string, documentName: string): boolean {
  const documents = getRequiredDocuments(loanType);
  const doc = documents.find(d => d.name.toLowerCase() === documentName.toLowerCase());
  return doc ? doc.required : false;
}
