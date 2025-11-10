// Stub implementation of Apple OAuth - Module not found in original

export function getAppleAuthUrl(): string {
  throw new Error('[apple-oauth] Not implemented');
}

export async function exchangeAppleCodeForToken(code: string): Promise<any> {
  throw new Error('[apple-oauth] Not implemented');
}

export function decodeAppleIdToken(idToken: string): any {
  throw new Error('[apple-oauth] Not implemented');
}
