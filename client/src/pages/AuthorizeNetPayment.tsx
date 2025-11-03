import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2, CreditCard, ShieldCheck, Bitcoin, DollarSign, PartyPopper, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import confetti from "canvas-confetti";

// Declare Accept.js types
declare global {
  interface Window {
    Accept: {
      dispatchData: (
        secureData: any,
        callback: (response: AcceptJsResponse) => void
      ) => void;
    };
  }
}

interface AcceptJsResponse {
  messages: {
    resultCode: string;
    message: Array<{ code: string; text: string }>;
  };
  opaqueData?: {
    dataDescriptor: string;
    dataValue: string;
  };
}

export default function AuthorizeNetPaymentPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/payment/:id");
  const applicationId = params?.id ? parseInt(params.id) : null;
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "crypto">("card");
  const [selectedCrypto, setSelectedCrypto] = useState<"BTC" | "ETH" | "USDT" | "USDC">("BTC");

  // Form state
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState("");
  const [expiryYear, setExpiryYear] = useState("");
  const [cvv, setCvv] = useState("");

  const { data: application, isLoading } = trpc.loans.getById.useQuery(
    { id: applicationId! },
    { enabled: !!applicationId && isAuthenticated }
  );

  const { data: config } = trpc.payments.getAuthorizeNetConfig.useQuery();

  const { data: cryptos } = trpc.payments.getSupportedCryptos.useQuery();
  
  const { data: cryptoConversion } = trpc.payments.convertToCrypto.useQuery(
    {
      usdCents: application?.processingFeeAmount || 0,
      currency: selectedCrypto,
    },
    { enabled: !!application?.processingFeeAmount && paymentMethod === "crypto" }
  );

  const processPaymentMutation = trpc.payments.processCardPayment.useMutation({
    onSuccess: (data) => {
      setPaymentComplete(true);
      toast.success("Payment processed successfully!");
      setProcessing(false);
      
      // Trigger success confetti
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

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
          colors: ['#00A651', '#0033A0', '#D4AF37', '#FFA500']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#00A651', '#0033A0', '#D4AF37', '#FFA500']
        });
      }, 250);
    },
    onError: (error) => {
      toast.error(error.message || "Payment processing failed");
      setProcessing(false);
    },
  });

  // Load Accept.js script
  useEffect(() => {
    if (!config) return;

    const script = document.createElement("script");
    script.src =
      config.environment === "production"
        ? "https://js.authorize.net/v1/Accept.js"
        : "https://jstest.authorize.net/v1/Accept.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [config]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!config || !applicationId) {
      toast.error("Payment configuration not loaded");
      return;
    }

    if (!cardNumber || !expiryMonth || !expiryYear || !cvv) {
      toast.error("Please fill in all card details");
      return;
    }

    setProcessing(true);

    const secureData = {
      authData: {
        clientKey: config.clientKey,
        apiLoginID: config.apiLoginId,
      },
      cardData: {
        cardNumber: cardNumber.replace(/\s/g, ""),
        month: expiryMonth,
        year: expiryYear,
        cardCode: cvv,
      },
    };

    // Call Accept.js to tokenize the card data
    if (window.Accept) {
      window.Accept.dispatchData(secureData, (response: AcceptJsResponse) => {
        if (response.messages.resultCode === "Error") {
          const errorMessage =
            response.messages.message[0]?.text || "Card validation failed";
          toast.error(errorMessage);
          setProcessing(false);
          return;
        }

        if (response.opaqueData) {
          // Send the tokenized data to our server
          processPaymentMutation.mutate({
            loanApplicationId: applicationId,
            opaqueData: {
              dataDescriptor: response.opaqueData.dataDescriptor,
              dataValue: response.opaqueData.dataValue,
            },
          });
        } else {
          toast.error("Failed to tokenize card data");
          setProcessing(false);
        }
      });
    } else {
      toast.error("Payment system not loaded");
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
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
        <Card className="max-w-md">
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
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Application Not Found</CardTitle>
            <CardDescription>
              The requested application could not be found
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

  if (
    application.status !== "approved" &&
    application.status !== "fee_pending"
  ) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Payment Not Available</CardTitle>
            <CardDescription>
              This application is not ready for payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Current status: <strong>{application.status}</strong>
            </p>
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100">
        <Card className="max-w-2xl w-full shadow-2xl border-2 border-green-200 animate-bounce-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 relative">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-xl animate-pulse">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
              {/* Sparkle effects */}
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-ping" />
              </div>
              <div className="absolute -bottom-1 -left-2">
                <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              </div>
            </div>
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-3 animate-fade-in">
              <PartyPopper className="w-5 h-5" />
              <span className="font-semibold">Success!</span>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800 mb-2 animate-fade-in">
              Payment Successful!
            </CardTitle>
            <CardDescription className="text-lg animate-fade-in">
              🎉 Your processing fee has been received
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 animate-slide-up">
            <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 p-6 border-2 border-green-200 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Amount Paid</span>
                <span className="text-lg font-semibold">
                  ${((application.processingFeeAmount || 0) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Application ID
                </span>
                <span className="font-mono text-sm">#{application.id}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                <strong>Next Steps:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Your loan will be processed for disbursement</li>
                <li>You will receive an email confirmation shortly</li>
                <li>Funds typically arrive within 1-2 business days</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => setLocation("/dashboard")}>
                View Dashboard
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setLocation("/")}
              >
                Return Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/">
            <a className="inline-flex items-center gap-2 text-2xl font-bold mb-2">
              {APP_LOGO && (
                <img src={APP_LOGO} alt={APP_TITLE} className="h-8" />
              )}
              <span>{APP_TITLE}</span>
            </a>
          </Link>
          <p className="text-muted-foreground">Secure Payment Processing</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle>Choose Payment Method</CardTitle>
              <CardDescription>
                Select your preferred payment option
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as "card" | "crypto")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="card" className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Card
                  </TabsTrigger>
                  <TabsTrigger value="crypto" className="flex items-center gap-2">
                    <Bitcoin className="h-4 w-4" />
                    Crypto
                  </TabsTrigger>
                </TabsList>

                {/* Card Payment Tab */}
                <TabsContent value="card">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryMonth">Month</Label>
                        <Input
                          id="expiryMonth"
                          placeholder="MM"
                          value={expiryMonth}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            if (parseInt(val) <= 12) setExpiryMonth(val);
                          }}
                          maxLength={2}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expiryYear">Year</Label>
                        <Input
                          id="expiryYear"
                          placeholder="YY"
                          value={expiryYear}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setExpiryYear(val);
                          }}
                          maxLength={2}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          placeholder="123"
                          type="password"
                          value={cvv}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "");
                            setCvv(val);
                          }}
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      <span>Secured by Authorize.net - PCI DSS Compliant</span>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={processing || !config}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay $${((application.processingFeeAmount || 0) / 100).toFixed(2)}`
                      )}
                    </Button>

                    {/* Accepted Cards */}
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2 text-center">We Accept</p>
                      <div className="flex justify-center gap-2">
                        <img src="https://usa.visa.com/dam/VCOM/regional/ve/romania/blogs/hero-image/visa-logo-800x450.jpg" alt="Visa" className="h-6 object-contain" />
                        <img src="https://brand.mastercard.com/content/dam/mccom/brandcenter/thumbnails/mastercard_vrt_rev_92px_2x.png" alt="Mastercard" className="h-8 object-contain" />
                        <img src="https://www.discover.com/company/images/newsroom/media-downloads/discover.png" alt="Discover" className="h-6 object-contain" />
                        <img src="https://www.aexp-static.com/cdaas/one/statics/axp-static-assets/1.8.0/package/dist/img/logos/dls-logo-bluebox-solid.svg" alt="Amex" className="h-6 object-contain" />
                      </div>
                    </div>
                  </form>
                </TabsContent>

                {/* Crypto Payment Tab */}
                <TabsContent value="crypto">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Select Cryptocurrency</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {["BTC", "ETH", "USDT", "USDC"].map((crypto) => (
                          <Button
                            key={crypto}
                            variant={selectedCrypto === crypto ? "default" : "outline"}
                            className="w-full"
                            onClick={() => setSelectedCrypto(crypto as any)}
                            type="button"
                          >
                            <div className="flex items-center gap-2">
                              {crypto === "BTC" && <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/800px-Bitcoin.svg.png" alt="BTC" className="h-5 w-5" />}
                              {crypto === "ETH" && <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/628px-Ethereum_logo_2014.svg.png" alt="ETH" className="h-5 w-5" />}
                              {crypto === "USDT" && <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" alt="USDT" className="h-5 w-5" />}
                              {crypto === "USDC" && <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" alt="USDC" className="h-5 w-5" />}
                              {crypto}
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {cryptoConversion && (
                      <div className="rounded-lg bg-muted p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Amount in USD</span>
                          <span className="font-semibold">${((application.processingFeeAmount || 0) / 100).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Amount in {selectedCrypto}</span>
                          <span className="font-semibold">{cryptoConversion.amount}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-green-600" />
                      <span>Secure blockchain transaction</span>
                    </div>

                    <Button className="w-full" disabled>
                      <Bitcoin className="mr-2 h-4 w-4" />
                      Proceed with {selectedCrypto} Payment
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      You will be redirected to complete the crypto payment
                    </p>

                    {/* Accepted Cryptos */}
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground mb-2 text-center">We Accept</p>
                      <div className="flex justify-center gap-2">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/800px-Bitcoin.svg.png" alt="Bitcoin" className="h-6 object-contain" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Ethereum_logo_2014.svg/628px-Ethereum_logo_2014.svg.png" alt="Ethereum" className="h-6 object-contain" />
                        <img src="https://cryptologos.cc/logos/usd-coin-usdc-logo.png" alt="USDC" className="h-6 object-contain" />
                        <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" alt="USDT" className="h-6 object-contain" />
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Order Summary - keeping the existing summary card */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
              <CardDescription>Processing fee for your loan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Application ID</span>
                  <span className="font-mono">#{application.id}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Loan Amount</span>
                  <span className="font-semibold">
                    ${((application.approvedAmount || 0) / 100).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-semibold">
                    ${((application.processingFeeAmount || 0) / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Due</span>
                  <span className="text-2xl font-bold text-primary">
                    ${((application.processingFeeAmount || 0) / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm space-y-2">
                <p className="font-medium text-blue-900">
                  <strong>Important:</strong> This processing fee must be paid
                  before your loan can be disbursed.
                </p>
                <p className="text-blue-800">
                  Once payment is confirmed, your loan will be processed for
                  disbursement within 1-2 business days.
                </p>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Secure 256-bit SSL encryption</p>
                <p>• PCI DSS Level 1 certified</p>
                <p>• Your card details are never stored</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
