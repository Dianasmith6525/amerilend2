import { Button } from "@/components/ui/button";
import { CodeButton } from "@/components/ui/CodeButton";
import { Link } from "wouter";
import { ChevronLeft, ArrowRight, Search } from "lucide-react";
import { useState } from "react";
import SEO from "@/components/SEO";

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
      slug: "choose-right-loan-term",
      excerpt: "Learn how to select the best repayment period for your financial situation.",
      date: "October 26, 2025",
      category: "Loan Guides"
    },
    {
      title: "5 Common Financial Mistakes to Avoid",
      slug: "avoid-financial-mistakes",
      excerpt: "Avoid these costly mistakes that could impact your financial health and credit score.",
      date: "October 25, 2025",
      category: "Financial Education"
    },
    {
      title: "The Complete Guide to Personal Loans",
      slug: "complete-guide-personal-loans",
      excerpt: "Everything you need to know about personal loans, including types, benefits, and how to apply.",
      date: "October 20, 2025",
      category: "Loan Guides"
    },
    {
      title: "Emergency Fund: Why You Need One and How to Build It",
      slug: "emergency-fund-guide",
      excerpt: "Discover why an emergency fund is crucial and strategies to build yours.",
      date: "October 15, 2025",
      category: "Financial Planning"
    },
    {
      title: "Managing Debt: Proven Strategies",
      slug: "managing-debt-strategies",
      excerpt: "Learn effective strategies to manage and reduce your debt load.",
      date: "October 10, 2025",
      category: "Debt Management"
    },
    {
      title: "Auto Loans Explained: Everything You Need to Know",
      slug: "auto-loans-explained",
      excerpt: "A comprehensive guide to understanding auto loans and financing your next vehicle.",
      date: "October 5, 2025",
      category: "Loan Guides"
    },
    {
      title: "Home Equity vs HELOC: Which is Right for You?",
      slug: "home-equity-vs-heloc",
      excerpt: "Compare home equity loans and HELOCs to determine the best option for your needs.",
      date: "October 1, 2025",
      category: "Loan Guides"
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
      <SEO
        title="Personal Loan Blog & Financial Education"
        description="Expert articles on personal loans, credit building, debt management, and financial education. Learn about loan types, APR, credit scores, and smart borrowing strategies."
        ogType="website"
      />
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-[#0033A0]">Ameri</span>
              <span className="text-[#D4AF37]">Lend</span>
              <sup className="text-xs text-[#0033A0]">®</sup>
            </Link>
            <Link href="/" className="inline-block">
              <Button variant="outline" className="border-[#0033A0] text-[#0033A0]">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back Home
              </Button>
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
