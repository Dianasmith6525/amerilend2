/**
 * Payment Processing Tests
 * 
 * Tests for payment flows including Authorize.net, Stripe, and Crypto payments
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_URL || 'https://amerilendloan.com';

test.describe('Payment Processing', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test-borrower@testsprite.local');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    await page.click('button:has-text("Log In")');
    await expect(page).toHaveURL(/\/(dashboard|home|applications)/, { timeout: 10000 });
  });

  test('should display payment page for application', async ({ page }) => {
    // Navigate to payment page for an application
    await page.goto(`${BASE_URL}/payment/TEST-APP-001`);
    
    // Check for payment form
    await expect(page.locator('text=Payment|Amount|Method')).toBeVisible();
    await expect(page.locator('select#paymentMethod, [name="paymentMethod"]')).toBeVisible();
  });

  test('should show payment methods', async ({ page }) => {
    await page.goto(`${BASE_URL}/payment/TEST-APP-001`);
    
    // Check for available payment methods
    const paymentMethods = page.locator('input[type="radio"][name="paymentMethod"]');
    const count = await paymentMethods.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should process Authorize.net payment', async ({ page }) => {
    await page.goto(`${BASE_URL}/payment/TEST-APP-001`);
    
    // Select Authorize.net
    await page.selectOption('select#paymentMethod', 'authorize_net');
    
    // Fill card details (use test card)
    await page.fill('input[name="cardNumber"]', '4111111111111111');
    await page.fill('input[name="expiryDate"]', '12/25');
    await page.fill('input[name="cvv"]', '123');
    
    // Submit payment
    await page.click('button:has-text("Pay Now")');
    
    // Should show success or processing message
    await expect(page.locator('text=Processing|Success|Thank you')).toBeVisible({ 
      timeout: 15000 
    });
  });

  test('should process Stripe payment', async ({ page }) => {
    await page.goto(`${BASE_URL}/payment/TEST-APP-001`);
    
    // Select Stripe if available
    const stripeOption = page.locator('input[value="stripe"]');
    if (await stripeOption.isVisible()) {
      await stripeOption.click();
      
      // Fill Stripe form
      const stripeFrame = page.frameLocator('iframe[src*="stripe"]').first();
      if (stripeFrame) {
        // Stripe uses iframe, so we interact through frameLocator
        await page.click('button:has-text("Pay Now")');
        
        // Should process or show Stripe modal
        await expect(page.locator('text=Processing|Payment|Stripe')).toBeVisible({ 
          timeout: 15000 
        });
      }
    }
  });

  test('should process Crypto payment', async ({ page }) => {
    await page.goto(`${BASE_URL}/payment/TEST-APP-001`);
    
    // Select Crypto if available
    const cryptoOption = page.locator('input[value="crypto"]');
    if (await cryptoOption.isVisible()) {
      await cryptoOption.click();
      
      // Should show crypto payment instructions
      await expect(page.locator('text=Wallet|Address|Bitcoin|Ethereum')).toBeVisible();
      
      await page.click('button:has-text("Pay|Continue")');
      
      // Should show wallet address or QR code
      await expect(page.locator('text=Send|Transfer|Address|QR')).toBeVisible({ 
        timeout: 10000 
      });
    }
  });

  test('should validate payment amount', async ({ page }) => {
    await page.goto(`${BASE_URL}/payment/TEST-APP-001`);
    
    // Try to enter invalid amount
    const amountField = page.locator('input#amount, input[name="amount"]');
    if (await amountField.isVisible()) {
      await amountField.fill('0');
      await page.click('button:has-text("Pay Now")');
      
      // Should show validation error
      await expect(page.locator('text=Invalid amount|must be greater')).toBeVisible({ 
        timeout: 5000 
      });
    }
  });

  test('should handle payment failure gracefully', async ({ page }) => {
    await page.goto(`${BASE_URL}/payment/TEST-APP-001`);
    
    // Select payment method
    await page.selectOption('select#paymentMethod', 'authorize_net');
    
    // Use failed test card (4111111111111110)
    await page.fill('input[name="cardNumber"]', '4111111111111110');
    await page.fill('input[name="expiryDate"]', '12/25');
    await page.fill('input[name="cvv"]', '123');
    
    await page.click('button:has-text("Pay Now")');
    
    // Should show error message
    await expect(page.locator('text=Payment failed|declined|error')).toBeVisible({ 
      timeout: 10000 
    });
  });

  test('should display payment receipt after success', async ({ page }) => {
    // Assuming payment was successful, check for receipt
    await page.goto(`${BASE_URL}/payment-receipt/TEST-PAYMENT-001`);
    
    // Check for receipt elements
    await expect(page.locator('text=Receipt|Transaction|Amount|Date')).toBeVisible();
    await expect(page.locator('button:has-text("Download|Print")')).toBeVisible();
  });

  test('should allow downloading payment receipt', async ({ page, context }) => {
    await page.goto(`${BASE_URL}/payment-receipt/TEST-PAYMENT-001`);
    
    // Listen for download
    const downloadPromise = context.waitForEvent('download');
    
    await page.click('button:has-text("Download")');
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/receipt|payment.*\.(pdf|png)/i);
  });
});
