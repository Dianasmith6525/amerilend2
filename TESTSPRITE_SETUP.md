# TestSprite Setup Guide for AmeriLend

## What is TestSprite?

TestSprite is an AI-powered automated testing tool that integrates with your IDE to automatically generate, execute, and debug integration tests for your web application.

## Configuration

TestSprite has been configured for your AmeriLend project with the following settings:

### Configuration File
- **Location**: `testsprite.config.ts`
- **API Key**: Stored in `.env` as `TESTSPRITE_API_KEY`
- **Base URL**: `http://localhost:5000` (your dev server)

### Pre-configured Test Scenarios

1. **Homepage Navigation**
   - Tests all navigation links
   - Verifies "Apply Now" button functionality
   - Checks page redirects

2. **State Pagination**
   - Tests the new state navigation buttons (Previous/Next)
   - Verifies state list changes correctly
   - Ensures pagination works on all devices

3. **Trust Seals Display**
   - Verifies Authorize.Net seal loads correctly
   - Checks DigiCert seal visibility
   - Confirms Entrust seal displays

## How to Use TestSprite

### Option 1: Run via npm script
\`\`\`bash
npm run test:testsprite
\`\`\`

### Option 2: Run via npx directly
\`\`\`bash
npx @testsprite/testsprite-mcp
\`\`\`

### Option 3: Use with your IDE's AI assistant

Since TestSprite is an MCP (Model Context Protocol) plugin, it can be used directly within your IDE through AI assistants like:
- GitHub Copilot
- Cursor
- Other MCP-compatible tools

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
