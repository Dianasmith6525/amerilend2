import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { ChevronLeft } from "lucide-react";

interface GuideContent {
  [key: string]: {
    title: string;
    description: string;
    content: string;
  };
}

const guideContent: GuideContent = {
  "personal-loan": {
    title: "Personal Loan Complete Guide",
    description: "Learn everything about personal loans, from how to apply to managing your loan responsibly.",
    content: `
      <h2>What is a Personal Loan?</h2>
      <p>A personal loan is a lump sum of money that you borrow from a lender and agree to repay over a fixed period with interest. Unlike credit cards (revolving credit), personal loans are installment loans—you receive the full amount upfront and make fixed monthly payments.</p>

      <h2>Loan Amounts and Terms</h2>
      <p>Personal loans typically range from $1,000 to $100,000, with repayment terms of 2 to 7 years. The amount and term you qualify for depend on your credit score, income, employment history, and existing debt.</p>
      <ul>
        <li><strong>Small Loans:</strong> $1,000-$5,000 - Quick approval, for small emergencies or purchases</li>
        <li><strong>Medium Loans:</strong> $5,000-$25,000 - Most common for debt consolidation or major purchases</li>
        <li><strong>Large Loans:</strong> $25,000-$100,000 - Requires excellent credit for home improvements or business needs</li>
      </ul>

      <h2>The Application Process</h2>
      <p>Getting a personal loan involves several steps:</p>
      <ol>
        <li><strong>Pre-Qualification:</strong> Get an estimate without affecting your credit score</li>
        <li><strong>Formal Application:</strong> Submit detailed financial information</li>
        <li><strong>Credit Check:</strong> Lender reviews your credit history</li>
        <li><strong>Verification:</strong> Income and employment verification</li>
        <li><strong>Approval Decision:</strong> Lender approves or denies within 1-5 business days</li>
        <li><strong>Funding:</strong> Money deposited to your account within 1-3 business days</li>
      </ol>

      <h2>Repayment Options</h2>
      <p>Personal loans offer flexible repayment options:</p>
      <ul>
        <li><strong>Fixed Monthly Payments:</strong> Same payment every month for predictable budgeting</li>
        <li><strong>Early Repayment:</strong> Many loans allow prepayment without penalty to save on interest</li>
        <li><strong>Automatic Payments:</strong> Set up recurring payments directly from your bank account</li>
        <li><strong>Manual Payments:</strong> Pay online, by phone, or through automatic transfers</li>
      </ul>

      <h2>Best Uses for Personal Loans</h2>
      <ul>
        <li><strong>Debt Consolidation:</strong> Combine high-interest credit card debt into one lower-rate loan</li>
        <li><strong>Home Improvements:</strong> Finance renovations or repairs</li>
        <li><strong>Medical Expenses:</strong> Cover unexpected healthcare costs</li>
        <li><strong>Emergencies:</strong> Handle urgent financial needs</li>
        <li><strong>Education:</strong> Pay for courses or certifications</li>
        <li><strong>Major Purchases:</strong> Buy appliances, furniture, or other big-ticket items</li>
        <li><strong>Vacation:</strong> Finance a dream trip</li>
      </ul>

      <h2>Personal Loan Advantages</h2>
      <ul>
        <li>Fixed monthly payments make budgeting easier</li>
        <li>Lower interest rates than credit cards (typically 6-36%)</li>
        <li>Faster approval and funding than secured loans</li>
        <li>Can improve credit score through on-time payments</li>
        <li>No collateral required for unsecured loans</li>
        <li>Flexible use of funds</li>
      </ul>

      <h2>Personal Loan Disadvantages</h2>
      <ul>
        <li>Origination fees (1-6% of loan amount)</li>
        <li>Prepayment penalties on some loans</li>
        <li>Hard credit inquiry can lower credit score temporarily</li>
        <li>Higher rates for those with poor credit</li>
        <li>Monthly payment obligation regardless of circumstances</li>
      </ul>

      <h2>Key Factors That Affect Your Rate</h2>
      <ul>
        <li><strong>Credit Score:</strong> Higher scores get lower rates</li>
        <li><strong>Income:</strong> Stable, higher income gets better rates</li>
        <li><strong>Debt-to-Income Ratio:</strong> Lower ratio means lower rates</li>
        <li><strong>Employment History:</strong> Longer tenure improves rates</li>
        <li><strong>Loan Amount:</strong> Larger loans sometimes get better rates</li>
        <li><strong>Loan Term:</strong> Shorter terms typically have lower rates</li>
      </ul>

      <h2>Tips for Getting Approved</h2>
      <ul>
        <li>Check your credit score before applying</li>
        <li>Gather income verification documents (pay stubs, tax returns)</li>
        <li>Reduce your debt-to-income ratio if possible</li>
        <li>Shop around with multiple lenders</li>
        <li>Consider a co-signer if your credit is weak</li>
        <li>Be honest about why you need the loan</li>
      </ul>

      <h2>Managing Your Loan Responsibly</h2>
      <ul>
        <li>Make payments on time every month</li>
        <li>Set up automatic payments to avoid missing due dates</li>
        <li>Don't take on new debt while repaying</li>
        <li>Consider paying extra when possible to reduce interest</li>
        <li>Track your balance and payment progress</li>
        <li>Contact your lender immediately if you face hardship</li>
      </ul>

      <h2>Getting Started</h2>
      <p>Ready to explore personal loan options? Contact AmeriLend today for a free pre-qualification or apply online in just minutes. Our experts are here to help you find the right loan for your needs.</p>
    `
  },
  "auto-loans": {
    title: "Auto Loans Guide",
    description: "Complete guide to financing your vehicle purchase with favorable terms.",
    content: `
      <h2>Understanding Auto Loans</h2>
      <p>An auto loan is a secured loan backed by the vehicle you're purchasing. The lender holds the title until you've paid off the loan, giving them security if you default. Because the loan is secured, auto loan rates are typically lower than unsecured personal loans.</p>

      <h2>New vs Used Vehicle Loans</h2>
      <p><strong>New Vehicle Loans:</strong></p>
      <ul>
        <li>Rates typically 4-7% for excellent credit</li>
        <li>Longer loan terms available (up to 84 months)</li>
        <li>Manufacturer incentives and rebates available</li>
        <li>Full factory warranty coverage</li>
        <li>Higher overall cost due to depreciation</li>
      </ul>

      <p><strong>Used Vehicle Loans:</strong></p>
      <ul>
        <li>Rates typically 5-10% depending on vehicle age and credit</li>
        <li>Vehicle must usually be newer than 10 years old</li>
        <li>Lower sticker price than new vehicles</li>
        <li>May require vehicle inspection</li>
        <li>Limited or no manufacturer warranty</li>
      </ul>

      <h2>How Auto Loan Rates Are Calculated</h2>
      <p>Your auto loan rate depends on:</p>
      <ul>
        <li><strong>Credit Score:</strong> 750+ gets best rates; below 600 gets highest rates</li>
        <li><strong>Loan-to-Value (LTV) Ratio:</strong> Smaller down payments = higher rates</li>
        <li><strong>Vehicle Type:</strong> Luxury vehicles may have higher rates</li>
        <li><strong>Loan Term:</strong> Longer terms mean higher rates</li>
        <li><strong>Employment History:</strong> Stable employment improves rates</li>
      </ul>

      <h2>Down Payment Requirements</h2>
      <p>The down payment you can afford significantly impacts your loan:</p>
      <ul>
        <li><strong>No Money Down:</strong> 0% down financing available but at higher rates</li>
        <li><strong>Small Down Payment:</strong> 10% ($3,000 on $30,000 car) reduces payments and interest</li>
        <li><strong>Standard Down Payment:</strong> 20% ($6,000 on $30,000 car) gets better rates</li>
        <li><strong>Large Down Payment:</strong> 30%+ (down payment) gets lowest rates</li>
      </ul>

      <h2>The Trade-In Process</h2>
      <p>If you're trading in your current vehicle:</p>
      <ol>
        <li>Get your trade-in value appraised</li>
        <li>Use the trade-in value toward your down payment</li>
        <li>The dealer handles the title transfer</li>
        <li>Any equity from your trade-in reduces your new loan amount</li>
      </ol>

      <h2>Loan Terms and Repayment</h2>
      <table>
        <tr>
          <td><strong>Loan Term</strong></td>
          <td><strong>Monthly Payment</strong></td>
          <td><strong>Total Interest</strong></td>
          <td><strong>Best For</strong></td>
        </tr>
        <tr>
          <td>36 months</td>
          <td>Higher</td>
          <td>Lower</td>
          <td>Quick payoff, less interest</td>
        </tr>
        <tr>
          <td>48 months</td>
          <td>Moderate</td>
          <td>Moderate</td>
          <td>Balanced approach</td>
        </tr>
        <tr>
          <td>60 months</td>
          <td>Moderate</td>
          <td>Higher</td>
          <td>Lower payments, more interest</td>
        </tr>
        <tr>
          <td>72 months</td>
          <td>Lower</td>
          <td>Highest</td>
          <td>Lowest payments, most interest</td>
        </tr>
      </table>

      <h2>Auto Insurance Requirements</h2>
      <p>Lenders require comprehensive and collision insurance while you're paying off the loan. This protects both you and the lender. Insurance costs should be factored into your total vehicle expense.</p>

      <h2>Protecting Your Investment</h2>
      <ul>
        <li>Choose a reliable vehicle brand with good resale value</li>
        <li>Get a pre-purchase inspection if buying used</li>
        <li>Maintain your vehicle regularly to avoid costly repairs</li>
        <li>Keep comprehensive insurance coverage</li>
        <li>Track your loan balance and payoff date</li>
      </ul>

      <h2>Getting Started With an Auto Loan</h2>
      <p>Ready to finance your next vehicle? Contact AmeriLend for auto loan options. We work with borrowers of all credit levels to find competitive rates and terms that fit your budget.</p>
    `
  },
  "debt-consolidation": {
    title: "Debt Consolidation Guide",
    description: "Simplify your finances by combining multiple debts into a single payment.",
    content: `
      <h2>What is Debt Consolidation?</h2>
      <p>Debt consolidation combines multiple debts (credit cards, loans, medical bills) into a single loan with one monthly payment. This simplifies your finances and can save money on interest if the new loan's rate is lower than your existing debts.</p>

      <h2>How Debt Consolidation Works</h2>
      <ol>
        <li>Apply for a consolidation loan</li>
        <li>Get approved for an amount equal to your total debts</li>
        <li>Use the loan proceeds to pay off all existing debts</li>
        <li>Make one monthly payment to your new lender</li>
      </ol>

      <h2>Real Consolidation Example</h2>
      <p><strong>Before Consolidation:</strong></p>
      <ul>
        <li>Credit Card A: $5,000 at 18% APR = $92/month</li>
        <li>Credit Card B: $3,000 at 20% APR = $68/month</li>
        <li>Personal Loan: $2,000 at 12% APR = $38/month</li>
        <li><strong>Total: 3 payments totaling $198/month</strong></li>
      </ul>

      <p><strong>After Consolidation:</strong></p>
      <ul>
        <li>Consolidation Loan: $10,000 at 10% APR = $161/month</li>
        <li><strong>Total: 1 payment of $161/month</strong></li>
        <li><strong>Monthly Savings: $37</strong></li>
      </ul>

      <h2>Benefits of Consolidation</h2>
      <ul>
        <li><strong>Lower Interest Rate:</strong> Personal loan rates often beat credit card rates</li>
        <li><strong>One Payment:</strong> Easier to track and manage</li>
        <li><strong>Predictable Budget:</strong> Fixed payment for fixed term</li>
        <li><strong>Better Credit Utilization:</strong> Paying off cards improves credit score</li>
        <li><strong>Less Stress:</strong> Simpler financial picture</li>
        <li><strong>Faster Payoff:</strong> Structured repayment timeline</li>
      </ul>

      <h2>Risks of Consolidation</h2>
      <ul>
        <li><strong>Longer Repayment:</strong> Lower payments mean more years in debt</li>
        <li><strong>Total Interest:</strong> Extended term can mean more interest paid overall</li>
        <li><strong>Temptation to Spend:</strong> Free credit card balances tempt overspending</li>
        <li><strong>Fees:</strong> Origination fees can offset savings</li>
        <li><strong>Credit Impact:</strong> Initial dip in credit score when you apply</li>
      </ul>

      <h2>Is Consolidation Right for You?</h2>
      <p><strong>Good for consolidation:</strong></p>
      <ul>
        <li>High-interest credit card debt</li>
        <li>Multiple monthly payments to manage</li>
        <li>Credit score improved since taking on original debts</li>
        <li>Commitment to not taking on new debt</li>
      </ul>

      <p><strong>Not good for consolidation:</strong></p>
      <ul>
        <li>Poor credit score (won't get lower rate)</li>
        <li>Planning to file bankruptcy</li>
        <li>Likely to accumulate new credit card debt</li>
        <li>Can't afford monthly payment on new loan</li>
      </ul>

      <h2>Consolidation Calculation</h2>
      <p>Before consolidating, calculate your total savings:</p>
      <ol>
        <li>Add up all current debts</li>
        <li>Calculate total interest on current path</li>
        <li>Get consolidation loan quote with APR</li>
        <li>Calculate total interest on new loan</li>
        <li>Compare total costs (subtract fees)</li>
      </ol>

      <h2>After Consolidation: Staying Debt-Free</h2>
      <ul>
        <li>Don't charge new purchases to paid-off credit cards</li>
        <li>Treat paid-off cards carefully—keep accounts open to maintain credit history</li>
        <li>Make payments on time every month</li>
        <li>Build an emergency fund to avoid new debt</li>
        <li>Create a budget to prevent overspending</li>
      </ul>

      <h2>Getting Started With Consolidation</h2>
      <p>Ready to simplify your finances? AmeriLend specializes in debt consolidation loans. Get a free quote today and discover how much you could save.</p>
    `
  },
  "home-equity": {
    title: "Home Equity Loans & HELOC Guide",
    description: "Understand how to leverage your home equity for financing large projects or consolidation.",
    content: `
      <h2>What is Home Equity?</h2>
      <p>Home equity is the difference between your home's current market value and what you owe on your mortgage. For example, if your home is worth $300,000 and you owe $200,000, you have $100,000 in equity.</p>

      <h2>Home Equity Loans Explained</h2>
      <p>A home equity loan lets you borrow against your equity in a lump sum. You receive the money upfront and repay it with fixed monthly payments over a set term (typically 5-20 years). The loan is secured by your home, meaning your home is at risk if you don't pay.</p>

      <h2>HELOC (Home Equity Line of Credit) Explained</h2>
      <p>A HELOC is more flexible. It's like a credit card backed by your home equity. You receive a credit line you can draw from as needed, pay interest only on what you use, and can redraw funds as you pay them back. Most HELOCs have variable interest rates.</p>

      <h2>Home Equity Loan vs HELOC Comparison</h2>
      <table>
        <tr>
          <td><strong>Feature</strong></td>
          <td><strong>Home Equity Loan</strong></td>
          <td><strong>HELOC</strong></td>
        </tr>
        <tr>
          <td>Funding</td>
          <td>Lump sum upfront</td>
          <td>Draw as needed</td>
        </tr>
        <tr>
          <td>Interest Rate</td>
          <td>Fixed (stays same)</td>
          <td>Variable (can change)</td>
        </tr>
        <tr>
          <td>Monthly Payment</td>
          <td>Fixed amount</td>
          <td>Variable (based on balance)</td>
        </tr>
        <tr>
          <td>Repayment Term</td>
          <td>5-20 years</td>
          <td>10-year draw + 20-year repay</td>
        </tr>
        <tr>
          <td>Best For</td>
          <td>One large purchase</td>
          <td>Multiple purchases over time</td>
        </tr>
      </table>

      <h2>How Home Equity is Calculated</h2>
      <p><strong>Formula:</strong> Current Home Value - Outstanding Mortgage Balance = Home Equity</p>
      <p><strong>Example:</strong> $400,000 home - $250,000 owed = $150,000 equity</p>
      <p><strong>Borrowing Limit:</strong> Most lenders let you borrow up to 80-90% of your equity</p>

      <h2>Interest Rates and Terms</h2>
      <p><strong>Home Equity Loans:</strong></p>
      <ul>
        <li>Typical rates: 7-12% (fixed)</li>
        <li>Lower than personal loans due to home collateral</li>
        <li>Fixed payments for predictable budgeting</li>
      </ul>

      <p><strong>HELOCs:</strong></p>
      <ul>
        <li>Typical rates: Prime Rate + 1-2% (variable)</li>
        <li>Can increase if rates rise</li>
        <li>Interest-only payments during draw period</li>
      </ul>

      <h2>Tax Deductions</h2>
      <p>Interest on home equity loans and HELOCs may be tax-deductible if used for home improvement. Talk to a tax professional about your specific situation. Interest is NOT deductible if used for other purposes.</p>

      <h2>Best Uses for Home Equity Borrowing</h2>
      <ul>
        <li><strong>Home Improvements:</strong> Kitchen remodel, roof repair, additions</li>
        <li><strong>Debt Consolidation:</strong> Pay off high-interest credit card debt</li>
        <li><strong>Education:</strong> College or vocational training</li>
        <li><strong>Major Purchases:</strong> Vehicles, appliances</li>
        <li><strong>Emergency Funds:</strong> Unexpected expenses</li>
      </ul>

      <h2>Risks of Home Equity Borrowing</h2>
      <ul>
        <li><strong>Your Home is Collateral:</strong> If you can't pay, you could lose your home</li>
        <li><strong>Variable Rates (HELOC):</strong> Payments can increase significantly if rates rise</li>
        <li><strong>Debt Increases:</strong> You now owe more on your home</li>
        <li><strong>Closing Costs:</strong> Appraisal, legal, and processing fees apply</li>
        <li><strong>Overspending Risk:</strong> Easy access to credit tempts excessive borrowing</li>
      </ul>

      <h2>When Home Equity Makes Sense</h2>
      <ul>
        <li>You have significant equity built up</li>
        <li>Rates are historically low</li>
        <li>You're using funds for home improvements (tax deductible)</li>
        <li>You're consolidating high-interest debt</li>
        <li>You have stable income to make payments</li>
      </ul>

      <h2>Application and Approval Process</h2>
      <ol>
        <li>Get your home appraised to determine current value</li>
        <li>Calculate available equity</li>
        <li>Apply with lender</li>
        <li>Lender conducts credit check and verifies employment</li>
        <li>Underwriting and appraisal review</li>
        <li>Closing (similar to mortgage closing)</li>
        <li>Funding after closing</li>
      </ol>

      <h2>Getting Started</h2>
      <p>Considering a home equity loan or HELOC? Contact AmeriLend for a free consultation. We'll help you determine your equity, compare rates, and find the right option for your needs.</p>
    `
  },
  "business-loans": {
    title: "Business Loans Guide",
    description: "Financing options for business startup, expansion, and working capital.",
    content: `
      <h2>Types of Business Loans</h2>
      <p><strong>Startup Loans:</strong> For new businesses with no operating history. Usually require personal credit history and often a personal guarantee.</p>
      
      <p><strong>Equipment Loans:</strong> Financing for business equipment. The equipment serves as collateral, securing lower rates.</p>
      
      <p><strong>Working Capital Loans:</strong> Short-term funding for daily operations, inventory, or payroll during slow periods.</p>
      
      <p><strong>Business Lines of Credit:</strong> Flexible credit you draw from as needed, similar to a business credit card.</p>

      <h2>Documentation Requirements</h2>
      <ul>
        <li>Business license and registration</li>
        <li>Business plan and financial projections</li>
        <li>Personal and business tax returns (2-3 years)</li>
        <li>Bank statements (3-6 months)</li>
        <li>Balance sheet and income statement</li>
        <li>Personal credit history</li>
        <li>Collateral documentation (if applicable)</li>
      </ul>

      <h2>Business Plan Preparation</h2>
      <p>Your business plan should include:</p>
      <ul>
        <li>Executive summary</li>
        <li>Company description and ownership</li>
        <li>Market analysis and competition</li>
        <li>Marketing and sales strategy</li>
        <li>Financial projections (3-5 years)</li>
        <li>Use of loan proceeds</li>
        <li>Management team qualifications</li>
      </ul>

      <h2>Collateral Options</h2>
      <ul>
        <li><strong>Business Assets:</strong> Equipment, inventory, accounts receivable</li>
        <li><strong>Personal Collateral:</strong> Home, personal vehicles, investments</li>
        <li><strong>SBA Guarantee:</strong> Government backing reduces lender risk</li>
        <li><strong>Personal Guarantee:</strong> Owner personally guarantees repayment</li>
      </ul>

      <h2>Using Loan Funds Wisely</h2>
      <ul>
        <li>Use funds for stated business purpose</li>
        <li>Track all spending carefully</li>
        <li>Don't mix personal and business finances</li>
        <li>Monitor cash flow to ensure you can make payments</li>
        <li>Consider growth investments vs. operations needs</li>
      </ul>

      <h2>Interest Rates for Business Loans</h2>
      <p>Rates vary based on:</p>
      <ul>
        <li>Business credit score</li>
        <li>Personal credit score of owner</li>
        <li>Collateral offered</li>
        <li>Loan amount and term</li>
        <li>Industry risk level</li>
        <li>Business operating history</li>
      </ul>

      <h2>Repayment Strategies</h2>
      <ul>
        <li>Set aside loan proceeds for operating costs</li>
        <li>Generate revenue to cover loan payments</li>
        <li>Build cash reserves for slow periods</li>
        <li>Consider seasonal payment plans if applicable</li>
        <li>Plan for early repayment if possible</li>
      </ul>

      <h2>Getting Business Loan Approved</h2>
      <p>AmeriLend offers business loans for entrepreneurs and small business owners. We understand the challenges of growing a business and provide flexible terms. Contact us today for a consultation on your business financing needs.</p>
    `
  },
  "credit-score": {
    title: "How to Improve Your Credit Score",
    description: "Proven strategies to build and maintain a strong credit score.",
    content: `
      <h2>Understanding Your Credit Score</h2>
      <p>Your credit score is a number between 300-850 that lenders use to assess your creditworthiness. It's based on:</p>
      <ul>
        <li><strong>Payment History (35%):</strong> Do you pay on time?</li>
        <li><strong>Credit Utilization (30%):</strong> How much available credit are you using?</li>
        <li><strong>Length of Credit History (15%):</strong> How long have you had credit accounts?</li>
        <li><strong>Credit Mix (10%):</strong> Do you have different types of credit?</li>
        <li><strong>New Inquiries (10%):</strong> Have you recently applied for credit?</li>
      </ul>

      <h2>Credit Score Ranges</h2>
      <table>
        <tr>
          <td><strong>Range</strong></td>
          <td><strong>Rating</strong></td>
          <td><strong>Loan APR</strong></td>
        </tr>
        <tr>
          <td>750-850</td>
          <td>Excellent</td>
          <td>5-8%</td>
        </tr>
        <tr>
          <td>700-749</td>
          <td>Good</td>
          <td>8-12%</td>
        </tr>
        <tr>
          <td>650-699</td>
          <td>Fair</td>
          <td>12-18%</td>
        </tr>
        <tr>
          <td>Below 650</td>
          <td>Poor</td>
          <td>18%+</td>
        </tr>
      </table>

      <h2>Proven Strategies to Improve Your Score</h2>
      <p><strong>1. Pay Bills On Time, Every Time</strong></p>
      <p>Payment history is 35% of your score. Even one missed payment can hurt for years.</p>
      <ul>
        <li>Set up automatic payments for minimum amounts</li>
        <li>Mark payment due dates in your calendar</li>
        <li>Set payment reminders on your phone</li>
      </ul>

      <p><strong>2. Reduce Your Credit Utilization</strong></p>
      <p>Keep credit card balances below 30% of your credit limit.</p>
      <ul>
        <li>Pay down credit card balances</li>
        <li>Request credit limit increases (soft pull)</li>
        <li>Spread charges across multiple cards</li>
      </ul>

      <p><strong>3. Dispute Credit Report Errors</strong></p>
      <p>Errors on your report can lower your score incorrectly.</p>
      <ul>
        <li>Get free report at annualcreditreport.com</li>
        <li>Review carefully for errors</li>
        <li>Dispute inaccuracies with credit bureaus</li>
      </ul>

      <p><strong>4. Build Credit History Length</strong></p>
      <p>Keep old accounts open, even if unused.</p>
      <ul>
        <li>Don't close old credit cards</li>
        <li>Use old cards occasionally to keep active</li>
        <li>Maintain a long credit history</li>
      </ul>

      <p><strong>5. Diversify Your Credit Mix</strong></p>
      <p>Have different types of credit (cards, loans, etc.).</p>
      <ul>
        <li>Credit cards (revolving credit)</li>
        <li>Personal loans (installment credit)</li>
        <li>Auto loans (secured credit)</li>
        <li>Store cards (limited credit)</li>
      </ul>

      <h2>Quick Wins for Score Improvement</h2>
      <ul>
        <li>Make a large credit card payment (impacts utilization immediately)</li>
        <li>Ask lender to report to credit bureaus</li>
        <li>Request late payment removal from your report</li>
        <li>Become an authorized user on someone's good account</li>
        <li>Use a credit builder loan to establish positive history</li>
      </ul>

      <h2>Timeline for Score Improvement</h2>
      <p><strong>Immediate (1-3 months):</strong> Paying down credit cards shows up quickly</p>
      <p><strong>Short-term (3-6 months):</strong> On-time payments and lower utilization improve score</p>
      <p><strong>Long-term (6-12 months):</strong> Pattern of good behavior significantly improves score</p>
      <p><strong>Years:</strong> Negative items gradually age off your report</p>

      <h2>What NOT to Do</h2>
      <ul>
        <li>Don't close old credit cards (shortens credit history)</li>
        <li>Don't apply for multiple credit lines quickly (hard inquiries hurt)</li>
        <li>Don't pay bills late (payment history is 35% of score)</li>
        <li>Don't max out credit cards (high utilization hurts)</li>
        <li>Don't ignore collection accounts (they age off, but still hurt)</li>
      </ul>

      <h2>Getting Help With Credit Improvement</h2>
      <p>AmeriLend offers personalized credit improvement strategies and credit-builder loans designed to help you improve your score. Contact us for a free credit consultation.</p>
    `
  },
  "emergency-funds": {
    title: "Building Your Emergency Fund",
    description: "Create financial security with an emergency fund strategy that works.",
    content: `
      <h2>Why You Need an Emergency Fund</h2>
      <p>An emergency fund is money set aside for unexpected expenses. Without one, you're forced to use credit cards or loans at high interest rates when problems arise—creating debt that's hard to escape.</p>

      <h2>How Much Should You Save?</h2>
      <p><strong>Initial Goal:</strong> $1,000 emergency fund (covers most small emergencies)</p>
      <p><strong>Long-term Goal:</strong> 3-6 months of living expenses</p>
      <p><strong>Calculation:</strong> Multiply your monthly expenses by 3-6</p>
      
      <p>Example: If your monthly expenses are $3,000, aim for $9,000-$18,000</p>

      <h2>Where to Keep Your Emergency Fund</h2>
      <p><strong>High-Yield Savings Account:</strong> Currently offering 4-5% APY, easy access, FDIC insured</p>
      <p><strong>Money Market Account:</strong> Similar to savings but higher interest rates</p>
      <p><strong>Regular Savings Account:</strong> Accessible but lower interest rates</p>
      <p><strong>NOT for emergency funds:</strong> Stocks, bonds, retirement accounts (penalties apply)</p>

      <h2>Building Your Emergency Fund</h2>
      <p><strong>Start Small:</strong></p>
      <ul>
        <li>Save $25-50 per paycheck initially</li>
        <li>Get to $1,000 first (covers most emergencies)</li>
        <li>Then build to 3-6 months expenses</li>
      </ul>

      <p><strong>Automate Your Savings:</strong></p>
      <ul>
        <li>Set up automatic transfer from checking to savings on payday</li>
        <li>Direct portion of paycheck to savings account</li>
        <li>Make it automatic so you're not tempted to spend</li>
      </ul>

      <p><strong>Increase Your Contributions:</strong></p>
      <ul>
        <li>Use tax refunds toward emergency fund</li>
        <li>Save bonus income</li>
        <li>Redirect money when bills are paid off</li>
        <li>Cut expenses to free up savings money</li>
      </ul>

      <h2>Common Emergency Fund Emergencies</h2>
      <ul>
        <li>Job loss (1-3 months of expenses)</li>
        <li>Car repair or replacement</li>
        <li>Medical emergency</li>
        <li>Home repair (roof, plumbing, HVAC)</li>
        <li>Unexpected travel for family emergency</li>
        <li>Veterinary emergency for pet</li>
        <li>Appliance replacement</li>
      </ul>

      <h2>Using Your Emergency Fund Wisely</h2>
      <ul>
        <li>Only use for true emergencies</li>
        <li>Avoid using for wants or planned expenses</li>
        <li>Replenish quickly after using</li>
        <li>Don't view it as additional spending money</li>
      </ul>

      <h2>After Job Loss or Major Emergency</h2>
      <ul>
        <li>File for unemployment if eligible</li>
        <li>Cut non-essential expenses</li>
        <li>Look for part-time work quickly</li>
        <li>Use emergency fund only for essentials</li>
        <li>Contact creditors if struggling to pay bills</li>
        <li>Rebuild emergency fund once stable</li>
      </ul>

      <h2>Emergency Fund Timeline</h2>
      <p><strong>Month 1-2:</strong> Save $500-1,000</p>
      <p><strong>Month 3-6:</strong> Build to 1 month expenses</p>
      <p><strong>Month 6-12:</strong> Build to 3 months expenses</p>
      <p><strong>Year 2+:</strong> Build to 6 months expenses</p>

      <h2>Beyond Emergency Funds</h2>
      <p>Once you have your emergency fund established, consider:</p>
      <ul>
        <li>Adequate insurance (health, auto, home)</li>
        <li>Disability insurance for income protection</li>
        <li>Life insurance if you have dependents</li>
        <li>Retirement savings for long-term security</li>
      </ul>

      <h2>Getting Started Today</h2>
      <p>Start building your emergency fund today. Open a high-yield savings account, set up automatic transfers, and commit to saving. Your future self will thank you when emergencies arise and you're prepared.</p>
    `
  },
  "quick-approval": {
    title: "Fast Loan Approval: Same Day Funding",
    description: "Get quick access to cash with same-day or next-day funding options.",
    content: `
      <h2>What Makes a Loan "Quick"?</h2>
      <p>A quick loan has a fast approval process (sometimes minutes) and can fund the same day or next business day. These loans are perfect for emergencies when you need cash fast.</p>

      <h2>Approval Timeline</h2>
      <p><strong>Online Application:</strong> 5-15 minutes to complete</p>
      <p><strong>Decision:</strong> 15 minutes to 1 hour (often instant)</p>
      <p><strong>Funding:</strong> Same day to next business day</p>
      <p><strong>Total Time:</strong> As fast as 24 hours from application to funds in your account</p>

      <h2>Requirements for Quick Approval</h2>
      <ul>
        <li>Be at least 18 years old</li>
        <li>Have a valid government ID</li>
        <li>Proof of income (recent pay stub or bank statements)</li>
        <li>Active checking account</li>
        <li>Valid email and phone number</li>
        <li>Minimum credit score (varies by lender)</li>
      </ul>

      <h2>What Gets Approved Fastest</h2>
      <ul>
        <li>Smaller loan amounts ($1,000-$5,000)</li>
        <li>People with good credit scores</li>
        <li>Stable employment history</li>
        <li>Higher income relative to loan amount</li>
        <li>Few existing debts</li>
      </ul>

      <h2>What Might Slow Things Down</h2>
      <ul>
        <li>Large loan amounts requiring more documentation</li>
        <li>Low credit scores requiring manual review</li>
        <li>Recently changed jobs</li>
        <li>Self-employment (requires more verification)</li>
        <li>Income inconsistency</li>
      </ul>

      <h2>How to Speed Up Approval</h2>
      <ol>
        <li>Have all documents ready before applying</li>
        <li>Fill out application accurately and completely</li>
        <li>Respond immediately to any lender requests</li>
        <li>Check email frequently for updates</li>
        <li>Have bank account information readily available</li>
        <li>Apply during business hours for fastest service</li>
      </ol>

      <h2>Same-Day Funding Tips</h2>
      <ul>
        <li>Apply before 2 PM for same-day funding</li>
        <li>Use direct deposit with an established bank</li>
        <li>Have accurate bank account information</li>
        <li>Choose direct deposit for fastest funding</li>
        <li>Confirm receipt of funds before using them</li>
      </ul>

      <h2>When You Need Emergency Cash</h2>
      <p>If you need cash today:</p>
      <ul>
        <li>Apply for a quick personal loan online</li>
        <li>Get instant decision in most cases</li>
        <li>Funds usually arrive same day or next day</li>
        <li>No need for collateral (unsecured)</li>
        <li>Use money for any legitimate purpose</li>
      </ul>

      <h2>Interest Rates for Quick Loans</h2>
      <p>Quick loans typically have rates from 6% to 36% depending on credit score. Better credit gets better rates. Compare multiple lenders for best offer.</p>

      <h2>Getting Fast Approval from AmeriLend</h2>
      <p>AmeriLend specializes in quick loan approvals. Apply online now and potentially get approved within hours with same-day funding available. No lengthy paperwork, no waiting weeks. Just fast, straightforward lending when you need it.</p>
    `
  }
};

