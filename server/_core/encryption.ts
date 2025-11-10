// Stub implementation of encryption - Module not found in original

export async function encryptData(data: string, key: string): Promise<string> {
  throw new Error('[encryption] Not implemented');
}

export async function decryptData(encrypted: string, key: string): Promise<string> {
  throw new Error('[encryption] Not implemented');
}

export const SENSITIVE_FIELDS = [];
export const SENSITIVE_DISBURSEMENT_FIELDS = [];
