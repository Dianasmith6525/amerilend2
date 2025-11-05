#!/usr/bin/env node

/**
 * Diagnostic script to test AmeriLend loan submission
 * This creates a test loan application and checks if it appears in admin dashboard
 */

const API_URL = "http://localhost:3001/api/trpc";

// Test data - realistic application
const testApplication = {
  fullName: "John Smith",
  middleInitial: "A",
  email: "john.smith@gmail.com",
  phone: "+1-555-123-4567",
  dateOfBirth: "1985-06-15",
  ssn: "123-45-6789",
  idType: "drivers_license",
  idNumber: "D123456789",
  maritalStatus: "married",
  dependents: 2,
  citizenshipStatus: "us_citizen",
  priorBankruptcy: 0,
  street: "123 Main Street",
  city: "Springfield",
  state: "IL",
  zipCode: "62701",
  employmentStatus: "employed",
  employer: "ABC Corporation",
  monthlyIncome: 500000, // $5,000 in cents
  loanType: "personal",
  requestedAmount: 500000, // $5,000 in cents
  loanPurpose: "Home renovation and repairs",
  creditCheckConsent: true,
  termsConsent: true,
  privacyConsent: true,
  loanAgreementConsent: true,
  esignConsent: true,
};

async function submitApplication() {
  console.log("🔍 AmeriLend Loan Submission Diagnostic\n");
  
  try {
    // Step 1: Check auth
    console.log("Step 1: Checking authentication...");
    const loginResponse = await fetch(`${API_URL}/auth.getUser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      credentials: "include",
    });

    if (!loginResponse.ok) {
      console.error("❌ Not authenticated. Please log in first at http://localhost:3001");
      return;
    }

    const authData = await loginResponse.json();
    console.log("✅ Authenticated");
    console.log(`   User: ${authData.result?.data?.email || "Unknown"}`);
    console.log(`   Role: ${authData.result?.data?.role || "Unknown"}\n`);

    // Step 2: Submit application
    console.log("Step 2: Submitting loan application...");
    console.log(`   Applicant: ${testApplication.fullName}`);
    console.log(`   Amount: $${testApplication.requestedAmount / 100}`);
    console.log(`   Purpose: ${testApplication.loanPurpose}\n`);

    const submitResponse = await fetch(`${API_URL}/loans.submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: testApplication }),
      credentials: "include",
    });

    const submitData = await submitResponse.json();

    if (!submitResponse.ok || submitData.error) {
      console.error("❌ Submission failed:");
      console.error(`   Error: ${submitData.error?.message || "Unknown error"}`);
      console.error(`   Code: ${submitData.error?.code || "Unknown"}`);
      return;
    }

    const loanId = submitData.result?.data?.id;
    console.log("✅ Application submitted successfully!");
    console.log(`   Loan ID: ${loanId}`);
    console.log(`   Status: ${submitData.result?.data?.status}\n`);

    // Step 3: Verify application appears in list
    console.log("Step 3: Fetching user applications...");
    const myAppsResponse = await fetch(`${API_URL}/loans.myApplications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      credentials: "include",
    });

    const myAppsData = await myAppsResponse.json();
    const userApps = myAppsData.result?.data || [];

    console.log(`✅ Found ${userApps.length} application(s) for user`);
    userApps.forEach((app, i) => {
      console.log(`   [${i + 1}] Loan #${app.id} - Status: ${app.status} - Amount: $${app.requestedAmount / 100}`);
    });
    console.log();

    // Step 4: Check if admin can see it
    console.log("Step 4: Checking admin view...");
    const adminListResponse = await fetch(`${API_URL}/loans.adminList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
      credentials: "include",
    });

    if (adminListResponse.ok) {
      const adminData = adminListResponse.json();
      const adminApps = (await adminData).result?.data || [];
      console.log(`✅ Admin can see ${adminApps.length} application(s) total`);
      
      // Find our test application
      const foundApp = adminApps.find((app) => app.id === loanId);
      if (foundApp) {
        console.log(`✅ Test application #${loanId} visible in admin view!`);
        console.log(`   Name: ${foundApp.fullName}`);
        console.log(`   Status: ${foundApp.status}`);
      } else {
        console.log(`⚠️  Test application #${loanId} NOT visible in admin view`);
      }
    } else {
      console.log("⚠️  Could not verify admin view (may require admin role)");
    }

    console.log("\n✅ Diagnostic complete!\n");
    console.log("Next steps:");
    console.log("1. Go to Admin Dashboard: http://localhost:3001/admin");
    console.log("2. You should now see the test application");
    console.log("3. Click 'Approve' to approve it");
    console.log("4. Click 'Pay' to process the payment\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("\nTroubleshooting:");
    console.error("- Is the server running? npm run dev");
    console.error("- Are you logged in? Visit http://localhost:3001");
    console.error("- Check browser console for errors");
  }
}

submitApplication();