export default function LoanGuideDetail() {
  const params = useParams();
  const guideId = params?.guideId || "personal-loan";
  const guide = guideContent[guideId];

  if (!guide) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/">
                <a className="text-2xl font-bold">
                  <span className="text-[#0033A0]">Ameri</span>
                  <span className="text-[#D4AF37]">Lend</span>
                  <sup className="text-xs text-[#0033A0]">®</sup>
                </a>
              </Link>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-[#0033A0] mb-4">Guide Not Found</h1>
            <Link href="/loan-guides">
              <a className="inline-block">
                <Button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white">
                  Back to Guides
                </Button>
              </a>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/">
              <a className="text-2xl font-bold">
                <span className="text-[#0033A0]">Ameri</span>
                <span className="text-[#D4AF37]">Lend</span>
                <sup className="text-xs text-[#0033A0]">®</sup>
              </a>
            </Link>
            <Link href="/loan-guides">
              <a className="inline-block">
                <Button variant="outline" className="border-[#0033A0] text-[#0033A0]">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Guides
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-[#0033A0] mb-4">{guide.title}</h1>
            <p className="text-xl text-gray-600">{guide.description}</p>
          </header>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: guide.content }}
          />

          <footer className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <Link href="/loan-guides">
                <a className="inline-block">
                  <Button variant="outline" className="border-[#0033A0] text-[#0033A0]">
                    ← More Guides
                  </Button>
                </a>
              </Link>
              <Link href="/apply">
                <a className="inline-block">
                  <Button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white">
                    Apply for a Loan
                  </Button>
                </a>
              </Link>
            </div>
          </footer>
        </article>
      </main>

      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2025 AmeriLend, LLC. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
