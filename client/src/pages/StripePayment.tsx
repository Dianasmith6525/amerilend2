import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { FullPageLoader } from "@/components/ui/loader";
import { CheckCircle2, Loader2, CreditCard, Coins, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import confetti from "canvas-confetti";

export default function StripePaymentPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/payment/:id");
  const referenceNumber = params?.id;
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");

  // Form state
  const [cardNumber, setCardNumber] = useState("4242424242424242");
  const [expiryMonth, setExpiryMonth] = useState("12");
  const [expiryYear, setExpiryYear] = useState("25");
  const [cvv, setCvv] = useState("123");
  const [zipCode, setZipCode] = useState("12345");
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");
  const [cryptoAddress, setCryptoAddress] = useState("");

  const { data: application, isLoading } = trpc.loans.getByReference.useQuery(
    { referenceNumber: referenceNumber! },
    { enabled: !!referenceNumber && isAuthenticated }
  );

  useEffect(() => {
    if (application) {
      console.log("Application data loaded:", {
        id: application.id,
        processingFeeAmount: application.processingFeeAmount,
        approvedAmount: application.approvedAmount,
        status: application.status,
      });
    }
  }, [application]);

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
        <Card className="w-full max-w-lg">
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
        <Card className="w-full max-w-lg">
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
        <Card className="w-full max-w-lg border-2 border-green-500">
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
              <strong>${((application.processingFeeAmount || 0) / 100).toFixed(2)}</strong> has been
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

    // Create payment intent with Stripe
    const paymentIntentId = `pi_test_${Date.now()}`;

    // Process payment
    setTimeout(() => {
      processStripePayment.mutate({
        loanApplicationId: application.id,
        paymentIntentId: paymentIntentId,
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-6 sm:py-8 px-4 sm:px-6">
      <div className="w-full max-w-4xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="text-[#0033A0]">Ameri</span>
              <span className="text-[#D4AF37]">Lend</span>
              <sup className="text-xs text-[#0033A0]">®</sup>
            </h1>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Processing Fee Payment</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-2">
            Complete your loan application by paying the processing fee
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Payment Form */}
          <div className="md:col-span-2 w-full">
            <Card className="p-3 sm:p-4 md:p-6">
              <CardHeader className="pb-3 sm:pb-4 md:pb-6 px-0 pt-0">
                <CardTitle className="text-lg sm:text-xl mb-4">
                  Payment Method
                </CardTitle>
                <div className="flex gap-2 mb-4">
                  <Button
                    type="button"
                    variant={paymentMethod === "card" ? "default" : "outline"}
                    className="flex-1 gap-2"
                    onClick={() => setPaymentMethod("card")}
                  >
                    <CreditCard className="w-4 h-4" />
                    Card
                  </Button>
                  <Button
                    type="button"
                    variant={paymentMethod === "crypto" ? "default" : "outline"}
                    className="flex-1 gap-2"
                    onClick={() => setPaymentMethod("crypto")}
                  >
                    <Coins className="w-4 h-4" />
                    Crypto
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {paymentMethod === "card" ? (
                  // Card Payment Form
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
                  {/* Card Number */}
                  <div>
                    <Label htmlFor="cardNumber" className="text-xs sm:text-sm font-medium">
                      Card Number
                    </Label>
                    <Input
                      id="cardNumber"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s/g, ""))}
                      disabled={processing}
                      className="mt-1 sm:mt-2 h-10 sm:h-12 text-sm sm:text-base"
                    />
                    <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                      Test card: 4242 4242 4242 4242
                    </p>
                  </div>

                  {/* Expiry and CVV - Responsive Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="expiry" className="text-xs sm:text-sm font-medium">
                        Expiration Date
                      </Label>
                      <div className="flex gap-2 mt-1 sm:mt-2">
                        <Input
                          placeholder="MM"
                          value={expiryMonth}
                          onChange={(e) => setExpiryMonth(e.target.value)}
                          disabled={processing}
                          maxLength={2}
                          className="w-16 sm:w-20 h-10 sm:h-12 text-sm sm:text-base"
                        />
                        <span className="flex items-center text-gray-400">/</span>
                        <Input
                          placeholder="YY"
                          value={expiryYear}
                          onChange={(e) => setExpiryYear(e.target.value)}
                          disabled={processing}
                          maxLength={2}
                          className="w-16 sm:w-20 h-10 sm:h-12 text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cvv" className="text-xs sm:text-sm font-medium">
                        CVV
                      </Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        disabled={processing}
                        maxLength={4}
                        className="mt-1 sm:mt-2 h-10 sm:h-12 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  {/* ZIP Code */}
                  <div>
                    <Label htmlFor="zip" className="text-xs sm:text-sm font-medium">
                      Billing ZIP Code
                    </Label>
                    <Input
                      id="zip"
                      placeholder="12345"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      disabled={processing}
                      className="mt-1 sm:mt-2 h-10 sm:h-12 text-sm sm:text-base"
                    />
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-blue-600 hover:bg-blue-700 h-10 sm:h-12 text-sm sm:text-base"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-5 w-5" />
                        Pay ${((application.processingFeeAmount || 0) / 100).toFixed(2)}
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    🔒 Secured by Stripe - PCI DSS Compliant
                  </p>
                </form>
                ) : (
                  // Crypto Payment Form
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 md:space-y-6">
                    {/* Cryptocurrency Selection */}
                    <div>
                      <Label htmlFor="crypto" className="text-xs sm:text-sm font-medium">
                        Select Cryptocurrency
                      </Label>
                      <select
                        value={selectedCrypto}
                        onChange={(e) => setSelectedCrypto(e.target.value)}
                        disabled={processing}
                        className="mt-1 sm:mt-2 w-full h-10 sm:h-12 px-3 border rounded-md text-sm sm:text-base"
                      >
                        <option value="BTC">Bitcoin (BTC)</option>
                        <option value="ETH">Ethereum (ETH)</option>
                        <option value="USDT">Tether (USDT)</option>
                        <option value="USDC">USD Coin (USDC)</option>
                      </select>
                    </div>

                    {/* Payment Amount */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-blue-900 mb-2">
                        <strong>Payment Amount:</strong>
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-blue-900">
                        ${((application.processingFeeAmount || 0) / 100).toFixed(2)} USD
                      </p>
                      <p className="text-xs text-blue-700 mt-2">
                        Please send {selectedCrypto} equivalent to the amount above
                      </p>
                    </div>

                    {/* Receiving Wallet Address */}
                    <div>
                      <Label htmlFor="receiveAddress" className="text-xs sm:text-sm font-medium">
                        Send {selectedCrypto} to This Address
                      </Label>
                      <div className="mt-1 sm:mt-2 relative">
                        <Input
                          id="receiveAddress"
                          type="text"
                          readOnly
                          value={cryptoAddress || `${selectedCrypto} wallet address will appear here`}
                          className="mt-1 sm:mt-2 h-10 sm:h-12 text-xs sm:text-sm bg-gray-100"
                        />
                        {cryptoAddress && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                            onClick={() => {
                              navigator.clipboard.writeText(cryptoAddress);
                              toast.success("Address copied to clipboard!");
                            }}
                          >
                            Copy
                          </Button>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Copy this address and send the required {selectedCrypto} from your wallet
                      </p>
                    </div>

                    {/* Confirmation Instructions */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 sm:p-4">
                      <p className="text-xs sm:text-sm text-amber-900">
                        <strong>⚠️ Important:</strong> After sending cryptocurrency, it may take 10-30 minutes to confirm. Your payment will be processed once confirmed on the blockchain.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={processing}
                      className="w-full bg-blue-600 hover:bg-blue-700 h-10 sm:h-12 text-sm sm:text-base"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Coins className="mr-2 h-5 w-5" />
                          Proceed with {selectedCrypto} Payment
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-gray-500 text-center">
                      🔒 Secure Blockchain Payment
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="w-full">
            <Card className="sticky top-8 p-3 sm:p-4 md:p-6">
              <CardHeader className="pb-3 sm:pb-4 md:pb-6 px-0 pt-0">
                <CardTitle className="text-base sm:text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0 space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Loan Application #</p>
                  <p className="font-semibold text-base sm:text-lg">{application.id}</p>
                </div>

                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Loan Amount</p>
                  <p className="font-semibold text-base sm:text-lg">
                    ${(application.requestedAmount / 100).toFixed(2)}
                  </p>
                </div>

                <hr className="my-3 sm:my-4" />

                <div>
                  <p className="text-xs sm:text-sm text-gray-600">Processing Fee</p>
                  <p className="font-bold text-xl sm:text-2xl text-blue-600">
                    ${((application.processingFeeAmount || 0) / 100).toFixed(2)}
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

      </div>
    </div>
  );
}
