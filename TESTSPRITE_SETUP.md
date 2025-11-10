# TestSprite Setup Guide for AmeriLend

## What is TestSprite?

TestSprite is an AI-powered automated testing platform that provides:
1. **IDE Integration** - Direct AI assistant support for test generation
2. **E2E Testing Framework** - Playwright-based automated tests
3. **CI/CD Integration** - GitHub Actions workflow for continuous testing

## Configuration

TestSprite has been configured for your AmeriLend project with multiple components:

### Configuration Files
- **`testsprite.config.js`** - Main configuration with environment settings
- **`playwright.config.ts`** - Playwright E2E test runner
- **`.env.test`** - Test environment variables (create locally)
- **`.github/workflows/testsprite.yml`** - CI/CD workflow

### Pre-configured Test Suites

We've created 4 comprehensive test suites with 38+ automated tests:

#### 1. **Authentication Tests** (`tests/e2e/auth.spec.ts` - 8 tests)
- Login page rendering
- Invalid credentials handling  
- Successful login flow
- Logout functionality
- OAuth integrations (Google, Microsoft, Apple)
- Password reset flow

#### 2. **Loan Application Tests** (`tests/e2e/applications.spec.ts` - 8 tests)
- Application form rendering
- Required field validation
- Loan amount validation range
- Successful application submission
- Reference number generation
- Application status display
- Draft saving capability

#### 3. **Payment Processing Tests** (`tests/e2e/payments.spec.ts` - 10 tests)
- Payment page rendering
- Payment method selection (Authorize.net, Stripe, Crypto)
- Authorize.net payment processing
- Stripe payment processing
- Crypto payment processing
- Payment failure handling
- Receipt display and download

#### 4. **API Tests** (`tests/e2e/api.spec.ts` - 12 tests)
- Health check endpoints
- User authentication via API
- User profile retrieval
- Application CRUD operations
- Payment processing API
- Rate limiting validation
- Error message formatting
- CORS configuration

### Pre-configured Test Scenarios

## How to Use TestSprite

### Running Tests Locally

#### Option 1: Run all E2E tests
```bash
npm run test:e2e
```

#### Option 2: Run specific test suite
```bash
npm run test:e2e:auth          # Authentication tests
npm run test:e2e:applications  # Loan application tests
npm run test:e2e:payments      # Payment tests
npm run test:e2e:api           # API tests
```

#### Option 3: Run with interactive UI
```bash
npm run test:e2e:ui
```

#### Option 4: Debug mode
```bash
npm run test:e2e:debug
```

#### Option 5: View test report
```bash
npm run test:e2e:report
```

### Running via Direct Commands

```bash
# Run all tests
npx playwright test

# Run specific file
npx playwright test auth.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run with debug inspector
npx playwright test --debug

# Run specific project/browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Using with IDE AI Assistants

TestSprite is available as an MCP plugin for:
- **GitHub Copilot** in VS Code
- **Cursor IDE**
- **Other MCP-compatible IDEs**

Option 1: Run via npm script

## Test Configuration

You can customize tests by editing `testsprite.config.ts`:

### Add New Pages to Test
\`\`\`typescript
pages: [
  {
    name: 'Dashboard',
    path: '/dashboard',
    description: 'User dashboard',
  },
  // Add more pages...
],
\`\`\`

### Add New Test Scenarios
\`\`\`typescript
scenarios: [
  {
    name: 'User Registration',
    steps: [
      'Visit registration page',
      'Fill in email and password',
      'Submit form',
      'Verify success message',
    ],
  },
  // Add more scenarios...
],
\`\`\`

## Environment Variables

Make sure your `.env` file contains:
\`\`\`
TESTSPRITE_API_KEY=sk-user-0mziUulsZtsdW6D1j6ccG1DkAJCyI9xZPxfcDJiIJnm3_yRSCSVA_NmhAfHnTfcpjfAKA9pvgYk4jD5Nq7fkXBNjp0gAz0rTsWpx-8z6fiw85e6JFZ9cLesXpifWd2AlTFc
\`\`\`

## Running Tests

### Before Running Tests:
1. Make sure your development server is running:
   \`\`\`bash
   npm run dev
   \`\`\`

2. Ensure the application is accessible at `http://localhost:5000`

3. Run the TestSprite tests:
   \`\`\`bash
   npm run test:testsprite
   \`\`\`

## Troubleshooting

### Issue: "Cannot connect to localhost:5000"
**Solution**: Make sure your dev server is running first with `npm run dev`

### Issue: "API Key Invalid"
**Solution**: Check that `TESTSPRITE_API_KEY` in `.env` is correct

### Issue: "Tests timing out"
**Solution**: Increase timeout values in `testsprite.config.ts`:
\`\`\`typescript
testSettings: {
  timeout: 60000, // Increase to 60 seconds
  navigationTimeout: 60000,
}
\`\`\`

## Next Steps

1. **Start your dev server**: `npm run dev`
2. **Run TestSprite tests**: `npm run test:testsprite`
3. **Review test results**: TestSprite will provide detailed reports
4. **Fix any issues**: Use the AI-powered debugging suggestions
5. **Add more tests**: Customize `testsprite.config.ts` for your needs

## Additional Resources

- [TestSprite Documentation](https://testsprite.com/docs)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Your TestSprite Dashboard](https://testsprite.com/dashboard)

---

**Need Help?**
If you encounter issues, check the TestSprite logs or contact TestSprite support.
