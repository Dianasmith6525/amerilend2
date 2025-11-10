export function generateReceiptPDF(data: any): Promise<Buffer> {
  // Stub implementation - returns empty buffer
  // In production, this would use a PDF library like pdfkit
  console.warn('[receiptGenerator] PDF generation not implemented - returning empty buffer');
  return Promise.resolve(Buffer.from(''));
}

export function generateTextReceipt(data: any): string {
  // Simple text receipt stub
  return `
PAYMENT RECEIPT
===============
Application ID: ${data.applicationId || 'N/A'}
Amount: $${data.amount || '0.00'}
Date: ${new Date().toISOString()}
Status: ${data.status || 'Pending'}

Thank you for your payment.
  `.trim();
}
