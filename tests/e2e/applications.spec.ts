/**
 * Loan Application Flow Tests
 * 
 * Tests for creating loan applications, form validation, and submission
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.APP_URL || 'https://amerilendloan.com';

test.describe('Loan Application Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL || 'test-borrower@testsprite.local');
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD || 'TestPassword123!');
    await page.click('button:has-text("Log In")');
    await expect(page).toHaveURL(/\/(dashboard|home|applications)/, { timeout: 10000 });
  });

  test('should render application form', async ({ page }) => {
    await page.goto(`${BASE_URL}/apply`);
    
    // Check for form fields
    await expect(page.locator('input#loanAmount')).toBeVisible();
    await expect(page.locator('input#loanTerm')).toBeVisible();
    await expect(page.locator('select#loanPurpose')).toBeVisible();
    await expect(page.locator('button:has-text("Apply")')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/apply`);
    
    // Try to submit without filling fields
    await page.click('button:has-text("Apply")');
    
    // Should show validation errors
    await expect(page.locator('text=Loan amount is required')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Loan term is required')).toBeVisible();
  });

  test('should validate loan amount range', async ({ page }) => {
    await page.goto(`${BASE_URL}/apply`);
    
    // Enter invalid loan amount (too low)
    await page.fill('input#loanAmount', '100');
    await page.click('button:has-text("Apply")');
    
    // Should show amount validation error
    await expect(page.locator('text=Minimum loan amount')).toBeVisible({ timeout: 5000 });
  });

  test('should successfully submit application', async ({ page }) => {
    await page.goto(`${BASE_URL}/apply`);
    
    // Fill form with valid data
    await page.fill('input#loanAmount', '5000');
    await page.fill('input#loanTerm', '12');
    await page.selectOption('select#loanPurpose', 'Personal');
    
    // Submit form
    await page.click('button:has-text("Apply")');
    
    // Should show success message or redirect
    await expect(page.locator('text=Application submitted|Application created|Thank you')).toBeVisible({ 
      timeout: 10000 
    });
  });

  test('should display application reference number', async ({ page }) => {
    await page.goto(`${BASE_URL}/apply`);
    
    await page.fill('input#loanAmount', '5000');
    await page.fill('input#loanTerm', '12');
    await page.selectOption('select#loanPurpose', 'Business');
    await page.click('button:has-text("Apply")');
    
    // Wait for success page with ref number
    const refNumber = page.locator('text=Reference:, text=APP-');
    await expect(refNumber).toBeVisible({ timeout: 10000 });
  });

  test('should show application status after submission', async ({ page }) => {
    await page.goto(`${BASE_URL}/apply`);
    
    await page.fill('input#loanAmount', '7500');
    await page.fill('input#loanTerm', '24');
    await page.selectOption('select#loanPurpose', 'Home Improvement');
    await page.click('button:has-text("Apply")');
    
    // Should show status (Pending, Under Review, etc.)
    await expect(page.locator('text=Status|Pending|Under Review')).toBeVisible({ timeout: 10000 });
  });

  test('should allow saving draft application', async ({ page }) => {
    await page.goto(`${BASE_URL}/apply`);
    
    await page.fill('input#loanAmount', '3000');
    await page.fill('input#loanTerm', '6');
    
    // Click save draft if available
    const draftButton = page.locator('button:has-text("Save Draft")');
    if (await draftButton.isVisible()) {
      await draftButton.click();
      await expect(page.locator('text=Draft saved|Application saved')).toBeVisible({ timeout: 5000 });
    }
  });
});
