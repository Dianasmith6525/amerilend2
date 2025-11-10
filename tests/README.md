# TestSprite E2E Testing Guide

This directory contains end-to-end (E2E) tests for the AmeriLend loan application using TestSprite and Playwright.

## Setup

### 1. Install Dependencies

```bash
npm install --save-dev @playwright/test @testsprite/sdk
```

### 2. Configure Environment Variables

Create a `.env.test` file in the root directory:

```env
# Application URLs
APP_URL=https://amerilendloan.com
API_URL=https://amerilendloan.com/api

# Test User Credentials
TEST_USER_EMAIL=test-borrower@testsprite.local
TEST_USER_PASSWORD=TestPassword123!
TEST_ADMIN_EMAIL=test-admin@testsprite.local
TEST_ADMIN_PASSWORD=AdminPassword123!

# TestSprite Configuration
TESTSPRITE_PROJECT_ID=amerilend-loan-app
TESTSPRITE_API_KEY=your_api_key_here

# Slack Integration (optional)
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### 3. Update GitHub Secrets

Add these secrets to your GitHub repository settings:

- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`
- `TEST_ADMIN_EMAIL`
- `TEST_ADMIN_PASSWORD`
- `TESTSPRITE_PROJECT_ID`
- `TESTSPRITE_API_KEY`
- `SLACK_WEBHOOK` (optional)

## Running Tests Locally

### Run All Tests

```bash
npx playwright test
```

### Run Specific Test File

```bash
npx playwright test tests/e2e/auth.spec.ts
```

### Run Tests in Headed Mode (see browser)

```bash
npx playwright test --headed
```

### Run Tests with Debugging

```bash
npx playwright test --debug
```

### Run Tests in Slow Motion

```bash
npx playwright test --slow-mo 1000
```

### Run Tests in Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

Tests are organized by feature/functionality:

### `auth.spec.ts`
- Login/Logout
- Password reset
- OAuth integrations (Google, Microsoft, Apple)
- Session management

### `applications.spec.ts`
- Loan application form rendering
- Form validation
- Application submission
- Draft saving
- Reference number generation

### `payments.spec.ts`
- Payment page rendering
- Payment method selection
- Authorize.net payments
- Stripe payments
- Crypto payments
- Payment receipts

### `api.spec.ts`
- tRPC endpoint tests
- Authentication via API
- Application CRUD operations
- Payment processing
- Rate limiting
- Error handling

## Writing New Tests

### Test Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.fill('input#email', 'test@example.com');
    
    // Act
    await page.click('button:has-text("Submit")');
    
    // Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use data-testid attributes** for reliable element selection:
   ```html
   <button data-testid="submit-btn">Submit</button>
   ```

2. **Wait for elements** instead of using fixed delays:
   ```typescript
   await expect(page.locator('text=Loaded')).toBeVisible({ timeout: 10000 });
   ```

3. **Use meaningful test names**:
   ```typescript
   // Good
   test('should show validation error for empty email field')
   
   // Bad
   test('test form')
   ```

4. **Isolate tests** - each test should be independent:
   ```typescript
   test.beforeEach(async ({ page }) => {
     // Reset state before each test
   });
   ```

## CI/CD Integration

Tests run automatically on:
- Push to `master`, `main`, or `develop` branches
- Pull requests to these branches
- Daily schedule (2 AM UTC)

### GitHub Actions Workflow

The workflow is defined in `.github/workflows/testsprite.yml` and:

1. Checks out the code
2. Installs dependencies
3. Installs Playwright browsers
4. Runs tests against production
5. Uploads test results and videos
6. Comments on PRs with results
7. Notifies Slack on failures

## Viewing Test Results

### Locally

```bash
# Open HTML report
npx playwright show-report
```

### In GitHub Actions

1. Go to the workflow run
2. Click "Artifacts" to download reports
3. Extract and open `playwright-report/index.html` in browser

## Troubleshooting

### Tests Timing Out

- Increase timeout: `test.setTimeout(60000)` (60 seconds)
- Check if app is running
- Check network connectivity

### Element Not Found

- Verify element exists in DOM
- Use `page.pause()` to debug
- Check for CSS selectors or data-testid

### Authentication Issues

- Verify credentials in `.env.test`
- Check if test user account exists
- Verify OAuth configurations

### Payment Test Failures

- Use test card numbers (e.g., `4111111111111111`)
- Verify payment processor credentials
- Check for rate limiting

## Useful Commands

```bash
# Install Playwright
npm install -D @playwright/test

# Run all tests
npm test

# Run with UI
npx playwright test --ui

# Run specific test
npx playwright test auth

# Debug mode
npx playwright test --debug

# Update snapshots
npx playwright test --update-snapshots

# Generate report
npx playwright show-report
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [TestSprite Documentation](https://www.testsprite.com/docs)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)

## Support

For issues or questions:

1. Check [Playwright Docs](https://playwright.dev)
2. Review test examples in this directory
3. Run tests in debug mode: `npx playwright test --debug`
4. Check GitHub Actions logs for CI failures
