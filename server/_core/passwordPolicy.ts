export const DEFAULT_PASSWORD_REQUIREMENTS = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSymbols: true,
};

export function validatePassword(pwd: string) {
  return true;
}
