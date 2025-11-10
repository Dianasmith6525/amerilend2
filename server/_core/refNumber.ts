export function generateApplicationReferenceNumber(): string {
  // Generate a simple reference number: APP-TIMESTAMP-RANDOM
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `APP-${timestamp}-${random}`;
}
