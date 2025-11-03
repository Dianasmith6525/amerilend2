import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function Blog() {
  const articles = [
    {
      title: "Complete Guide to USA Loan Types",
      excerpt: "Explore all 15 types of loans available in the USA, their requirements, and which one is right for you.",
      date: "November 3, 2025"
    },
    {
      title: "Personal vs Installment Loans: Which Is Better?",
      excerpt: "Compare personal and installment loans to find the right financing option for your needs.",
      date: "November 2, 2025"
    },
    {
      title: "How to Improve Your Credit Score",
      excerpt: "Learn practical tips to boost your credit score and qualify for better loan rates.",
      date: "November 1, 2025"
    },
    {
      title: "Personal Loan vs. Credit Card: Which is Right for You?",
      excerpt: "Understand the differences and discover which option works best for your financial needs.",
      date: "October 28, 2025"
    },
    {
      title: "5 Common Financial Mistakes to Avoid",
      excerpt: "Avoid these costly mistakes that could impact your financial health and credit score.",
      date: "October 25, 2025"
    },
    {
      title: "The Complete Guide to Personal Loans",
      excerpt: "Everything you need to know about personal loans, including types, benefits, and how to apply.",
      date: "October 20, 2025"
    },
    {
      title: "Emergency Fund: Why You Need One and How to Build It",
      excerpt: "Discover why an emergency fund is crucial and strategies to build yours.",
      date: "October 15, 2025"
    },
    {
      title: "Managing Debt: Strategies for Success",
      excerpt: "Learn proven strategies to manage and eliminate debt faster.",
      date: "October 10, 2025"
    },
    {
      title: "Auto Loans Explained: What You Need to Know",
      excerpt: "Get the facts about auto loans, including rates, terms, and how to qualify.",
      date: "October 5, 2025"
    },
    {
      title: "Home Equity Loans vs HELOC: Making the Right Choice",
      excerpt: "Understand the differences between home equity loans and HELOCs for your financial goals.",
      date: "September 30, 2025"
    }
  ];

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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-[#0033A0] mb-4">Financial Blog</h1>
          <p className="text-gray-600 mb-12">Expert tips and guides to help you make smarter financial decisions.</p>

          <div className="grid gap-8">
            {articles.map((article, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <p className="text-sm text-gray-500 mb-2">{article.date}</p>
                <h3 className="text-2xl font-bold text-[#0033A0] mb-3">{article.title}</h3>
                <p className="text-gray-700 mb-4">{article.excerpt}</p>
                <a href="#read-more" className="text-[#0033A0] hover:text-[#FF8C00] font-semibold">
                  Read More →
                </a>
              </div>
            ))}
          </div>

          <div className="flex gap-4 mt-12">
            <Link href="/apply">
              <a className="inline-block">
                <Button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white font-semibold px-8 py-6">
                  Apply Now
                </Button>
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
