import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function AboutUs() {
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
          <h1 className="text-4xl font-bold text-[#0033A0] mb-8">About AmeriLend</h1>

          <section className="prose prose-lg max-w-none mb-12">
            <h2 className="text-2xl font-bold text-[#0033A0] mt-8 mb-4">Who We Are</h2>
            <p className="text-gray-700 mb-6">
              AmeriLend is a leading online lending platform committed to providing accessible personal loans to Americans 
              who need financial flexibility. We partner with trusted financial institutions to offer quick approvals, 
              competitive rates, and funding as soon as the same business day.
            </p>

            <h2 className="text-2xl font-bold text-[#0033A0] mt-8 mb-4">Our Mission</h2>
            <p className="text-gray-700 mb-6">
              Our mission is to provide fast, fair, and accessible personal loans to help people achieve their financial goals. 
              We believe that everyone deserves a second chance, which is why we consider more than just credit scores when 
              evaluating loan applications.
            </p>

            <h2 className="text-2xl font-bold text-[#0033A0] mt-8 mb-4">Why Choose AmeriLend?</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
              <li>Quick online application process</li>
              <li>Decisions often made in minutes</li>
              <li>Same-day funding available</li>
              <li>Competitive rates and terms</li>
              <li>We consider more than just your credit score</li>
              <li>Transparent, no hidden fees</li>
              <li>Excellent customer support</li>
            </ul>

            <h2 className="text-2xl font-bold text-[#0033A0] mt-8 mb-4">Our Commitment</h2>
            <p className="text-gray-700 mb-6">
              AmeriLend is committed to providing transparent, fair lending practices. We comply with all federal and state 
              lending regulations and maintain the highest standards of data security to protect your personal information.
            </p>

            <h2 className="text-2xl font-bold text-[#0033A0] mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-6">
              Have questions? Our customer support team is here to help:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700">
                <strong>Phone:</strong> <a href="tel:945-212-1609" className="text-[#0033A0] hover:underline">(945) 212-1609</a><br />
                <strong>Email:</strong> <a href="mailto:support@amerilend.com" className="text-[#0033A0] hover:underline">support@amerilend.com</a><br />
                <strong>Hours:</strong> Monday – Friday, 7 a.m. – 11:00 p.m. and Saturday and Sunday, 9 a.m. – 5:00 p.m. Central Time
              </p>
            </div>
          </section>

          <div className="flex gap-4">
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
