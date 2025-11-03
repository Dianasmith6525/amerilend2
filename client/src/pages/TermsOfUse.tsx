import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfUse() {
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
            <h1 className="text-4xl font-bold text-[#0033A0] mb-8">Terms of Use</h1>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">1. Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing and using AmeriLend, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">2. Use License</h2>
              <p className="text-gray-700 leading-relaxed">
                Permission is granted to temporarily download one copy of the materials (information or software) on AmeriLend for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                <li>Modifying or copying the materials</li>
                <li>Using the materials for any commercial purpose or for any public display</li>
                <li>Attempting to decompile or reverse engineer any software contained on AmeriLend</li>
                <li>Removing any copyright or other proprietary notations from the materials</li>
                <li>Transferring the materials to another person or "mirroring" the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">3. Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                The materials on AmeriLend are provided on an 'as is' basis. AmeriLend makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">4. Limitations</h2>
              <p className="text-gray-700 leading-relaxed">
                In no event shall AmeriLend or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on AmeriLend, even if AmeriLend or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">5. Accuracy of Materials</h2>
              <p className="text-gray-700 leading-relaxed">
                The materials appearing on AmeriLend could include technical, typographical, or photographic errors. AmeriLend does not warrant that any of the materials on AmeriLend are accurate, complete, or current. AmeriLend may make changes to the materials contained on AmeriLend at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">6. Links</h2>
              <p className="text-gray-700 leading-relaxed">
                AmeriLend has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by AmeriLend of the site. Use of any such linked website is at the user's own risk.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">7. Modifications</h2>
              <p className="text-gray-700 leading-relaxed">
                AmeriLend may revise these terms of use for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of use.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-3">8. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </p>
            </section>

            <section className="mt-8 p-4 bg-blue-50 rounded-lg border-l-4 border-[#0033A0]">
              <p className="text-sm text-gray-600">
                Last Updated: November 2025. If you have any questions about these Terms of Use, please contact us at info@amerilend.com or (800) 990-9130.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
