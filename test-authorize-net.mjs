/**
 * Authorize.net Payment Test
 * 
 * This script tests if your Authorize.net configuration is working
 * Run with: node test-authorize-net.mjs
 */

import dotenv from 'dotenv';
dotenv.config();

const config = {
  apiLoginId: process.env.AUTHORIZENET_API_LOGIN_ID,
  transactionKey: process.env.AUTHORIZENET_TRANSACTION_KEY,
  clientKey: process.env.AUTHORIZENET_CLIENT_KEY,
  environment: process.env.AUTHORIZENET_ENVIRONMENT,
};

const endpoint =
  config.environment === 'production'
    ? 'https://api.authorize.net/xml/v1/request.api'
    : 'https://apitest.authorize.net/xml/v1/request.api';

console.log('\n=== Authorize.net Configuration Test ===\n');
console.log(`Environment: ${config.environment}`);
console.log(`API Endpoint: ${endpoint}`);
console.log(`API Login ID: ${config.apiLoginId ? '✅ Configured' : '❌ MISSING'}`);
console.log(`Transaction Key: ${config.transactionKey ? '✅ Configured' : '❌ MISSING'}`);
console.log(`Client Key: ${config.clientKey ? '✅ Configured' : '❌ MISSING'}`);

if (!config.apiLoginId || !config.transactionKey) {
  console.log('\n❌ ERROR: Missing credentials in .env\n');
  process.exit(1);
}

// Test API connection
const testPayload = {
  createTransactionRequest: {
    merchantAuthentication: {
      name: config.apiLoginId,
      transactionKey: config.transactionKey,
    },
    refId: `test_${Date.now()}`,
    transactionRequest: {
      transactionType: 'authCaptureTransaction',
      amount: '5.75',
      payment: {
        opaqueData: {
          dataDescriptor: 'COMMON.ACCEPT.INAPP.PAYMENT',
          dataValue: 'test-token',
        },
      },
      order: {
        description: 'Test Payment - Configuration Verification',
      },
    },
  },
};

console.log('\nTesting API connection...\n');

fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload),
})
  .then((res) => res.json())
  .then((data) => {
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));

    if (data.messages?.resultCode === 'Ok') {
      console.log('\n✅ Credentials are valid!');
      if (data.transactionResponse?.responseCode === '1') {
        console.log('✅ Transaction approved!');
      } else if (data.transactionResponse?.responseCode === '3') {
        console.log(
          '⚠️ Transaction declined (this is expected - invalid test token)'
        );
      }
    } else if (data.messages?.resultCode === 'Error') {
      const errors = data.messages.message || [];
      if (errors.some((e) => e.code === 'E00008')) {
        console.log(
          '\n❌ Invalid credentials! Check AUTHORIZENET_API_LOGIN_ID and AUTHORIZENET_TRANSACTION_KEY'
        );
      } else if (errors.some((e) => e.code === 'E00009')) {
        console.log(
          '\n❌ Merchant account locked or credentials expired!'
        );
      } else {
        console.log('\n❌ API Error:', errors.map((e) => e.text).join(', '));
      }
    }
  })
  .catch((err) => {
    console.error('❌ Connection Error:', err.message);
    console.log('\nPossible causes:');
    console.log('- Network connectivity issue');
    console.log('- Invalid endpoint URL');
    console.log('- Firewall blocking the connection');
  });
