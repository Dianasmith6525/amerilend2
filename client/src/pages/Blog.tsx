import { Button } from "@/components/ui/button";
import { CodeButton } from "@/components/ui/CodeButton";
import { Link } from "wouter";
import { ChevronLeft, ArrowRight, Search } from "lucide-react";
import { useState } from "react";

export default function Blog() {
  const articles = [
    {
      title: "Complete Guide to USA Loan Types",
      slug: "complete-guide-usa-loan-types",
      excerpt: "Explore all 15 types of loans available in the USA, their requirements, and which one is right for you.",
      date: "November 3, 2025",
      category: "Loan Guides"
    },
    {
      title: "Personal vs Installment Loans: Which Is Better?",
      slug: "personal-vs-installment-loans",
      excerpt: "Compare personal and installment loans to find the right financing option for your needs.",
      date: "November 2, 2025",
      category: "Loan Guides"
    },
    {
      title: "How to Improve Your Credit Score",
      slug: "improve-credit-score",
      excerpt: "Learn practical tips to boost your credit score and qualify for better loan rates.",
      date: "November 1, 2025",
      category: "Credit Building"
    },
    {
      title: "Understanding APR: What It Means for Your Loan",
      slug: "understanding-apr",
      excerpt: "Demystify APR and learn how it affects your loan payments and total cost.",
      date: "October 30, 2025",
      category: "Financial Education"
    },
    {
      title: "Debt Consolidation: Is It Right for You?",
      slug: "debt-consolidation-guide",
      excerpt: "Explore the benefits and drawbacks of consolidating your debts into one payment.",
      date: "October 29, 2025",
      category: "Debt Management"
    },
    {
      title: "Personal Loan vs. Credit Card: Which is Right for You?",
      slug: "personal-loan-vs-credit-card",
      excerpt: "Understand the differences and discover which option works best for your financial needs.",
      date: "October 28, 2025",
      category: "Financial Education"
    },
    {
      title: "First-Time Borrower's Guide to Personal Loans",
      slug: "first-time-borrower-guide",
      excerpt: "Everything you need to know before applying for your first personal loan.",
      date: "October 27, 2025",
      category: "Loan Guides"
    },
    {
      title: "How to Choose the Right Loan Term",
      slug: "choosing-loan-term",
      excerpt: "Learn how to select the best repayment period for your financial situation.",
      date: "October 26, 2025",
      category: "Loan Guides"
    },
    {
      title: "5 Common Financial Mistakes to Avoid",
      slug: "5-common-financial-mistakes",
      excerpt: "Avoid these costly mistakes that could impact your financial health and credit score.",
      date: "October 25, 2025",
      category: "Financial Education"
    },
    {
      title: "Medical Expense Loans: Covering Healthcare Costs",
      slug: "medical-expense-loans",
      excerpt: "Options for financing unexpected medical bills and healthcare expenses.",
      date: "October 24, 2025",
      category: "Loan Guides"
    },
    {
      title: "Wedding Loans: Financing Your Special Day",
      slug: "wedding-loans-guide",
      excerpt: "Smart ways to finance your wedding without breaking the bank.",
      date: "October 23, 2025",
      category: "Loan Guides"
    },
    {
      title: "Home Improvement Loans: Renovate with Confidence",
      slug: "home-improvement-loans",
      excerpt: "Finance your home renovations with the right loan option.",
      date: "October 22, 2025",
      category: "Loan Guides"
    },
    {
      title: "Student Loan Refinancing: Save on Interest",
      slug: "student-loan-refinancing",
      excerpt: "How refinancing your student loans could lower your monthly payments.",
      date: "October 21, 2025",
      category: "Loan Guides"
    },
    {
      title: "The Complete Guide to Personal Loans",
      slug: "complete-guide-personal-loans",
      excerpt: "Everything you need to know about personal loans, including types, benefits, and how to apply.",
      date: "October 20, 2025",
      category: "Loan Guides"
    },
    {
      title: "Business Loans for Small Businesses",
      slug: "small-business-loans",
      excerpt: "Funding options to help your small business grow and thrive.",
      date: "October 19, 2025",
      category: "Business Finance"
    },
    {
      title: "Bad Credit Loans: Your Options Explained",
      slug: "bad-credit-loan-options",
      excerpt: "Find out how to get a loan even with less-than-perfect credit.",
      date: "October 18, 2025",
      category: "Credit Building"
    },
    {
      title: "Co-Signing a Loan: Risks and Responsibilities",
      slug: "cosigning-loan-guide",
      excerpt: "What you need to know before co-signing a loan for someone else.",
      date: "October 17, 2025",
      category: "Financial Education"
    },
    {
      title: "How to Pay Off Loans Faster",
      slug: "pay-off-loans-faster",
      excerpt: "Proven strategies to accelerate your loan repayment and save on interest.",
      date: "October 16, 2025",
      category: "Debt Management"
    },
    {
      title: "Emergency Fund: Why You Need One and How to Build It",
      slug: "emergency-fund-guide",
      excerpt: "Discover why an emergency fund is crucial and strategies to build yours.",
      date: "October 15, 2025",
      category: "Financial Planning"
    },
    {
      title: "Secured vs Unsecured Loans: Key Differences",
      slug: "secured-vs-unsecured-loans",
      excerpt: "Understand the pros and cons of each loan type before you apply.",
      date: "October 14, 2025",
      category: "Loan Guides"
    },
    {
      title: "Vacation Loans: Finance Your Dream Trip",
      slug: "vacation-loans-guide",
      excerpt: "How to responsibly finance your next vacation without going into debt.",
      date: "October 13, 2025",
      category: "Loan Guides"
    },
    {
      title: "Debt-to-Income Ratio: What Lenders Look For",
      slug: "debt-to-income-ratio",
      excerpt: "Learn how to calculate your DTI and why it matters for loan approval.",
      date: "October 12, 2025",
      category: "Financial Education"
    },
    {
      title: "Credit Utilization: Impact on Your Credit Score",
      slug: "credit-utilization-guide",
      excerpt: "How your credit card balances affect your credit score and borrowing power.",
      date: "October 11, 2025",
      category: "Credit Building"
    },
    {
      title: "Managing Debt: Strategies for Success",
      slug: "managing-debt-strategies",
      excerpt: "Learn proven strategies to manage and eliminate debt faster.",
      date: "October 10, 2025",
      category: "Debt Management"
    },
    {
      title: "Loan Pre-Approval: What It Means and How to Get It",
      slug: "loan-preapproval-guide",
      excerpt: "The benefits of getting pre-approved before you apply for a loan.",
      date: "October 9, 2025",
      category: "Loan Guides"
    },
    {
      title: "Moving and Relocation Loans: Start Fresh",
      slug: "moving-relocation-loans",
      excerpt: "Finance your big move with the right loan option.",
      date: "October 8, 2025",
      category: "Loan Guides"
    },
    {
      title: "Tax Refund Advance Loans: Pros and Cons",
      slug: "tax-refund-advance",
      excerpt: "Should you get an advance on your tax refund? Here's what to know.",
      date: "October 7, 2025",
      category: "Financial Education"
    },
    {
      title: "Green Energy Loans: Finance Eco-Friendly Upgrades",
      slug: "green-energy-loans",
      excerpt: "How to finance solar panels and other eco-friendly home improvements.",
      date: "October 6, 2025",
      category: "Loan Guides"
    },
    {
      title: "Auto Loans Explained: What You Need to Know",
      slug: "auto-loans-explained",
      excerpt: "Get the facts about auto loans, including rates, terms, and how to qualify.",
      date: "October 5, 2025",
      category: "Loan Guides"
    },
    {
      title: "Refinancing Your Personal Loan: When It Makes Sense",
      slug: "refinancing-personal-loan",
      excerpt: "Learn when refinancing can save you money on your existing loan.",
      date: "October 4, 2025",
      category: "Loan Guides"
    },
    {
      title: "Pet Care Loans: Financing Veterinary Expenses",
      slug: "pet-care-loans",
      excerpt: "Options for covering unexpected or expensive pet medical bills.",
      date: "October 3, 2025",
      category: "Loan Guides"
    },
    {
      title: "Building Credit from Scratch: A Beginner's Guide",
      slug: "building-credit-scratch",
      excerpt: "Step-by-step guide to establishing credit when you're starting from zero.",
      date: "October 2, 2025",
      category: "Credit Building"
    },
    {
      title: "Payday Loans vs Personal Loans: The Better Choice",
      slug: "payday-vs-personal-loans",
      excerpt: "Why personal loans are almost always the smarter financial choice.",
      date: "October 1, 2025",
      category: "Financial Education"
    },
    {
      title: "Home Equity Loans vs HELOC: Making the Right Choice",
      slug: "home-equity-vs-heloc",
      excerpt: "Understand the differences between home equity loans and HELOCs for your financial goals.",
      date: "September 30, 2025",
      category: "Loan Guides"
    },
    {
      title: "Financial Planning for Millennials",
      slug: "millennial-financial-planning",
      excerpt: "Smart money strategies for building wealth in your 20s and 30s.",
      date: "September 29, 2025",
      category: "Financial Planning"
    },
    {
      title: "Retirement Account Loans: Borrowing from Your 401(k)",
      slug: "retirement-account-loans",
      excerpt: "The risks and benefits of taking a loan from your retirement savings.",
      date: "September 28, 2025",
      category: "Financial Education"
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Get unique categories
  const categories = ["All", ...Array.from(new Set(articles.map(a => a.category)))];

  // Filter articles
  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === "All" || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
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
            <Link href="/">
              <a className="inline-block">
                <Button variant="outline" className="border-[#0033A0] text-[#0033A0]">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back Home
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-[#0033A0] mb-4">Financial Education Center</h1>
          <p className="text-gray-600 mb-8">Expert tips and guides to help you make smarter financial decisions.</p>

          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0033A0] focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-[#0033A0] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-gray-600 mb-6">
            Showing {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'}
          </p>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {filteredArticles.map((article, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all hover:border-[#0033A0]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-[#FFA500] bg-orange-50 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-sm text-gray-500">{article.date}</span>
                </div>
                <h3 className="text-xl font-bold text-[#0033A0] mb-3 hover:text-[#FF8C00] transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-700 mb-4 line-clamp-2">{article.excerpt}</p>
                <Link href={`/blog/${article.slug}`}>
                  <a className="inline-flex items-center text-[#0033A0] hover:text-[#FF8C00] font-semibold cursor-pointer group">
                    Read More 
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Link>
              </div>
            ))}
          </div>

          {/* No Results Message */}
          {filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">No articles found matching your criteria.</p>
              <Button
                onClick={() => {
                  setSelectedCategory("All");
                  setSearchTerm("");
                }}
                variant="outline"
                className="border-[#0033A0] text-[#0033A0]"
              >
                Clear Filters
              </Button>
            </div>
          )}

          {/* CTA Section */}
          <div className="flex gap-4 mt-12">
            <Link href="/apply">
              <a className="inline-block">
                <CodeButton className="btn-lg" icon={<ArrowRight />}>
                  Apply Now
                </CodeButton>
              </a>
            </Link>
            <Link href="/">
              <a className="inline-block">
                <Button variant="outline" className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white px-8 py-6">
                  Back Home
                </Button>
              </a>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2025 AmeriLend, LLC. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
