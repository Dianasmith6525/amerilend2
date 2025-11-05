import { defineConfig } from '@testsprite/testsprite-mcp';

export default defineConfig({
  // Your TestSprite API key
  apiKey: process.env.TESTSPRITE_API_KEY || 'sk-user-0mziUulsZtsdW6D1j6ccG1DkAJCyI9xZPxfcDJiIJnm3_yRSCSVA_NmhAfHnTfcpjfAKA9pvgYk4jD5Nq7fkXBNjp0gAz0rTsWpx-8z6fiw85e6JFZ9cLesXpifWd2AlTFc',
  
  // Project configuration
  projectName: 'AmeriLend',
  baseUrl: 'http://localhost:3003',
  
  // Test settings
  testSettings: {
    // Browser settings
    browser: 'chromium',
    headless: true,
    
    // Viewport
    viewport: {
      width: 1920,
      height: 1080,
    },
    
    // Timeout settings
    timeout: 30000,
    navigationTimeout: 30000,
  },
  
  // Pages to test
  pages: [
    {
      name: 'Home Page',
      path: '/',
      description: 'Main landing page with loan application information',
    },
    {
      name: 'Apply Page',
      path: '/apply',
      description: 'Loan application form',
    },
    {
      name: 'Login Page',
      path: '/login',
      description: 'User login page',
    },
  ],
  
  // Test scenarios
  scenarios: [
    {
      name: 'Homepage Navigation',
      steps: [
        'Visit homepage',
        'Check all navigation links are visible',
        'Click "Apply Now" button',
        'Verify redirect to application page',
      ],
    },
    {
      name: 'State Pagination',
      steps: [
        'Visit homepage',
        'Scroll to "States We Serve" section',
        'Click "Next" button',
        'Verify states change',
        'Click "Previous" button',
        'Verify states change back',
      ],
    },
    {
      name: 'Trust Seals Display',
      steps: [
        'Visit homepage',
        'Scroll to payment methods section',
        'Verify Authorize.Net seal is visible',
        'Verify DigiCert seal is visible',
        'Verify Entrust seal is visible',
      ],
    },
  ],
});
