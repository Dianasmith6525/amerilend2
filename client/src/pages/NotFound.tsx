import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home, FileText, Phone, Search } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  const handleApply = () => {
    setLocation("/apply");
  };

  const handleCheckStatus = () => {
    setLocation("/check-status");
  };

  const handleDashboard = () => {
    setLocation("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* AmeriLend Logo/Header */}
      <div className="absolute top-8 left-8">
        <h1 className="text-2xl font-bold text-blue-600">AmeriLend</h1>
      </div>

      <Card className="w-full max-w-2xl mx-4 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardContent className="pt-12 pb-10 text-center px-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-100 rounded-full animate-pulse opacity-50" />
              <AlertCircle className="relative h-20 w-20 text-blue-600" />
            </div>
          </div>

          <h1 className="text-6xl font-bold text-slate-900 mb-3">404</h1>

          <h2 className="text-2xl font-semibold text-slate-700 mb-4">
            Page Not Found
          </h2>

          <p className="text-slate-600 mb-8 leading-relaxed text-lg">
            We couldn't find the page you're looking for.
            <br />
            It may have been moved, deleted, or never existed.
          </p>

          {/* Navigation Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <Button
              onClick={handleGoHome}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              <Home className="w-5 h-5 mr-2" />
              Go Home
            </Button>

            <Button
              onClick={handleApply}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg transition-all duration-200"
            >
              <FileText className="w-5 h-5 mr-2" />
              Apply for Loan
            </Button>

            <Button
              onClick={handleCheckStatus}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg transition-all duration-200"
            >
              <Search className="w-5 h-5 mr-2" />
              Check Application Status
            </Button>

            <Button
              onClick={handleDashboard}
              variant="outline"
              className="border-blue-600 text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg transition-all duration-200"
            >
              <Home className="w-5 h-5 mr-2" />
              My Dashboard
            </Button>
          </div>

          {/* Support Contact */}
          <div className="pt-6 border-t border-slate-200">
            <p className="text-slate-600 text-sm mb-2">Need help?</p>
            <div className="flex items-center justify-center gap-2 text-blue-600 font-semibold">
              <Phone className="w-4 h-4" />
              <a href="tel:+19452121609" className="hover:underline">
                (945) 212-1609
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} AmeriLend. All rights reserved.</p>
      </div>
    </div>
  );
}
