/**
 * API Tests
 * 
 * Tests for tRPC endpoints and REST API functionality
 */

import { test, expect } from '@playwright/test';

const API_URL = process.env.API_URL || 'https://amerilendloan.com/api';
const TRPC_URL = `${API_URL}/trpc`;

test.describe('API Endpoints', () => {
  
  let authToken: string;
  
  test.beforeAll(async ({ request }) => {
    // Get auth token for authenticated requests
    const loginResponse = await request.post(`${TRPC_URL}`, {
      data: {
        '0': {
          json: {
            email: process.env.TEST_USER_EMAIL || 'test-borrower@testsprite.local',
            password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
          },
        },
      },
    });
    
    if (loginResponse.ok()) {
      const responseData = await loginResponse.json();
      authToken = responseData.result?.data?.sessionToken || '';
    }
  });

  test('should return 200 for health check', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    expect(response.status()).toBe(200);
  });

  test('should authenticate with valid credentials', async ({ request }) => {
    const response = await request.post(`${TRPC_URL}`, {
      data: {
        '0': {
          json: {
            email: process.env.TEST_USER_EMAIL || 'test-borrower@testsprite.local',
            password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
          },
        },
      },
    });
    
    expect(response.status()).toBe(200);
    const responseData = await response.json();
    expect(responseData.result?.data?.sessionToken || responseData.result?.data?.user).toBeDefined();
  });

  test('should reject invalid credentials', async ({ request }) => {
    const response = await request.post(`${TRPC_URL}`, {
      data: {
        '0': {
          json: {
            email: 'invalid@test.local',
            password: 'wrongpassword',
          },
        },
      },
    });
    
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should get user profile', async ({ request }) => {
    if (!authToken) test.skip();
    
    const response = await request.get(`${TRPC_URL}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    expect(response.status()).toBe(200);
    const responseData = await response.json();
    expect(responseData.result?.data?.email).toBeDefined();
  });

  test('should list applications', async ({ request }) => {
    const response = await request.post(`${TRPC_URL}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        '0': {
          json: {},
        },
      },
    });
    
    expect(response.status()).toBe(200);
    const responseData = await response.json();
    expect(Array.isArray(responseData.result?.data)).toBe(true);
  });

  test('should create loan application', async ({ request }) => {
    const response = await request.post(`${TRPC_URL}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      data: {
        '0': {
          json: {
            loanAmount: 5000,
            loanTerm: 12,
            loanPurpose: 'Personal',
          },
        },
      },
    });
    
    expect(response.status()).toBe(200);
    const responseData = await response.json();
    expect(responseData.result?.data?.applicationId).toBeDefined();
  });

  test('should return rate limit error after too many requests', async ({ request }) => {
    // Make multiple rapid requests
    const requests = Array(11).fill(null).map(() =>
      request.get(`${API_URL}/health`)
    );
    
    const responses = await Promise.all(requests);
    
    // At least one should be rate limited
    const rateLimited = responses.some(r => r.status() === 429);
    expect(rateLimited).toBe(true);
  });

  test('should validate required fields on application submission', async ({ request }) => {
    const response = await request.post(`${TRPC_URL}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      data: {
        '0': {
          json: {
            // Missing required fields
          },
        },
      },
    });
    
    expect(response.status()).toBeGreaterThanOrEqual(400);
    const responseData = await response.json();
    expect(responseData.error || responseData.result?.error).toBeDefined();
  });

  test('should process payment via API', async ({ request }) => {
    const response = await request.post(`${TRPC_URL}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      data: {
        '0': {
          json: {
            applicationId: 'TEST-APP-001',
            amount: 100,
            paymentMethod: 'authorize_net',
            cardNumber: '4111111111111111',
            expiryDate: '12/25',
            cvv: '123',
          },
        },
      },
    });
    
    expect(response.status()).toBe(200);
    const responseData = await response.json();
    expect(responseData.result?.data?.transactionId || responseData.result?.data?.success).toBeDefined();
  });

  test('should handle CORS properly', async ({ request }) => {
    const response = await request.options(`${TRPC_URL}`, {
      headers: {
        'Origin': 'https://amerilendloan.com',
      },
    });
    
    // Should allow CORS or return 200 for OPTIONS
    expect([200, 204]).toContain(response.status());
    expect(response.headers()['access-control-allow-origin']).toBeDefined();
  });

  test('should return proper error messages', async ({ request }) => {
    const response = await request.post(`${TRPC_URL}/nonexistent`, {
      data: { test: 'data' },
    });
    
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });
});
