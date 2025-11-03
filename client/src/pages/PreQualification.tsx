import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, ArrowLeft, Shield, Phone, Sparkles, PartyPopper } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import confetti from "canvas-confetti";

type PreQualificationResult = {
  qualified: boolean;
  maxLoanAmount: number;
  estimatedAPR: number;
  message: string;
};

export default function PreQualification() {
  const [step, setStep] = useState(1);
  const [result, setResult] = useState<PreQualificationResult | null>(null);
  const [showApproval, setShowApproval] = useState(false);
  const [formData, setFormData] = useState({
    annualIncome: "",
    employmentStatus: "",
    creditScore: "",
    monthlyDebts: "",
    loanAmount: "",
  });

  // Confetti animation for approval
  const triggerApprovalAnimation = () => {
    // Multiple confetti bursts
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Burst from left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ['#0033A0', '#FFA500', '#D4AF37', '#00A651', '#FF6B6B']
      });

      // Burst from right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ['#0033A0', '#FFA500', '#D4AF37', '#00A651', '#FF6B6B']
      });
    }, 250);

    // Golden confetti rain
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#FFD700', '#FFA500']
      });
    }, 500);
  };

  // Trigger animation when approval result is shown
  useEffect(() => {
    if (step === 3 && result?.qualified) {
      setShowApproval(true);
      triggerApprovalAnimation();
    }
  }, [step, result]);

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePreQualification = (): PreQualificationResult => {
    const income = parseFloat(formData.annualIncome);
    const debts = parseFloat(formData.monthlyDebts);
    const requestedAmount = parseFloat(formData.loanAmount);
    const creditScore = parseInt(formData.creditScore);

    // Simple qualification logic
    const monthlyIncome = income / 12;
    const debtToIncome = (debts / monthlyIncome) * 100;
    
    // Qualification criteria
    const hasIncome = income >= 12000; // $12k minimum annual
    const hasAcceptableDebt = debtToIncome < 50; // DTI < 50%
    const isEmployed = formData.employmentStatus !== "unemployed";
    const reasonableAmount = requestedAmount <= income * 0.5; // Max 50% of annual income

    if (!hasIncome) {
      return {
        qualified: false,
        maxLoanAmount: 0,
        estimatedAPR: 0,
        message: "Minimum annual income of $12,000 required"
      };
    }

    if (!isEmployed) {
      return {
        qualified: false,
        maxLoanAmount: 0,
        estimatedAPR: 0,
        message: "Employment required for loan qualification"
      };
    }

    if (!hasAcceptableDebt) {
      return {
        qualified: false,
        maxLoanAmount: 0,
        estimatedAPR: 0,
        message: "Debt-to-income ratio too high. Consider reducing existing debts."
      };
    }

    if (!reasonableAmount) {
      return {
        qualified: true,
        maxLoanAmount: Math.floor(income * 0.5),
        estimatedAPR: creditScore >= 700 ? 29 : creditScore >= 600 ? 79 : 149,
        message: `You may qualify for up to $${Math.floor(income * 0.5).toLocaleString()}`
      };
    }

    // Calculate max loan based on credit score and income
    let maxLoan = income * 0.5;
    let apr = 99;

    if (creditScore >= 700) {
      apr = 29;
      maxLoan = income * 0.5;
    } else if (creditScore >= 650) {
      apr = 49;
      maxLoan = income * 0.4;
    } else if (creditScore >= 600) {
      apr = 79;
      maxLoan = income * 0.35;
    } else {
      apr = 149;
      maxLoan = income * 0.25;
    }

    return {
      qualified: true,
      maxLoanAmount: Math.floor(maxLoan),
      estimatedAPR: apr,
      message: `Great news! You may qualify for a loan up to $${Math.floor(maxLoan).toLocaleString()}`
    };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const preQualResult = calculatePreQualification();
    setResult(preQualResult);
    setStep(3);
  };

  const resetForm = () => {
    setStep(1);
    setResult(null);
    setShowApproval(false);
    setFormData({
      annualIncome: "",
      employmentStatus: "",
      creditScore: "",
      monthlyDebts: "",
      loanAmount: "",
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/" className="text-2xl font-bold">
                <span className="text-[#0033A0]">Ameri</span>
                <span className="text-[#D4AF37]">Lend</span>
                <sup className="text-xs text-[#0033A0]">®</sup>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="tel:945-212-1609"
                className="hidden md:flex items-center gap-2 text-gray-700 hover:text-[#0033A0]"
              >
                <Phone className="w-4 h-4" />
                (945) 212-1609
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 bg-gradient-to-r from-[#0033A0] to-[#0055D4] text-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-6">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-semibold">No Impact on Credit Score</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Check If You Pre-Qualify
          </h1>
          <p className="text-xl text-white/90 mb-2">
            See your potential loan amount in just 3 questions
          </p>
          <p className="text-white/75">
            ✓ No hard credit check  ✓ Won't affect your score  ✓ Instant results
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Step 1: Income & Employment */}
          {step === 1 && (
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#0033A0] mb-2">
                    Step 1 of 2: Income & Employment
                  </h2>
                  <p className="text-gray-600">
                    Tell us about your current financial situation
                  </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
                  <div>
                    <Label htmlFor="annualIncome" className="text-base font-semibold">
                      Annual Income (Before Taxes) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="annualIncome"
                        type="number"
                        value={formData.annualIncome}
                        onChange={(e) => updateFormData("annualIncome", e.target.value)}
                        placeholder="50000"
                        className="pl-7 text-lg"
                        required
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Include all income sources (salary, benefits, etc.)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="employmentStatus" className="text-base font-semibold">
                      Employment Status <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.employmentStatus}
                      onValueChange={(value) => updateFormData("employmentStatus", value)}
                      required
                    >
                      <SelectTrigger className="mt-2 text-lg">
                        <SelectValue placeholder="Select your employment status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full_time">Full-Time Employed</SelectItem>
                        <SelectItem value="part_time">Part-Time Employed</SelectItem>
                        <SelectItem value="self_employed">Self-Employed</SelectItem>
                        <SelectItem value="retired">Retired</SelectItem>
                        <SelectItem value="unemployed">Unemployed</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="monthlyDebts" className="text-base font-semibold">
                      Total Monthly Debt Payments <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="monthlyDebts"
                        type="number"
                        value={formData.monthlyDebts}
                        onChange={(e) => updateFormData("monthlyDebts", e.target.value)}
                        placeholder="500"
                        className="pl-7 text-lg"
                        required
                        min="0"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Include credit cards, car loans, student loans, etc.
                    </p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      className="bg-[#FFA500] hover:bg-[#FF8C00] text-white px-8 py-3 text-lg"
                      disabled={!formData.annualIncome || !formData.employmentStatus || !formData.monthlyDebts}
                    >
                      Next Step
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Credit & Loan Amount */}
          {step === 2 && (
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-[#0033A0] mb-2">
                    Step 2 of 2: Credit & Loan Details
                  </h2>
                  <p className="text-gray-600">
                    Just two more questions to see if you pre-qualify
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="creditScore" className="text-base font-semibold">
                      Estimated Credit Score Range <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.creditScore}
                      onValueChange={(value) => updateFormData("creditScore", value)}
                      required
                    >
                      <SelectTrigger className="mt-2 text-lg">
                        <SelectValue placeholder="Select your credit score range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="750">Excellent (720+)</SelectItem>
                        <SelectItem value="680">Good (660-719)</SelectItem>
                        <SelectItem value="620">Fair (600-659)</SelectItem>
                        <SelectItem value="550">Poor (Below 600)</SelectItem>
                        <SelectItem value="0">Not Sure</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Don't worry if you're not sure - select your best estimate
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="loanAmount" className="text-base font-semibold">
                      How Much Do You Need? <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative mt-2">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="loanAmount"
                        type="number"
                        value={formData.loanAmount}
                        onChange={(e) => updateFormData("loanAmount", e.target.value)}
                        placeholder="5000"
                        className="pl-7 text-lg"
                        required
                        min="500"
                        max="100000"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Loan amounts from $500 to $100,000
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-gray-700">
                        <p className="font-semibold text-gray-900 mb-1">Your Privacy is Protected</p>
                        <p>This pre-qualification check uses a soft credit inquiry that won't impact your credit score.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="border-[#0033A0] text-[#0033A0]"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[#FFA500] hover:bg-[#FF8C00] text-white px-8 py-3 text-lg"
                      disabled={!formData.creditScore || !formData.loanAmount}
                    >
                      Check Pre-Qualification
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Results */}
          {step === 3 && result && (
            <Card className="shadow-lg overflow-hidden">
              <CardContent className="p-8">
                {result.qualified ? (
                  <div className="text-center">
                    {/* Animated Approval Icon */}
                    <div className="relative mb-6">
                      <div className={`w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-2xl ${showApproval ? 'animate-bounce-in' : ''}`}>
                        <CheckCircle2 className="w-14 h-14 text-white animate-pulse" />
                      </div>
                      {/* Sparkle effects */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                        <Sparkles className="w-6 h-6 text-yellow-400 animate-ping" />
                      </div>
                      <div className="absolute bottom-0 right-1/3">
                        <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" style={{ animationDelay: '0.2s' }} />
                      </div>
                      <div className="absolute bottom-2 left-1/3">
                        <Sparkles className="w-4 h-4 text-yellow-500 animate-ping" style={{ animationDelay: '0.4s' }} />
                      </div>
                    </div>

                    {/* Animated Title */}
                    <div className={`mb-6 ${showApproval ? 'animate-slide-up' : ''}`}>
                      <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-4 animate-pulse">
                        <PartyPopper className="w-5 h-5" />
                        <span className="font-semibold">You're Pre-Qualified!</span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-800 mb-3 animate-fade-in">
                        Congratulations!
                      </h2>
                      <p className="text-xl md:text-2xl text-gray-700 font-medium animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        {result.message}
                      </p>
                    </div>

                    {/* Animated Loan Details */}
                    <div className={`grid md:grid-cols-2 gap-6 max-w-lg mx-auto mb-8 ${showApproval ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.3s' }}>
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 transform hover:scale-105 transition-transform duration-300 shadow-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-blue-600" />
                          <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Potential Loan Amount</p>
                        </div>
                        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0033A0] to-blue-600">
                          ${result.maxLoanAmount.toLocaleString()}
                        </p>
                        <div className="mt-2 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent rounded-full animate-pulse"></div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border-2 border-orange-200 transform hover:scale-105 transition-transform duration-300 shadow-lg">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Sparkles className="w-5 h-5 text-orange-600" />
                          <p className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Estimated APR</p>
                        </div>
                        <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFA500] to-orange-600">
                          {result.estimatedAPR}%
                        </p>
                        <div className="mt-2 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent rounded-full animate-pulse"></div>
                      </div>
                    </div>

                    <div className={`bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-8 text-left ${showApproval ? 'animate-fade-in' : ''}`} style={{ animationDelay: '0.5s' }}>
                      <p className="text-sm text-gray-700">
                        <strong className="text-gray-900">Important:</strong> This is a pre-qualification estimate only. Your actual loan amount and APR will be determined after a full application review, which includes a hard credit check.
                      </p>
                    </div>

                    <div className={`flex flex-col sm:flex-row gap-4 justify-center ${showApproval ? 'animate-slide-up' : ''}`} style={{ animationDelay: '0.6s' }}>
                      <Link href="/apply">
                        <Button className="bg-gradient-to-r from-[#FFA500] to-[#FF8C00] hover:from-[#FF8C00] hover:to-[#FF7700] text-white px-10 py-4 text-lg w-full sm:w-auto shadow-xl transform hover:scale-105 transition-all duration-300 font-bold">
                          <PartyPopper className="w-5 h-5 mr-2" />
                          Apply Now
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </Link>
                      <Button
                        onClick={resetForm}
                        variant="outline"
                        className="border-2 border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white px-8 py-4 text-lg transform hover:scale-105 transition-all duration-300"
                      >
                        Check Another Amount
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle className="w-12 h-12 text-orange-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-[#0033A0] mb-3">
                      Not Pre-Qualified Yet
                    </h2>
                    <p className="text-xl text-gray-700 mb-8">
                      {result.message}
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
                      <h3 className="font-bold text-gray-900 mb-3">What You Can Do:</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>Try applying for a smaller loan amount</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>Work on reducing existing debts</span>
                        </li>
                        <li className="flex gap-3">
                          <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <span>Contact us to discuss your options</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={resetForm}
                        className="bg-[#FFA500] hover:bg-[#FF8C00] text-white px-8 py-3 text-lg"
                      >
                        Try Again
                      </Button>
                      <a href="tel:945-212-1609" className="inline-block">
                        <Button
                          variant="outline"
                          className="border-[#0033A0] text-[#0033A0] px-8 py-3 text-lg w-full"
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          Call Us
                        </Button>
                      </a>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Disclaimer */}
          <div className="mt-8 text-center text-sm text-gray-500 max-w-2xl mx-auto">
            <p>
              Pre-qualification does not guarantee loan approval. Actual loan terms are subject to credit approval and may vary based on applicant qualifications, loan amount, loan term, credit usage and history, and other factors. Rates shown are illustrative and may not be available in all states.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
