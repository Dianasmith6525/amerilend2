import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, CheckCircle2, Clock, XCircle, Home } from "lucide-react";
import SEO from "@/components/SEO";
import { APP_TITLE } from "@/const";

export default function ApplicationTracker() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [searched, setSearched] = useState(false);
  const [applicationData, setApplicationData] = useState<any>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!referenceNumber.trim()) {
      setError("Please enter a reference number");
      return;
    }

    setIsLoading(true);
    setError("");
    setApplicationData(null);

    try {
      // For now, this is a demo showing reference number search
      // In production, call: await trpc.applications.trackByReference.query()
      
      // Demo: Show a sample application status
      setApplicationData({
        status: "pending",
        applicantName: "Applicant Name",
        loanAmount: 5000,
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: "Your application is being reviewed. You will receive updates via email.",
      });
      setSearched(true);
    } catch (err: any) {
      setError(
        err?.message || "Application not found. Please check your reference number and try again."
      );
      setSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case "pending":
        return <Clock className="w-6 h-6 text-yellow-600" />;
      case "rejected":
      case "denied":
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertCircle className="w-6 h-6 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-50 border-green-200";
      case "pending":
        return "bg-yellow-50 border-yellow-200";
      case "rejected":
      case "denied":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <SEO
        title={`Track Your Application - ${APP_TITLE}`}
        description="Track your loan application status"
      />

      {/* Simple Header */}
      <header className="w-full bg-white border-b border-gray-200">
        <div className="h-16 flex items-center justify-between px-8 max-w-7xl mx-auto w-full">
          <h1 className="text-2xl font-bold text-blue-900">{APP_TITLE}</h1>
          <Link href="/">
            <Button size="sm" variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full px-6 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Title Section */}
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Track Your Application</h2>
            <p className="text-lg text-gray-600">Enter your reference number to check status</p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8 border border-gray-200">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Reference Number</label>
                <input
                  type="text"
                  placeholder="e.g., REF-2024-001234"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>
              <Button 
                type="submit" 
                disabled={isLoading} 
                className="w-full py-3 text-base"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? "Searching..." : "Search Application"}
              </Button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 flex gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">Search Error</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Application Status */}
          {applicationData && (
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200 mb-8">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">Application Status</h3>
                  <p className="text-gray-600">Reference: {referenceNumber}</p>
                </div>
                {getStatusIcon(applicationData.status)}
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium">Status</span>
                  <span className={`text-lg font-bold capitalize px-4 py-2 rounded ${
                    applicationData.status === "approved" ? "bg-green-100 text-green-800" :
                    applicationData.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    applicationData.status === "rejected" ? "bg-red-100 text-red-800" :
                    "bg-blue-100 text-blue-800"
                  }`}>
                    {applicationData.status}
                  </span>
                </div>

                {applicationData.applicantName && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Applicant</span>
                    <span className="text-gray-900">{applicationData.applicantName}</span>
                  </div>
                )}

                {applicationData.loanAmount && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Loan Amount</span>
                    <span className="text-gray-900 font-semibold">
                      ${applicationData.loanAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                {applicationData.appliedAt && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Applied Date</span>
                    <span className="text-gray-900">
                      {new Date(applicationData.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {applicationData.updatedAt && (
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <span className="text-gray-600 font-medium">Last Updated</span>
                    <span className="text-gray-900">
                      {new Date(applicationData.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {applicationData.notes && (
                <div className="mt-8 p-5 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-gray-600 font-medium mb-2">Notes</p>
                  <p className="text-gray-700">{applicationData.notes}</p>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Sign In for More Details
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Help Section */}
          {!searched && (
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Need Help?</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Check your confirmation email for your reference number</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Reference numbers start with REF- followed by numbers</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Can't find it? Contact our support team</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
