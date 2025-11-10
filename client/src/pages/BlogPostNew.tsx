import { Button } from "@/components/ui/button";
import { Link, useParams } from "wouter";
import { ChevronLeft, Calendar, Clock, User } from "lucide-react";

export default function BlogPost() {
  const { slug } = useParams();

  const blogPosts = {
    "understanding-apr": {
      title: "Understanding APR: What It Means for Your Loan",
      date: "October 30, 2025",
      readTime: "6 min read",
      author: "AmeriLend Financial Team",
      excerpt: "Demystify APR and learn how it affects your loan payments and total cost.",
      content: `
        <h2>What is APR and Why Does It Matter?</h2>
        <p>Annual Percentage Rate (APR) is one of the most critical factors to understand when taking out a loan. It represents the yearly cost of a loan expressed as a percentage, including interest and fees. Unlike simple interest rates that only reflect the cost of borrowing the principal, APR gives you a more complete picture of what you'll actually pay.</p>

        <h3>APR vs Interest Rate: The Key Difference</h3>
        <p>Many people confuse APR with interest rate, but they're not the same thing. The interest rate is the percentage of the principal charged yearly, while APR includes the interest rate plus any other charges or fees involved in procuring the loan. This is an important distinction because a loan with a lower interest rate might actually have a higher APR if it includes significant fees.</p>

        <h4>Example:</h4>
        <ul>
          <li>Loan A: 5% interest rate + 0% fees = 5% APR</li>
          <li>Loan B: 4.5% interest rate + 1% fees = 5.5% APR</li>
        </ul>
        <p>In this example, even though Loan B has a lower interest rate, you'd actually pay more overall because of the higher APR.</p>

        <h3>How APR Affects Your Total Cost</h3>
        <p>Understanding APR helps you calculate the true cost of borrowing. Here's how it impacts what you'll pay:</p>

        <h4>Example Calculation:</h4>
        <ul>
          <li><strong>Loan Amount:</strong> $10,000</li>
          <li><strong>APR:</strong> 10%</li>
          <li><strong>Loan Term:</strong> 3 years (36 months)</li>
          <li><strong>Monthly Payment:</strong> ~$322</li>
          <li><strong>Total Amount Paid:</strong> ~$11,592</li>
          <li><strong>Total Interest:</strong> ~$1,592</li>
        </ul>

        <h3>Types of APR</h3>
        <p>Different loans have different types of APR structures:</p>

        <ul>
          <li><strong>Fixed APR:</strong> Remains the same throughout the loan term. Predictable payments every month.</li>
          <li><strong>Variable APR:</strong> Can change based on market conditions or the lender's terms. Your payments might increase or decrease.</li>
          <li><strong>Introductory APR:</strong> A promotional rate offered for a limited time, after which it increases.</li>
        </ul>

        <h3>How Lenders Calculate APR</h3>
        <p>Lenders calculate APR using a standard formula that includes:</p>
        <ul>
          <li>The interest rate</li>
          <li>Origination fees</li>
          <li>Closing costs</li>
          <li>Insurance premiums (if applicable)</li>
          <li>Other charges specific to the loan</li>
        </ul>

        <h3>Tips for Getting a Lower APR</h3>
        <ul>
          <li><strong>Improve Your Credit Score:</strong> Better credit scores typically qualify for lower APRs. Work on paying bills on time and reducing outstanding debt.</li>
          <li><strong>Make a Larger Down Payment:</strong> Putting more money down reduces the amount you need to borrow, which can help you qualify for better rates.</li>
          <li><strong>Shop Around:</strong> Different lenders offer different APRs. Compare rates from multiple lenders before deciding.</li>
          <li><strong>Consider a Co-Signer:</strong> If your credit isn't great, a co-signer with better credit might help you secure a lower rate.</li>
          <li><strong>Pay Fees Upfront:</strong> Some lenders allow you to pay certain fees upfront to reduce your APR.</li>
          <li><strong>Shorten the Loan Term:</strong> While higher monthly payments mean lower overall interest paid, shorter terms can sometimes qualify for lower APRs.</li>
        </ul>

        <h3>The Impact on Different Loan Types</h3>
        <p>APR works differently depending on the type of loan:</p>

        <h4>Personal Loans</h4>
        <p>Personal loan APRs typically range from 6-36% depending on your creditworthiness and the lender. Fixed-rate personal loans are common, meaning your APR stays the same throughout the loan.</p>

        <h4>Auto Loans</h4>
        <p>Car loans usually have lower APRs (3-10%) because the vehicle serves as collateral. The age and mileage of the vehicle, along with your credit score, affect the APR you'll receive.</p>

        <h4>Home Loans</h4>
        <p>Mortgage APRs are typically lower (3-8%) because the home serves as security for the lender. However, the difference between the interest rate and APR can be substantial due to closing costs and fees.</p>

        <h4>Credit Cards</h4>
        <p>Credit card APRs are usually the highest, ranging from 15-25%, though some cards offer introductory rates as low as 0%.</p>

        <h3>Red Flags When Comparing APRs</h3>
        <ul>
          <li><strong>Hidden Fees:</strong> Always ask about all fees included in the APR. Some lenders bury fees that aren't immediately obvious.</li>
          <li><strong>Variable Rates Presented as Fixed:</strong> Make sure you understand whether the APR can change over time.</li>
          <li><strong>Bait-and-Switch:</strong> Lenders might advertise one rate but qualify you for a much higher one. Always get your actual rate in writing.</li>
          <li><strong>Incomplete Information:</strong> Legitimate lenders always disclose APR prominently. If it's hard to find, keep looking.</li>
        </ul>

        <h3>Conclusion</h3>
        <p>Understanding APR is crucial for making smart borrowing decisions. By knowing what APR includes, how it's calculated, and how to shop for better rates, you can save thousands of dollars over the life of your loan. Always compare APRs from multiple lenders and read the fine print before committing to any loan.</p>
      `
    },
    "debt-consolidation-guide": {
      title: "Debt Consolidation: Is It Right for You?",
      date: "October 29, 2025",
      readTime: "7 min read",
      author: "AmeriLend Financial Team",
      excerpt: "Explore the benefits and drawbacks of consolidating your debts into one payment.",
      content: `
        <h2>What is Debt Consolidation?</h2>
        <p>Debt consolidation is the process of combining multiple debts into a single new loan, typically with a lower interest rate and more manageable monthly payment. Instead of making payments to several creditors each month, you make one payment to your consolidation lender.</p>

        <h3>How Debt Consolidation Works</h3>
        <p>The process is relatively straightforward:</p>
        <ul>
          <li><strong>1. Apply for a consolidation loan:</strong> You submit an application to a lender offering debt consolidation.</li>
          <li><strong>2. Get approved:</strong> The lender reviews your credit and finances and determines an APR and loan amount.</li>
          <li><strong>3. Receive funds:</strong> Once approved, you receive the loan funds.</li>
          <li><strong>4. Pay off debts:</strong> You use the loan money to pay off your existing debts in full.</li>
          <li><strong>5. Make one payment:</strong> You then pay the consolidation loan back on a fixed schedule.</li>
        </ul>

        <h3>Types of Debt You Can Consolidate</h3>
        <p>Most types of unsecured debt can be consolidated:</p>
        <ul>
          <li>Credit card balances</li>
          <li>Medical bills</li>
          <li>Personal loans</li>
          <li>Payday loans</li>
          <li>Some student loans (federal consolidation loans)</li>
        </ul>

        <h3>Benefits of Debt Consolidation</h3>

        <h4>Lower Interest Rates</h4>
        <p>If you have multiple high-interest debts (like credit cards at 20% APR), consolidating them into a personal loan at 12% APR can significantly reduce the amount of interest you pay over time.</p>

        <h4>Simplified Payments</h4>
        <p>Instead of juggling multiple payment dates and amounts, you have just one monthly payment to one lender. This makes budgeting easier and reduces the chance of missing a payment.</p>

        <h4>Fixed Repayment Timeline</h4>
        <p>Personal consolidation loans typically have a set term (3-7 years), giving you a clear end date for being debt-free. Credit cards don't have a set payoff date unless you aggressively pay them down.</p>

        <h4>Potential Credit Score Improvement</h4>
        <p>Paying off credit card balances can improve your credit score because you're reducing your credit utilization ratio (the amount of available credit you're using). This is one of the key factors in credit score calculations.</p>

        <h4>Reduced Stress</h4>
        <p>Managing multiple debts is stressful. Consolidation simplifies your financial life and can provide peace of mind.</p>

        <h3>Drawbacks of Debt Consolidation</h3>

        <h4>Hard Inquiry on Your Credit</h4>
        <p>Applying for a consolidation loan triggers a hard inquiry, which can temporarily lower your credit score by a few points.</p>

        <h4>Potential for Longer Repayment</h4>
        <p>While monthly payments might be lower, extending the loan term means you might pay more interest overall. For example, paying a smaller amount over 7 years instead of 3 years could cost you more.</p>

        <h4>Risk of Accumulating More Debt</h4>
        <p>If you consolidate credit card debt but then run up the cards again, you'll have both the consolidation loan AND new credit card debt. This can make your situation worse.</p>

        <h4>Requires Good Credit (Usually)</h4>
        <p>Most personal consolidation loans require at least fair credit. If you have bad credit, you might not qualify, or you'll face higher interest rates that make consolidation less attractive.</p>

        <h4>Origination and Other Fees</h4>
        <p>Some consolidation loans come with origination fees, prepayment penalties, or other charges that can offset the savings from a lower interest rate.</p>

        <h3>Is Debt Consolidation Right for You?</h3>

        <p><strong>Consolidation might be a good choice if:</strong></p>
        <ul>
          <li>You have multiple high-interest debts</li>
          <li>You have a decent credit score (typically 620+)</li>
          <li>You can secure a lower interest rate than your current debts</li>
          <li>You're disciplined enough not to run up new debt</li>
          <li>You want to simplify your finances</li>
        </ul>

        <p><strong>Consolidation might not be ideal if:</strong></p>
        <ul>
          <li>You have very bad credit and can't qualify for better rates</li>
          <li>You'll pay significantly more interest overall due to longer repayment periods</li>
          <li>You have a history of accumulating new debt</li>
          <li>You plan to continue high spending habits</li>
          <li>Most of your debt is mortgage or student loans</li>
        </ul>

        <h3>Alternatives to Debt Consolidation</h3>

        <h4>Debt Management Plan</h4>
        <p>Work with a non-profit credit counseling agency to create a plan. They negotiate with creditors on your behalf to potentially lower interest rates and extend payment timelines.</p>

        <h4>Balance Transfer Credit Card</h4>
        <p>Some credit cards offer 0% APR promotional periods (typically 6-21 months). Transfer your high-interest credit card balances to take advantage of the promotion.</p>

        <h4>Debt Snowball or Snowflake Method</h4>
        <p>Pay off debts from smallest to largest (snowball) or put extra money toward the highest-interest debt (avalanche) without consolidating.</p>

        <h4>Negotiation</h4>
        <p>Contact creditors directly to negotiate lower interest rates or settlement amounts.</p>

        <h3>Conclusion</h3>
        <p>Debt consolidation can be an effective tool for managing multiple debts, but it's not a one-size-fits-all solution. Before consolidating, carefully calculate whether you'll actually save money, ensure you won't accumulate new debt, and consider alternatives. If done wisely, consolidation can put you on a faster track to financial freedom.</p>
      `
    },
    "personal-loan-vs-credit-card": {
      title: "Personal Loan vs. Credit Card: Which is Right for You?",
      date: "October 28, 2025",
      readTime: "7 min read",
      author: "AmeriLend Financial Team",
      excerpt: "Understand the differences and discover which option works best for your financial needs.",
      content: `
        <h2>Personal Loans and Credit Cards: A Comprehensive Comparison</h2>
        <p>Both personal loans and credit cards are forms of credit, but they work very differently. Understanding the differences can help you choose the right tool for your financial situation.</p>

        <h3>How Personal Loans Work</h3>
        <p>A personal loan is a form of installment credit where you borrow a lump sum of money upfront and repay it in fixed monthly installments over a set period (typically 2-7 years).</p>

        <ul>
          <li><strong>Loan Amount:</strong> You receive a specific amount all at once</li>
          <li><strong>Fixed Monthly Payment:</strong> You pay the same amount each month</li>
          <li><strong>Fixed Term:</strong> The loan has a definite end date</li>
          <li><strong>Interest Rate:</strong> Usually fixed, so your rate doesn't change</li>
        </ul>

        <h3>How Credit Cards Work</h3>
        <p>A credit card is a form of revolving credit. You can use it repeatedly up to your credit limit, pay the balance in full or in part each month, and the balance resets.</p>

        <ul>
          <li><strong>Credit Limit:</strong> You can borrow up to your limit</li>
          <li><strong>Flexible Payment:</strong> You choose how much to pay each month (minimum payment required)</li>
          <li><strong>No Set End Date:</strong> The credit line remains open as long as you maintain good standing</li>
          <li><strong>Variable Interest:</strong> Most credit cards have variable APRs that can change</li>
        </ul>

        <h3>Key Differences</h3>

        <h4>Interest Rates</h4>
        <p><strong>Personal Loans:</strong> Typically 6-36% APR depending on credit score and lender<br/>
        <strong>Credit Cards:</strong> Usually 15-25% APR (significantly higher than personal loans)</p>

        <h4>Payment Structure</h4>
        <p><strong>Personal Loans:</strong> Fixed monthly payment for the entire loan term<br/>
        <strong>Credit Cards:</strong> Flexible; can pay minimum or as much as you want</p>

        <h4>Repayment Period</h4>
        <p><strong>Personal Loans:</strong> Predetermined (e.g., 5 years)<br/>
        <strong>Credit Cards:</strong> Indefinite; you can revolve the debt as long as you make minimum payments</p>

        <h4>Fees</h4>
        <p><strong>Personal Loans:</strong> May include origination fees, but typically simple<br/>
        <strong>Credit Cards:</strong> Annual fees (some cards), late fees, over-limit fees, balance transfer fees</p>

        <h4>Approval Requirements</h4>
        <p><strong>Personal Loans:</strong> Typically require at least fair credit (600+)<br/>
        <strong>Credit Cards:</strong> Can be obtained with lower credit scores, but at higher interest rates</p>

        <h3>When to Choose a Personal Loan</h3>

        <p>Personal loans are better if you:</p>
        <ul>
          <li><strong>Need a specific amount:</strong> You know exactly how much you need to borrow</li>
          <li><strong>Want to pay off debt quickly:</strong> Fixed repayment terms help you stay accountable</li>
          <li><strong>Prefer predictable payments:</strong> Fixed monthly payments make budgeting easier</li>
          <li><strong>Have multiple debts:</strong> Use a personal loan to consolidate credit cards</li>
          <li><strong>Want lower interest rates:</strong> Personal loans usually have lower APRs than credit cards</li>
          <li><strong>Have good credit:</strong> You'll qualify for better rates</li>
        </ul>

        <h3>When to Choose a Credit Card</h3>

        <p>Credit cards are better if you:</p>
        <ul>
          <li><strong>Need flexibility:</strong> You're not sure how much you'll need to spend</li>
          <li><strong>Make purchases regularly:</strong> You can use the same card repeatedly</li>
          <li><strong>Pay off the balance monthly:</strong> Avoid interest charges entirely</li>
          <li><strong>Value rewards:</strong> Many credit cards offer cash back or points</li>
          <li><strong>Need a emergency backup:</strong> Having a credit line available provides security</li>
          <li><strong>Track expenses easily:</strong> One statement shows all your spending</li>
        </ul>

        <h3>Impact on Credit Score</h3>

        <p><strong>Personal Loans:</strong></p>
        <ul>
          <li>Initial hard inquiry may lower score temporarily</li>
          <li>Showing you can manage installment debt helps your credit mix</li>
          <li>If you pay on time, it builds positive payment history</li>
        </ul>

        <p><strong>Credit Cards:</strong></p>
        <ul>
          <li>Unused credit limits actually help your score (good credit utilization ratio)</li>
          <li>Carrying high balances hurts your score</li>
          <li>Multiple credit cards can improve your credit mix</li>
        </ul>

        <h3>Comparison Table</h3>

        <table border="1" style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background-color: #f0f0f0;">
            <th style="padding: 10px; text-align: left;">Feature</th>
            <th style="padding: 10px; text-align: left;">Personal Loan</th>
            <th style="padding: 10px; text-align: left;">Credit Card</th>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>APR Range</strong></td>
            <td style="padding: 10px;">6-36%</td>
            <td style="padding: 10px;">15-25%</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px;"><strong>Approval Time</strong></td>
            <td style="padding: 10px;">3-7 days typically</td>
            <td style="padding: 10px;">Instant to 24 hours</td>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>Payment Structure</strong></td>
            <td style="padding: 10px;">Fixed monthly</td>
            <td style="padding: 10px;">Flexible (minimum to full)</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px;"><strong>Term Length</strong></td>
            <td style="padding: 10px;">2-7 years (set)</td>
            <td style="padding: 10px;">Ongoing (no end date)</td>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>Best For</strong></td>
            <td style="padding: 10px;">Large purchases, consolidation</td>
            <td style="padding: 10px;">Everyday purchases, flexibility</td>
          </tr>
        </table>

        <h3>Real-World Scenarios</h3>

        <h4>Scenario 1: Emergency Car Repair ($3,000)</h4>
        <p><strong>Choose Personal Loan:</strong> You need $3,000 immediately. A personal loan gets you the money quickly with predictable monthly payments.</p>

        <h4>Scenario 2: Paying for Monthly Groceries</h4>
        <p><strong>Choose Credit Card:</strong> You don't know the exact amount monthly, and you can pay off the balance each month without interest.</p>

        <h4>Scenario 3: Consolidating $15,000 in Credit Card Debt</h4>
        <p><strong>Choose Personal Loan:</strong> A personal loan at 12% APR will save you money compared to credit card debt at 20% APR and help you pay it off faster with a set term.</p>

        <h4>Scenario 4: Earning Travel Rewards</h4>
        <p><strong>Choose Credit Card:</strong> If you travel frequently and can pay off the balance monthly, a rewards credit card gives you benefits with no interest cost.</p>

        <h3>Using Both Strategically</h3>

        <p>You don't have to choose just one. Many people use both effectively:</p>
        <ul>
          <li>Use a personal loan for large, planned expenses</li>
          <li>Use a credit card for daily purchases and rewards</li>
          <li>Pay off the credit card monthly to avoid interest</li>
          <li>Use the personal loan for emergencies or specific financial goals</li>
        </ul>

        <h3>Conclusion</h3>
        <p>Both personal loans and credit cards have their place in your financial toolkit. Personal loans are better for large, planned expenses and provide a faster repayment path with more predictable payments. Credit cards are better for flexibility, rewards, and everyday expenses. Choose based on your specific need, and remember: the key to financial health is using credit responsibly regardless of which tool you choose.</p>
      `
    }
  };

  const post = blogPosts[slug as keyof typeof blogPosts];

  if (!post) {
    return (
      <div className="min-h-screen bg-white">
        <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-[#0033A0]">Ameri</span>
                <span className="text-[#D4AF37]">Lend</span>
                <sup className="text-xs text-[#0033A0]">®</sup>
              </Link>
              <Link href="/blog" className="inline-block">
                <Button variant="outline" className="border-[#0033A0] text-[#0033A0]">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Blog
                </Button>
              </Link>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-[#0033A0] mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">The blog post you're looking for doesn't exist.</p>
            <Link href="/blog">
              <a className="inline-block">
                <Button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white">
                  Browse All Articles
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
            <Link href="/" className="text-2xl font-bold">
              <span className="text-[#0033A0]">Ameri</span>
              <span className="text-[#D4AF37]">Lend</span>
              <sup className="text-xs text-[#0033A0]">®</sup>
            </Link>
            <Link href="/blog" className="inline-block">
              <Button variant="outline" className="border-[#0033A0] text-[#0033A0]">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {post.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {post.author}
              </div>
            </div>
            <h1 className="text-4xl font-bold text-[#0033A0] mb-4">{post.title}</h1>
            <p className="text-xl text-gray-600">{post.excerpt}</p>
          </header>

          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <footer className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <div className="text-sm text-gray-500">
                Published on {post.date} by {post.author}
              </div>
              <div className="flex gap-4">
                <Link href="/blog">
                  <a className="inline-block">
                    <Button variant="outline" className="border-[#0033A0] text-[#0033A0]">
                      ← More Articles
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
