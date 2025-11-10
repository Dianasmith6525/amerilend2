import { Button } from "@/components/ui/button";
import { CodeButton } from "@/components/ui/CodeButton";
import { Link } from "wouter";
import { ChevronLeft, ArrowRight } from "lucide-react";
import SEO from "@/components/SEO";

export default function FAQ() {
  const faqs = [
    {
      question: "How long does the application process take?",
      answer: "Most applications are reviewed within minutes. Once approved, you may receive funding as soon as the same business day if you complete verification before 12:00 PM CT on a business day."
    },
    {
      question: "What if I have bad credit?",
      answer: "We consider more than just your credit score. While credit history is one factor, we also look at income, employment history, and other factors to determine your eligibility."
    },
    {
      question: "Will applying affect my credit score?",
      answer: "No. Our initial credit inquiry is a soft pull that will not appear on your credit report or affect your FICO score."
    },
    {
      question: "What are the loan amounts and terms?",
      answer: "We offer personal loans ranging from $500 to $100,000 with flexible repayment terms. The exact amount and terms depend on your creditworthiness and income."
    },
    {
      question: "How will I receive the money?",
      answer: "Once approved, funds are deposited directly into your bank account via ACH. This typically happens the same business day if approved before 12:00 PM CT."
    },
    {
      question: "What documents do I need?",
      answer: "You'll need proof of income (recent pay stubs), bank account information, and a valid government-issued ID. Additional documentation may be required for verification."
    },
    {
      question: "What are your interest rates?",
      answer: "Our interest rates vary based on credit profile, income, and loan amount. The maximum APR we offer is 195%, which is significantly lower than typical payday loan rates."
    },
    {
      question: "Can I pay off my loan early?",
      answer: "Yes! We encourage early repayment with no prepayment penalties. Pay off your loan whenever you want without extra fees."
    },
    {
      question: "What is the maximum loan amount I can borrow?",
      answer: "The maximum loan amount is $100,000. Your actual limit depends on factors like income, credit history, and employment status."
    },
    {
      question: "Do you offer loans to self-employed individuals?",
      answer: "Yes, we do consider self-employed applicants. You'll need to provide additional documentation such as tax returns and bank statements to verify your income."
    },
    {
      question: "What states do you operate in?",
      answer: "We operate in most states across the United States. Visit our website or contact our support team to confirm if we service your state."
    },
    {
      question: "What happens if I can't make a payment?",
      answer: "If you're having difficulty making a payment, contact our customer support team immediately. We may be able to work out a modified payment plan or other solutions."
    },
    {
      question: "How is my personal information protected?",
      answer: "We use industry-leading encryption and security measures to protect your data. Your information is never shared with third parties without your consent, except as required by law."
    },
    {
      question: "What is the minimum income requirement?",
      answer: "While we don't have a strict minimum income requirement, you must have a regular source of income and be able to demonstrate your ability to repay the loan."
    },
    {
      question: "Can I get a loan if I have outstanding collections or charge-offs?",
      answer: "It's possible, but it depends on the circumstances. We review each application individually and consider factors beyond just your credit report."
    },
    {
      question: "How often can I apply for a loan?",
      answer: "You can apply for a new loan after your current loan is paid off or within 30 days of your last application. Applying frequently may impact your credit."
    },
    {
      question: "Is there a prepayment penalty?",
      answer: "No, there are no prepayment penalties. You can pay off your loan early without any additional fees or charges."
    },
    {
      question: "What happens after I'm approved?",
      answer: "After approval, you'll review and sign your loan agreement electronically. Once signed, we'll process your disbursement, and you should receive funds within 1 business day."
    },
    {
      question: "Can I use my loan for any purpose?",
      answer: "Yes, personal loans can be used for almost any purpose - debt consolidation, home improvements, emergency expenses, education, or anything else you need."
    },
    {
      question: "Do you offer co-borrower options?",
      answer: "Currently, we process individual applications. However, if you have someone who would co-sign, it may improve your approval chances."
    },
    {
      question: "What if I'm denied?",
      answer: "If your application is denied, we'll provide specific reasons. You can reapply after addressing the issues or contact our support team for guidance."
    },
    {
      question: "How does AmeriLend compare to other lenders?",
      answer: "AmeriLend offers competitive rates, quick approvals, same-day funding, and a simple online process. We also consider more than just credit scores, giving more people access to credit."
    },
    {
      question: "What types of loans does AmeriLend offer?",
      answer: "We offer 15 types of loans including: Personal, Installment, Short-Term, Auto, Home Equity, HELOC, Student, Business, Debt Consolidation, Mortgage, Private Money, Title, Credit Builder, Signature, and Peer-to-Peer loans."
    },
    {
      question: "What's the difference between a personal loan and an installment loan?",
      answer: "Personal loans are flexible unsecured loans for general use. Installment loans are fixed-term loans with scheduled payments. Both offer competitive rates, but installment loans may have specific eligibility requirements."
    },
    {
      question: "What documents do I need for each loan type?",
      answer: "Required documents vary by loan type. Generally, you'll need ID, proof of income, bank statements, and proof of address. Secured loans (auto, home equity) require additional documentation like vehicle info or home ownership proof."
    },
    {
      question: "Can I get an auto loan for a used vehicle?",
      answer: "Yes! We offer auto loans for both new and used vehicles. You'll need to provide vehicle information (VIN, make, model, year), insurance quote, and standard income verification documents."
    },
    {
      question: "What is a home equity loan vs HELOC?",
      answer: "A home equity loan provides a lump sum with fixed payments. A HELOC (Home Equity Line of Credit) is a revolving line of credit like a credit card. Choose based on whether you need funds upfront or flexibility."
    },
    {
      question: "Do you offer business loans?",
      answer: "Yes! We offer business loans for startups and established businesses. You'll need a business license, business plan (for startups), business tax returns, and financial statements."
    },
    {
      question: "What is a debt consolidation loan?",
      answer: "A debt consolidation loan combines multiple debts (credit cards, other loans) into one manageable payment with a single interest rate, potentially saving you money and simplifying payments."
    },
    {
      question: "How quickly can I get approved for a short-term loan?",
      answer: "Short-term loans can be approved within hours and funded the same business day. You'll need recent pay stubs, proof of income, and an active checking account."
    },
    {
      question: "What is a credit builder loan?",
      answer: "A credit builder loan is designed to help build or rebuild credit. You make payments into a savings account, and the lender reports payments to credit bureaus to build your credit history."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <SEO
        title="Frequently Asked Questions"
        description="Find answers to common questions about AmeriLend personal loans, application process, rates, terms, and loan types. Get quick answers about credit requirements, funding speed, and more."
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-[#0033A0] mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-12">Get answers to common questions about AmeriLend loans and our application process.</p>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-[#0033A0] mb-3">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-blue-50 p-8 rounded-lg text-center">
            <h3 className="text-2xl font-bold text-[#0033A0] mb-4">Still have questions?</h3>
            <p className="text-gray-700 mb-6">Our customer support team is ready to help you.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="tel:945-212-1609" className="inline-block">
                <CodeButton className="btn-lg w-full sm:w-auto">
                  Call (945) 212-1609
                </CodeButton>
              </a>
              <a href="mailto:support@amerilendloan.com" className="inline-block">
                <Button variant="outline" className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white px-8 py-6 w-full sm:w-auto">
                  Email Support
                </Button>
              </a>
            </div>
          </div>

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
