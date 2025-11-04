# 🚀 Quick Setup Guide: Configure Your Payment Systems

## ✅ What's Been Fixed

1. **Authorize.Net**: Already working correctly - processing fees go to YOUR merchant account
2. **Cryptocurrency**: Updated to use YOUR personal wallet addresses instead of random addresses

---

## 📋 Required Actions

### Step 1: Update Your `.env` File

**Copy `.env.example` to `.env` if you haven't already:**
```powershell
Copy-Item .env.example .env
```

**Then add YOUR wallet addresses to `.env`:**

```bash
# Your Personal Cryptocurrency Wallets
CRYPTO_WALLET_BTC=YOUR_BITCOIN_ADDRESS_HERE
CRYPTO_WALLET_ETH=YOUR_ETHEREUM_ADDRESS_HERE
CRYPTO_WALLET_USDT_ETH=YOUR_ETHEREUM_ADDRESS_HERE
CRYPTO_WALLET_USDC_ETH=YOUR_ETHEREUM_ADDRESS_HERE
```

### Step 2: Get Your Wallet Addresses

**Bitcoin (BTC):**
- Use a wallet like Coinbase, Kraken, Binance, or hardware wallet (Ledger, Trezor)
- Get your receiving address (starts with `bc1q`, `1`, or `3`)
- Example: `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh`

**Ethereum (ETH, USDT, USDC):**
- Use the same Ethereum address for ETH, USDT, and USDC (they're all on Ethereum)
- Get from wallet like MetaMask, Coinbase, Kraken, Binance
- Starts with `0x`
- Example: `0x71C7656EC7ab88b098defB751B7401B5f6d8976F`

⚠️ **IMPORTANT**:
- Only use addresses from wallets YOU control
- Never share your private keys
- Test with small amounts first

---

## 🔐 Security Checklist

- [ ] Use hardware wallet (Ledger/Trezor) for production
- [ ] Never commit `.env` file to git (already in `.gitignore`)
- [ ] Keep private keys offline
- [ ] Enable 2FA on exchange accounts
- [ ] Test with testnet/small amounts first

---

## 🧪 Testing Your Setup

### Test Authorize.Net (Already Working)
1. Complete a loan application as a user
2. Get approved by admin
3. Click "Pay Processing Fee"
4. Choose "Credit/Debit Card"
5. Complete payment
6. Check your Authorize.Net merchant dashboard - payment should appear

### Test Cryptocurrency
1. Complete a loan application as a user
2. Get approved by admin
3. Click "Pay Processing Fee"
4. Choose cryptocurrency (BTC, ETH, USDT, or USDC)
5. You'll see YOUR wallet address displayed
6. Send payment to that address
7. Check your wallet - payment should arrive

⚠️ **For crypto testing:**
- Start with testnet or very small amounts ($1-5)
- Verify the address shown matches your `.env` configuration
- Bitcoin confirmations take ~10-60 minutes
- Ethereum confirmations take ~1-5 minutes

---

## 📊 Verifying Configuration

**To check if your wallets are configured correctly:**

The system will validate addresses when you try to create a crypto payment. If an address is missing or invalid, you'll see an error like:

```
Cryptocurrency wallet address for BTC is not configured.
Please add CRYPTO_WALLET_BTC to your .env file.
```

Or:

```
Invalid wallet address format for ETH: 0xinvalid
```

---

## 💰 How Processing Fees Flow

### Authorize.Net Flow (Credit/Debit Cards)
```
Customer pays $200 fee
    ↓
Authorize.Net processes payment
    ↓
Money goes to YOUR merchant account
    ↓
You withdraw to your bank account
```

### Cryptocurrency Flow (BTC/ETH/USDT/USDC)
```
Customer pays $200 fee in crypto
    ↓
System shows YOUR wallet address
    ↓
Customer sends crypto to YOUR address
    ↓
Money arrives in YOUR wallet
    ↓
You can hold, exchange, or withdraw
```

---

## 🔄 Upgrading to Coinbase Commerce (Optional - Recommended for Production)

**Why upgrade?**
- ✅ Automatic payment detection
- ✅ Unique address per transaction (better tracking)
- ✅ Webhook notifications (automatic confirmation)
- ✅ Business-grade security
- ✅ Tax reporting features

**How to upgrade:**
1. Sign up at https://commerce.coinbase.com
2. Get API key from dashboard
3. Update `.env`:
   ```bash
   COINBASE_COMMERCE_API_KEY=your-actual-api-key
   COINBASE_COMMERCE_WEBHOOK_SECRET=your-webhook-secret
   ```
4. Uncomment Coinbase Commerce code in `server/_core/crypto-payment.ts` (lines 114-145)
5. Comment out personal wallet code (lines 153-159)

---

## 🆘 Troubleshooting

### "Cryptocurrency wallet address for BTC is not configured"
**Fix**: Add `CRYPTO_WALLET_BTC=your-btc-address` to `.env` file

### "Invalid wallet address format"
**Fix**: Verify your address is correct:
- Bitcoin: Should start with `1`, `3`, or `bc1`
- Ethereum: Should start with `0x` and be 42 characters

### Payment sent but not showing in wallet
**Fix**: 
- Check blockchain explorer (blockchain.info for BTC, etherscan.io for ETH)
- Wait for confirmations (BTC: 10-60 min, ETH: 1-5 min)
- Verify you sent to correct address

### Authorize.Net "credentials not configured"
**Fix**: Add these to `.env`:
```bash
AUTHORIZENET_API_LOGIN_ID=your-login-id
AUTHORIZENET_TRANSACTION_KEY=your-transaction-key
AUTHORIZENET_CLIENT_KEY=your-client-key
```

---

## 📞 Support Resources

**Wallet Providers:**
- Coinbase: https://www.coinbase.com
- Kraken: https://www.kraken.com
- MetaMask: https://metamask.io
- Ledger: https://www.ledger.com

**Blockchain Explorers:**
- Bitcoin: https://blockchain.info or https://blockchair.com
- Ethereum: https://etherscan.io

**Payment Gateways:**
- Authorize.Net: https://account.authorize.net
- Coinbase Commerce: https://commerce.coinbase.com

---

## ✨ Summary

**What changed:**
1. ✅ Created `crypto-config.ts` for wallet management
2. ✅ Updated `crypto-payment.ts` to use YOUR wallets
3. ✅ Removed random address generator
4. ✅ Added wallet validation
5. ✅ Updated `.env.example` with wallet fields

**What you need to do:**
1. Add your wallet addresses to `.env`
2. Test with small amounts
3. Verify payments arrive in your wallets

**Result:**
- ✅ Authorize.Net fees → Your merchant account
- ✅ Crypto fees → Your personal wallets
- ✅ You control 100% of processing fees
