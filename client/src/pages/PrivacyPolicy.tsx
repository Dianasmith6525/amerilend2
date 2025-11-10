import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-[#0033A0]">Ameri</span>
              <span className="text-[#D4AF37]">Lend</span>
              <sup className="text-xs text-[#0033A0]">®</sup>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <Link href="/apply">
            <Button variant="ghost" className="mb-6 text-[#0033A0]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>

          <div className="bg-white rounded-lg shadow p-8 space-y-6">
            <h1 className="text-4xl font-bold text-[#0033A0] mb-8">Privacy Policy</h1>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">1. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed">
                AmeriLend collects information you provide directly to us, such as when you create an account, apply for a loan, or communicate with us. This includes:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li>Personal identification information (name, email, phone number)</li>
                <li>Financial information (income, employment details, bank account information)</li>
                <li>Identification documents (driver's license, SSN)</li>
                <li>Address and demographic information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">2. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li>Process your loan application</li>
                <li>Verify your identity and prevent fraud</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Send you communications about your account</li>
                <li>Improve our services and customer experience</li>
                <li>Conduct credit checks and background verification</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">3. Information Sharing</h2>
              <p className="text-gray-700 leading-relaxed">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li>Our bank partners to originate and service your loan</li>
                <li>Credit bureaus for credit reporting purposes</li>
                <li>Service providers who assist us in operating our website</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">4. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet or electronic storage is completely secure. We cannot guarantee absolute security but commit to protecting your data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">5. Cookies and Tracking</h2>
              <p className="text-gray-700 leading-relaxed">
                AmeriLend uses cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze site usage. You can control cookie settings in your browser.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">6. Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                Depending on your location, you may have certain privacy rights, including the right to access, correct, or delete your personal information. To exercise these rights, please contact us at info@amerilendloan.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">7. California Consumer Privacy Act (CCPA)</h2>
              <p className="text-gray-700 leading-relaxed">
                If you are a California resident, you have the right to know what personal information is collected, used, shared, or sold. You also have the right to delete personal information collected and the right to opt-out of the sale of personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">8. Changes to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date below.
              </p>
            </section>

            <section className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-[#0033A0]">
              <p className="text-sm text-gray-600">
                Last Updated: November 2025. If you have any questions about this Privacy Policy, please contact us at info@amerilendloan.com or (800) 990-9130.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
