import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CaliforniaPrivacy() {
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
            <h1 className="text-4xl font-bold text-[#0033A0] mb-8">California Privacy Rights</h1>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">California Consumer Privacy Act (CCPA)</h2>
              <p className="text-gray-700 leading-relaxed">
                The California Consumer Privacy Act (CCPA) provides California residents with specific rights regarding their personal information. AmeriLend is committed to honoring these rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">Your CCPA Rights</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-[#0033A0] mb-2">Right to Know</h3>
                  <p className="text-gray-700">You have the right to know what personal information AmeriLend collects and how it is used and shared.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#0033A0] mb-2">Right to Delete</h3>
                  <p className="text-gray-700">You have the right to request deletion of personal information we have collected from you, subject to certain exceptions.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#0033A0] mb-2">Right to Opt-Out</h3>
                  <p className="text-gray-700">You have the right to opt-out of the sale or sharing of your personal information.</p>
                </div>
                <div>
                  <h3 className="font-bold text-[#0033A0] mb-2">Right to Correct</h3>
                  <p className="text-gray-700">You have the right to correct inaccurate personal information.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">How to Exercise Your Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                To exercise any of these rights, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-gray-100 rounded space-y-2">
                <p><strong>Email:</strong> <a href="mailto:info@amerilend.com" className="text-[#0033A0] hover:underline">info@amerilend.com</a></p>
                <p><strong>Phone:</strong> (800) 990-9130</p>
                <p><strong>Hours:</strong> Monday – Friday: 7 a.m. – 11:00 p.m. Central Time</p>
                <p className="text-sm">Saturday & Sunday: 9 a.m. – 5:00 p.m. Central Time</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">Do Not Sell or Share My Personal Information</h2>
              <p className="text-gray-700 leading-relaxed">
                California residents have the right to opt-out of the sale or sharing of their personal information. Click the link below to submit your opt-out request:
              </p>
              <div className="mt-4">
                <Button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white">
                  <a href="mailto:info@amerilend.com?subject=Do%20Not%20Sell%20My%20Personal%20Information">
                    Do Not Sell My Personal Information
                  </a>
                </Button>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">Shine the Light Law</h2>
              <p className="text-gray-700 leading-relaxed">
                California residents may request information about the categories of personal information we share with third parties for their direct marketing purposes. To make such a request, please contact us using the information provided above.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">Non-Discrimination</h2>
              <p className="text-gray-700 leading-relaxed">
                AmeriLend will not discriminate against you for exercising your CCPA rights. We will not deny you services, charge you different prices, or provide different quality of service based solely on your exercise of CCPA rights.
              </p>
            </section>

            <section className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-[#0033A0]">
              <p className="text-sm text-gray-600">
                Last Updated: November 2025. For questions about your California privacy rights, please contact us at info@amerilend.com or (800) 990-9130.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
