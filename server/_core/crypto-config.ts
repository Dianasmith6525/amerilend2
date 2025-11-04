/**
 * Cryptocurrency wallet configuration
 * 
 * IMPORTANT SECURITY NOTES:
 * 1. These are RECEIVING addresses only (public keys)
 * 2. NEVER commit private keys to this file
 * 3. Keep your private keys in a secure hardware wallet
 * 4. These addresses should be stored in environment variables
 * 5. For production, consider using Coinbase Commerce instead
 */

import type { CryptoCurrency } from "./crypto-payment";

/**
 * Your personal cryptocurrency wallet addresses
 * Configure these in your .env file
 */
export const CRYPTO_WALLETS: Record<CryptoCurrency, string> = {
  BTC: process.env.CRYPTO_WALLET_BTC || "",
  ETH: process.env.CRYPTO_WALLET_ETH || "",
  USDT: process.env.CRYPTO_WALLET_USDT_ETH || "", // USDT on Ethereum network
  USDC: process.env.CRYPTO_WALLET_USDC_ETH || "", // USDC on Ethereum network
};

/**
 * Get your configured wallet address for a specific cryptocurrency
 * 
 * @param currency - The cryptocurrency type (BTC, ETH, USDT, USDC)
 * @returns Your wallet address for receiving payments
 * @throws Error if wallet address is not configured
 */
export function getMyWalletAddress(currency: CryptoCurrency): string {
  const address = CRYPTO_WALLETS[currency];
  
  if (!address) {
    throw new Error(
      `Cryptocurrency wallet address for ${currency} is not configured. ` +
      `Please add CRYPTO_WALLET_${currency} to your .env file.`
    );
  }
  
  // Basic validation
  if (!isValidCryptoAddress(currency, address)) {
    throw new Error(
      `Invalid wallet address format for ${currency}: ${address}`
    );
  }
  
  return address;
}

/**
 * Validate cryptocurrency address format
 * Basic validation - not exhaustive
 */
function isValidCryptoAddress(currency: CryptoCurrency, address: string): boolean {
  switch (currency) {
    case "BTC":
      // Bitcoin addresses: Legacy (1...), SegWit (3...), or Bech32 (bc1...)
      return /^(1|3|bc1)[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address);
    
    case "ETH":
    case "USDT":
    case "USDC":
      // Ethereum addresses (including ERC-20 tokens)
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    
    default:
      return false;
  }
}

/**
 * Check if all required wallet addresses are configured
 */
export function areWalletsConfigured(): {
  configured: boolean;
  missing: CryptoCurrency[];
} {
  const missing: CryptoCurrency[] = [];
  
  (Object.keys(CRYPTO_WALLETS) as CryptoCurrency[]).forEach((currency) => {
    if (!CRYPTO_WALLETS[currency]) {
      missing.push(currency);
    }
  });
  
  return {
    configured: missing.length === 0,
    missing,
  };
}

/**
 * Get wallet configuration status for admin dashboard
 */
export function getWalletConfigurationStatus() {
  const status = areWalletsConfigured();
  
  return {
    ...status,
    wallets: Object.entries(CRYPTO_WALLETS).map(([currency, address]) => ({
      currency,
      configured: !!address,
      address: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not configured",
    })),
  };
}
