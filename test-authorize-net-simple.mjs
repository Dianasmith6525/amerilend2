/**
 * Authorize.net Simple Connectivity Test
 * Tests basic authentication without requiring a valid token
 */

import dotenv from 'dotenv';
dotenv.config();

const apiLoginId = process.env.AUTHORIZENET_API_LOGIN_ID;
const transactionKey = process.env.AUTHORIZENET_TRANSACTION_KEY;
const environment = process.env.AUTHORIZENET_ENVIRONMENT;

const endpoint =
  environment === 'production'
    ? 'https://api.authorize.net/xml/v1/request.api'
    : 'https://apitest.authorize.net/xml/v1/request.api';

console.log('\n=== Authorize.net Simple Authentication Test ===\n');
console.log(`Environment: ${environment}`);
console.log(`API Endpoint: ${endpoint}`);
console.log(`API Login ID: ${apiLoginId}`);
console.log(`Transaction Key: ${transactionKey}\n`);

// Try a simple validation request (doesn't require valid payment data)
const payload = {
  validateCustomerPaymentProfileRequest: {
    merchantAuthentication: {
      name: apiLoginId,
      transactionKey: transactionKey,
    },
    customerProfileId: '0', // Dummy ID for validation
    customerPaymentProfileId: '0',
    validationMode: 'testMode',
  },
};

console.log('Sending simple validation request to Authorize.net...\n');

fetch(endpoint, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(payload),
})
  .then((res) => res.json())
  .then((data) => {
    console.log('API Response:');
    console.log(JSON.stringify(data, null, 2));

    if (data.messages?.resultCode === 'Error') {
      const errors = data.messages.message || [];
      const errorCode = errors[0]?.code;
      const errorText = errors[0]?.text;

      if (errorCode === 'E00007') {
        console.log('\n❌ Error E00007: Authentication failed');
        console.log('   The API Login ID or Transaction Key is invalid');
      } else if (errorCode === 'E00008') {
        console.log('\n✅ E00008: Invalid customer profile (but authentication succeeded!)');
        console.log('   This means your credentials are VALID!');
      } else if (errorCode === 'E00011') {
        console.log('\n✅ E00011: Record not found (but authentication succeeded!)');
        console.log('   This means your credentials are VALID!');
      } else {
        console.log(`\n❓ Error ${errorCode}: ${errorText}`);
      }
    } else if (data.messages?.resultCode === 'Ok') {
      console.log('\n✅ SUCCESS: Credentials are valid and authenticated!');
    }
  })
  .catch((err) => {
    console.error('❌ Connection Error:', err.message);
  });
