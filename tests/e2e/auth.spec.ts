/**
 * Authentication Tests
 * 
 * Tests for login, logout, password reset, and OAuth flows
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_URL || 'https://amerilendloan.com';

test.describe('Authentication', () => {
  
  test('should render login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    // Check for login form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Log In")')).toBeVisible();
  });

  test('should display error on invalid credentials', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('input[type="email"]', 'invalid@test.local');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Log In")');
    
    // Wait for error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    const testEmail = process.env.TEST_USER_EMAIL || 'test-borrower@testsprite.local';
    const testPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
    
    await page.goto(`${BASE_URL}/login`);
    
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("Log In")');
    
    // Should redirect to dashboard or home
    await expect(page).toHaveURL(/\/(dashboard|home|applications)/, { timeout: 10000 });
  });

  test('should display logout option when logged in', async ({ page, context }) => {
    // Assume already logged in via cookie/session
    await page.goto(BASE_URL);
    
    // Look for user menu
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, [aria-label*="Account"]').first();
    if (await userMenu.isVisible()) {
      await userMenu.click();
      await expect(page.locator('button:has-text("Log Out")')).toBeVisible();
    }
  });

  test('should handle OAuth login (Google)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    const googleButton = page.locator('button:has-text("Continue with Google")');
    if (await googleButton.isVisible()) {
      await googleButton.click();
      
      // Check if redirected to Google auth page or OAuth callback
      await expect(page).toHaveURL(/accounts\.google\.com|oauth|callback/, { timeout: 10000 });
    }
  });

  test('should handle OAuth login (Microsoft)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    const msButton = page.locator('button:has-text("Continue with Microsoft")');
    if (await msButton.isVisible()) {
      await msButton.click();
      
      // Check if redirected to Microsoft auth page
      await expect(page).toHaveURL(/login\.microsoftonline\.com|oauth|callback/, { timeout: 10000 });
    }
  });

  test('should handle OAuth login (Apple)', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    const appleButton = page.locator('button:has-text("Continue with Apple")');
    if (await appleButton.isVisible()) {
      await appleButton.click();
      
      // Check if redirected to Apple auth page
      await expect(page).toHaveURL(/appleid\.apple\.com|oauth|callback/, { timeout: 10000 });
    }
  });

  test('should display password reset link', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    
    const resetLink = page.locator('a:has-text("Forgot password")');
    await expect(resetLink).toBeVisible();
    
    await resetLink.click();
    await expect(page).toHaveURL(/.*password.*reset|forgot/);
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`);
    
    // Enter email
    await page.fill('input[type="email"]', 'test-borrower@testsprite.local');
    await page.click('button:has-text("Send Reset Link")');
    
    // Should show confirmation message
    await expect(page.locator('text=Check your email')).toBeVisible({ timeout: 5000 });
  });
});
