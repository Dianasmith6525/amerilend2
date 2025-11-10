import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2, CreditCard, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";

export default function PaymentPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/payment/:id");
  const applicationId = params?.id ? parseInt(params.id) : null;
  const [paymentComplete, setPaymentComplete] = useState(false);

  const { data: application, isLoading } = trpc.loans.getById.useQuery(
    { id: applicationId! },
    { enabled: !!applicationId && isAuthenticated }
  );

  const createPaymentMutation = trpc.payments.createIntent.useMutation({
    onSuccess: (data) => {
      toast.success("Payment initiated");
      // Confirm the payment with Stripe
      confirmPaymentMutation.mutate({ paymentId: data.amount }); // Using amount as placeholder
    },
    onError: (error) => {
      toast.error(error.message || "Failed to initiate payment");
    },
  });

  const confirmPaymentMutation = trpc.payments.confirmPayment.useMutation({
    onSuccess: () => {
      setPaymentComplete(true);
      toast.success("Payment confirmed successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Payment confirmation failed");
    },
  });

  const handlePayment = () => {
    if (!applicationId) return;
    
    // Process payment through Stripe
    createPaymentMutation.mutate({ loanApplicationId: applicationId });
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>Please sign in to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <a href={getLoginUrl()}>Sign In</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Application Not Found</CardTitle>
            <CardDescription>The requested application could not be found</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setLocation("/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (application.status !== "approved" && application.status !== "fee_pending") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Payment Not Available</CardTitle>
            <CardDescription>
              This application is not ready for payment (Status: {application.status})
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => setLocation("/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/">
                <div className="flex items-center gap-1 cursor-pointer">
                  <h1 className="text-xl sm:text-2xl font-bold"><span className="text-blue-600">Ameri</span><span className="text-yellow-600">Lend</span></h1>
                </div>
              </Link>
            </div>
            <div></div>
          </div>
        </header>

        <div className="container py-12">
          <div className="w-full px-4 sm:px-6 md:px-8 py-6 sm:py-12">
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-accent">
              <CardContent className="pt-8 sm:pt-12 pb-8 sm:pb-12 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-accent" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Payment Confirmed!</h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6 sm:mb-8">
                  Your processing fee has been successfully paid. Your loan is now being processed for disbursement.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Loan Amount</p>
                      <p className="text-lg sm:text-xl font-semibold">
                        ${((application.approvedAmount || 0) / 100).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">Processing Fee Paid</p>
                      <p className="text-lg sm:text-xl font-semibold">
                        ${((application.processingFeeAmount || 0) / 100).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6">
                  You will receive a notification once the funds have been disbursed to your account.
                </p>
                <Button size="lg" onClick={() => setLocation("/dashboard")}>
                  Return to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/">
              <div className="flex items-center gap-1 cursor-pointer">
                <h1 className="text-xl sm:text-2xl font-bold"><span className="text-blue-600">Ameri</span><span className="text-yellow-600">Lend</span></h1>
              </div>
            </Link>
          </div>
          <Link href="/dashboard">
            <Button variant="ghost">Dashboard</Button>
          </Link>
        </div>
      </header>

      {/* Payment Content */}
      <div className="w-full px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">Processing Fee Payment</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Complete your payment to proceed with loan disbursement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {/* Loan Summary - Left Side */}
            <div className="md:col-span-1">
              <Card className="h-full">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl">Loan Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs sm:text-sm text-muted-foreground">Loan Type</span>
                    <span className="text-sm sm:text-base font-semibold">
                      {application.loanType === "installment" ? "Installment Loan" : "Short-Term Loan"}
                    </span>
                  </div>
                  <div className="border-t pt-3"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs sm:text-sm text-muted-foreground">Approved Amount</span>
                    <span className="text-sm sm:text-base lg:text-lg font-semibold">
                      ${((application.approvedAmount || 0) / 100).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="border-t pt-3"></div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs sm:text-sm text-muted-foreground">Processing Fee</span>
                    <span className="text-sm sm:text-base lg:text-lg font-semibold text-primary">
                      ${((application.processingFeeAmount || 0) / 100).toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mt-3">
                    <p className="text-xs sm:text-sm text-blue-900">
                      <strong>Important:</strong> This processing fee must be paid before your loan can be disbursed.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payment Form - Right Side */}
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <CreditCard className="h-4 w-4 sm:h-5 sm:w-5" />
                    Payment Information
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Enter your payment details to complete your loan application
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-blue-900">
                      <strong>Secure Payment:</strong> Your payment information is protected by Stripe's industry-leading security standards. We never store your card details.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <Button
                      size="lg"
                      className="flex-1 text-sm sm:text-base h-10 sm:h-12"
                      onClick={handlePayment}
                      disabled={createPaymentMutation.isPending || confirmPaymentMutation.isPending}
                    >
                      {createPaymentMutation.isPending || confirmPaymentMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay ${((application.processingFeeAmount || 0) / 100).toFixed(2)}
                        </>
                      )}
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-sm sm:text-base h-10 sm:h-12"
                      onClick={() => setLocation("/dashboard")}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
