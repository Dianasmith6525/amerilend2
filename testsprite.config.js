/**
 * TestSprite Configuration
 * 
 * This configuration file sets up TestSprite for automated testing
 * of the AmeriLend loan application.
 * 
 * @see https://www.testsprite.com
 */

module.exports = {
  // Project metadata
  projectName: "AmeriLend",
  projectId: process.env.TESTSPRITE_PROJECT_ID || "amerilend-loan-app",
  
  // API Configuration
  api: {
    baseUrl: process.env.TESTSPRITE_API_URL || "https://api.testsprite.com",
    apiKey: process.env.TESTSPRITE_API_KEY,
    timeout: 30000, // 30 seconds
  },

  // Application Under Test
  app: {
    baseUrl: process.env.APP_URL || "https://amerilendloan.com",
    apiUrl: process.env.API_URL || "https://amerilendloan.com/api",
    environment: process.env.NODE_ENV || "production",
  },

  // Test Configuration
  test: {
    // Browser/Driver settings
    headless: process.env.HEADLESS !== "false", // Run in headless mode by default
    browser: process.env.BROWSER || "chromium", // chromium, firefox, webkit
    slowMo: parseInt(process.env.SLOW_MO || "0"), // Slow down operations by ms
    timeout: 30000, // Test timeout
    retries: 2, // Retry failed tests

    // Parallel execution
    workers: process.env.WORKERS ? parseInt(process.env.WORKERS) : 1,
    maxFailures: 3, // Stop after N failures

    // Screenshots and videos
    screenshot: "only-on-failure", // on|off|only-on-failure
    video: "retain-on-failure", // on|off|retain-on-failure
    trace: "on-first-retry", // on|off|on-first-retry
  },

  // Test Categories
  testCategories: {
    auth: {
      enabled: true,
      description: "Authentication and authorization tests",
    },
    pages: {
      enabled: true,
      description: "Page rendering and navigation tests",
    },
    forms: {
      enabled: true,
      description: "Form submission and validation tests",
    },
    payments: {
      enabled: true,
      description: "Payment processing tests",
    },
    api: {
      enabled: true,
      description: "API endpoint tests",
    },
    accessibility: {
      enabled: false, // Optional
      description: "WCAG accessibility tests",
    },
  },

  // Test Data
  testData: {
    users: [
      {
        email: "test-borrower@testsprite.local",
        password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
        role: "borrower",
      },
      {
        email: "test-admin@testsprite.local",
        password: process.env.TEST_ADMIN_PASSWORD || "AdminPassword123!",
        role: "admin",
      },
    ],
    applications: [
      {
        loanAmount: 5000,
        loanTerm: 12,
        purpose: "Personal",
      },
      {
        loanAmount: 10000,
        loanTerm: 24,
        purpose: "Home Improvement",
      },
    ],
    payments: [
      {
        method: "authorize_net",
        amount: 100,
      },
      {
        method: "crypto",
        amount: 0.05,
      },
    ],
  },

  // Reporting
  reporting: {
    outputDir: process.env.REPORT_DIR || "./test-results",
    format: ["html", "json", "junit"], // html, json, junit, markdown
    uploadResults: process.env.UPLOAD_RESULTS === "true",
  },

  // Integrations
  integrations: {
    github: {
      enabled: true,
      owner: "Dianasmith6525",
      repo: "amerilend2",
      reportStatus: true, // Post results as PR checks
    },
    slack: {
      enabled: process.env.SLACK_WEBHOOK ? true : false,
      webhookUrl: process.env.SLACK_WEBHOOK,
      channel: "#qa-tests",
      notifyOnFailure: true,
    },
  },

  // Custom headers and auth
  httpHeaders: {
    "User-Agent": "TestSprite-AmeriLend/1.0",
    "X-Test-Mode": "true",
  },

  // Environment-specific overrides
  environments: {
    local: {
      app: {
        baseUrl: "http://localhost:5173",
        apiUrl: "http://localhost:5173/api",
      },
      test: {
        headless: false,
        slowMo: 100,
        workers: 1,
      },
    },
    staging: {
      app: {
        baseUrl: "https://staging.amerilendloan.com",
        apiUrl: "https://staging.amerilendloan.com/api",
      },
      test: {
        workers: 2,
      },
    },
    production: {
      app: {
        baseUrl: "https://amerilendloan.com",
        apiUrl: "https://amerilendloan.com/api",
      },
      test: {
        workers: 4,
        retries: 3, // Higher retries in prod
      },
    },
  },
};
