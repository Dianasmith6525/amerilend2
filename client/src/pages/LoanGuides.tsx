import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function LoanGuides() {
  const guides = [
    {
      title: "Personal Loan Complete Guide",
      description: "Learn everything about personal loans, from how to apply to managing your loan responsibly.",
      topics: ["What is a personal loan?", "Loan amounts and terms", "Application process", "Repayment options", "Best uses for personal loans"]
    },
    {
      title: "Auto Loans Guide",
      description: "Complete guide to financing your vehicle purchase with favorable terms.",
      topics: ["New vs used vehicle loans", "How auto loan rates are calculated", "Down payment requirements", "Trade-in process", "Loan terms and repayment"]
    },
    {
      title: "Home Equity Loans & HELOC Guide",
      description: "Understand how to leverage your home equity for financing large projects or consolidation.",
      topics: ["Home equity calculation", "HELOC vs home equity loan", "Interest rates and terms", "Tax deductions", "Drawing and repayment process"]
    },
    {
      title: "Debt Consolidation Guide",
      description: "Simplify your finances by combining multiple debts into a single payment.",
      topics: ["How debt consolidation works", "Benefits of consolidation", "Calculating savings", "Credit score impact", "Long-term strategies"]
    },
    {
      title: "Rates & Terms Guide",
      description: "Understand how we determine rates and the flexible terms available to you.",
      topics: ["How we calculate rates", "Term options", "APR comparison", "Early repayment benefits", "Fee structure"]
    },
    {
      title: "Loan Approval Guide",
      description: "Discover what factors we consider and how to improve your chances of approval.",
      topics: ["Approval factors", "Credit score impact", "Income verification", "What disqualifies you", "Document requirements"]
    },
    {
      title: "Getting Your Funds",
      description: "Everything you need to know about funding, from approval to receiving your money.",
      topics: ["Timeline", "Direct deposit", "Bank requirements", "Fastest funding options", "Payment processing"]
    },
    {
      title: "Repayment Guide",
      description: "Master the art of repaying your loan on time and building your credit.",
      topics: ["Payment schedule", "Payment methods", "Early payoff strategy", "Credit building", "Handling missed payments"]
    },
    {
      title: "Short-Term Loans Explained",
      description: "Quick loans for immediate cash needs and emergency situations.",
      topics: ["Quick approval process", "Same-day funding", "Short repayment terms", "Fees and charges", "Responsible borrowing"]
    },
    {
      title: "Business Loans Guide",
      description: "Financing options for business startup, expansion, and working capital.",
      topics: ["Business loan types", "Documentation required", "Business plan preparation", "Collateral options", "Using funds wisely"]
    },
    {
      title: "Student Loans Guide",
      description: "Comprehensive guide to financing your education.",
      topics: ["Federal vs private loans", "FAFSA process", "Repayment plans", "Loan forgiveness programs", "Managing student debt"]
    },
    {
      title: "Credit Builder Loans",
      description: "Build or rebuild your credit with specialized credit builder loans.",
      topics: ["How credit builder loans work", "Building credit from scratch", "Monitoring progress", "Graduation to regular loans", "Best practices"]
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
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-[#0033A0] mb-4">Loan Guides</h1>
          <p className="text-gray-600 mb-12">Comprehensive guides to help you make informed decisions about personal loans.</p>

          <div className="grid md:grid-cols-2 gap-8">
            {guides.map((guide, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-[#0033A0] mb-2">{guide.title}</h3>
                <p className="text-gray-700 mb-4">{guide.description}</p>
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-600 mb-2">Topics Covered:</p>
                  <ul className="space-y-1">
                    {guide.topics.map((topic, i) => (
                      <li key={i} className="text-sm text-gray-600">• {topic}</li>
                    ))}
                  </ul>
                </div>
                <a href="#read-guide" className="text-[#0033A0] hover:text-[#FF8C00] font-semibold inline-block">
                  Read Guide →
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
