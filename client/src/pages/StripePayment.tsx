import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { FullPageLoader } from "@/components/ui/loader";
import { CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function StripePaymentPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/payment/:id");
  const applicationId = params?.id ? parseInt(params.id) : null;
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Form state
  const [cardNumber, setCardNumber] = useState("4242424242424242");
  const [expiryMonth, setExpiryMonth] = useState("12");
  const [expiryYear, setExpiryYear] = useState("25");
  const [cvv, setCvv] = useState("123");
  const [zipCode, setZipCode] = useState("12345");

  const { data: application, isLoading } = trpc.loans.getById.useQuery(
    { id: applicationId! },
    { enabled: !!applicationId && isAuthenticated }
  );

  const { data: stripeConfig } = trpc.payments.getStripeConfig.useQuery();

  const processStripePayment = trpc.payments.processStripePayment.useMutation({
    onSuccess: (data) => {
      setPaymentComplete(true);
      toast.success("Payment processed successfully!");
      setProcessing(false);

      // Trigger success confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      const randomInRange = (min: number, max: number) =>
        Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#00A651", "#0033A0", "#D4AF37", "#FFA500"],
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#00A651", "#0033A0", "#D4AF37", "#FFA500"],
        });
      }, 250);

      // Redirect after 2 seconds
      setTimeout(() => {
        setLocation("/dashboard");
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || "Payment processing failed");
      setProcessing(false);
    },
  });

  if (authLoading || isLoading) {
    return <FullPageLoader />;
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Please Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              You need to be signed in to make a payment.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loan Not Found</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md border-2 border-green-500">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl text-green-600">
              Payment Successful!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-700">
              Your processing fee of{" "}
              <strong>${(application.processingFeeAmount / 100).toFixed(2)}</strong> has been
              processed successfully.
            </p>
            <p className="text-gray-600">
              Your loan application is now ready for disbursement.
            </p>
            <div className="pt-4">
              <p className="text-sm text-gray-500">
                Redirecting to your dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
      toast.error("Please fill in all card details");
      return;
    }

    setProcessing(true);

    // In demo mode, create a mock payment intent
    const paymentIntentId = `pi_test_${Date.now()}`;

    // Simulate processing
    setTimeout(() => {
      processStripePayment.mutate({
        loanApplicationId: application.id,
        paymentIntentId: paymentIntentId,
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={APP_LOGO} alt="Logo" className="w-10 h-10" />
            <h1 className="text-3xl font-bold text-blue-900">{APP_TITLE}</h1>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Processing Fee Payment</h2>
          <p className="text-gray-600 mt-2">
            Complete your loan application by paying the processing fee
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Enter your card information below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Card Number */}
                  <div>
                    <Label htmlFor="cardNumber" className="text-sm font-medium">
                      Card Number
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ""))}
                      disabled={processing}
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Test card: 4242 4242 4242 4242
                    </p>
                  </div>

                  {/* Expiry and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-sm font-medium">
                        Expiration Date
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          placeholder="MM"
                          value={expiryMonth}
                          onChange={(e) => setExpiryMonth(e.target.value)}
                          disabled={processing}
                          maxLength={2}
                          className="w-14"
                        />
                        <span className="flex items-center">/</span>
                        <Input
                          placeholder="YY"
                          value={expiryYear}
                          onChange={(e) => setExpiryYear(e.target.value)}
                          disabled={processing}
                          maxLength={2}
                          className="w-14"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cvv" className="text-sm font-medium">
                        CVV
                      </Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        disabled={processing}
                        maxLength={4}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <Label htmlFor="zip" className="text-sm font-medium">
                      Billing ZIP Code
                    </Label>
                    <Input
                      id="zip"
                      placeholder="12345"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      disabled={processing}
                      className="mt-1"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pay ${(application.processingFeeAmount / 100).toFixed(2)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    🔒 Secured by Stripe - PCI DSS Compliant
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Loan Application #</p>
                  <p className="font-semibold text-lg">{application.id}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Loan Amount</p>
                  <p className="font-semibold text-lg">
                    ${(application.requestedAmount / 100).toFixed(2)}
                  </p>
                </div>

                <hr className="my-4" />

                <div>
                  <p className="text-sm text-gray-600">Processing Fee</p>
                  <p className="font-bold text-2xl text-blue-600">
                    ${(application.processingFeeAmount / 100).toFixed(2)}
                  </p>
                </div>

                <hr className="my-4" />

                <div className="bg-blue-50 p-3 rounded">
                  <p className="text-xs text-blue-700">
                    ℹ️ After payment, your loan will be ready for disbursement.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Demo Mode:</strong> This is running in demo/mock mode. No real charges will be
            made. To use real Stripe payments, add your Stripe API keys to your .env file.
          </p>
        </div>
      </div>
    </div>
  );
}
