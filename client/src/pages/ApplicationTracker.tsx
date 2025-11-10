import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2, CheckCircle2, Clock, XCircle, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import SEO from "@/components/SEO";
import { APP_LOGO, APP_TITLE } from "@/const";

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
      // Try to fetch application data using the reference number
      // This assumes there's a tRPC endpoint for this
      const result = await trpc.applications.getByReference.query({
        referenceNumber: referenceNumber.trim(),
      });
      
      setApplicationData(result);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <SEO
        title={`Track Your Application - ${APP_TITLE}`}
        description="Track your loan application status using your reference number"
      />

      {/* Header */}
      <div className="border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold flex items-center gap-2">
              {APP_LOGO && <img src={APP_LOGO} alt={APP_TITLE} className="h-8" />}
              {APP_TITLE}
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-2">
            Track Your Application
          </h1>
          <p className="text-slate-600">
            Enter your reference number to check the status of your loan application
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Enter Reference Number</CardTitle>
            <CardDescription>
              You can find your reference number in your confirmation email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  placeholder="e.g., REF-2024-001234"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  disabled={isLoading}
                  className="text-lg"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isLoading ? "Searching..." : "Search Application"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50 mb-8">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Search Error</p>
                  <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Status */}
        {applicationData && (
          <Card className={`border-2 ${getStatusColor(applicationData.status)}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Application Status</CardTitle>
                  <CardDescription>Reference: {referenceNumber}</CardDescription>
                </div>
                {getStatusIcon(applicationData.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-600 font-medium">Status</span>
                  <span className="text-lg font-bold text-slate-900 capitalize">
                    {applicationData.status}
                  </span>
                </div>

                {applicationData.applicantName && (
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">Applicant Name</span>
                    <span className="text-slate-900">{applicationData.applicantName}</span>
                  </div>
                )}

                {applicationData.loanAmount && (
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">Loan Amount</span>
                    <span className="text-slate-900">
                      ${applicationData.loanAmount.toLocaleString()}
                    </span>
                  </div>
                )}

                {applicationData.appliedAt && (
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-200">
                    <span className="text-slate-600 font-medium">Applied Date</span>
                    <span className="text-slate-900">
                      {new Date(applicationData.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {applicationData.updatedAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 font-medium">Last Updated</span>
                    <span className="text-slate-900">
                      {new Date(applicationData.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {applicationData.notes && (
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <p className="text-slate-600 font-medium mb-2">Notes</p>
                  <p className="text-slate-700">{applicationData.notes}</p>
                </div>
              )}

              <div className="pt-4">
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Sign In for More Details
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        {!searched && (
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>
                • Check your confirmation email for your reference number
              </p>
              <p>
                • Reference numbers typically start with REF- followed by numbers
              </p>
              <p>
                • If you can't find your reference number, please contact our support team
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
