/**
 * Authorize.net Payment Test - Debug Version
 * 
 * This script tests if your Authorize.net configuration is working
 * Run with: node test-authorize-net-debug.mjs
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

console.log('\n=== Authorize.net Configuration Test (Debug) ===\n');
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

console.log('\nPayload being sent:');
console.log(JSON.stringify(testPayload, null, 2));
console.log('\nTesting API connection...\n');

fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testPayload),
})
  .then((res) => {
    console.log(`Response Status: ${res.status} ${res.statusText}`);
    console.log('Response Headers:', Object.fromEntries(res.headers.entries()));
    return res.text();
  })
  .then((text) => {
    console.log('\nRaw Response:');
    console.log(text);

    // Try to parse as JSON
    try {
      const data = JSON.parse(text);
      console.log('\n✅ Response is valid JSON');
      
      if (data.messages?.resultCode === 'Ok') {
        console.log('✅ Credentials are valid!');
      } else if (data.messages?.resultCode === 'Error') {
        const errors = data.messages.message || [];
        errors.forEach((err) => {
          console.log(`❌ Error ${err.code}: ${err.text}`);
        });
      }
    } catch (e) {
      console.log('\n⚠️ Response is not JSON (HTML error page)');
      console.log('This usually means:');
      console.log('- Invalid API credentials');
      console.log('- API endpoint is wrong');
      console.log('- Firewall/security issue');
    }
  })
  .catch((err) => {
    console.error('❌ Connection Error:', err.message);
    console.log('\nPossible causes:');
    console.log('- Network connectivity issue');
    console.log('- Invalid endpoint URL');
    console.log('- Firewall blocking the connection');
  });
