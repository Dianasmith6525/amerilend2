import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Loader2, Phone, ArrowLeft, Save, PartyPopper } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { ProgressTracker, type ProgressStep } from "@/components/ProgressTracker";
import confetti from "canvas-confetti";

const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function ApplyLoan() {
  const { user, isAuthenticated, loading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: "/login"
  });
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    middleInitial: "",
    email: user?.email || "",
    phone: "",
    dateOfBirth: "",
    ssn: "",
    idType: "",
    idNumber: "",
    maritalStatus: "",
    dependents: "",
    citizenshipStatus: "us_citizen" as "us_citizen" | "permanent_resident",
    priorBankruptcy: false,
    bankruptcyDate: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    employmentStatus: "",
    employer: "",
    monthlyIncome: "",
    loanType: "",
    requestedAmount: "",
    loanPurpose: "",
    preferredContact: "email" as "email" | "phone" | "sms",
    creditCheckConsent: false,
    termsConsent: false,
    privacyConsent: false,
    loanAgreementConsent: false,
    esignConsent: false,
  });

  // Progress steps configuration
  const progressSteps: ProgressStep[] = [
    { number: 1, title: "Personal Info", description: "Basic details", status: currentStep === 1 ? "current" : currentStep > 1 ? "completed" : "upcoming" },
    { number: 2, title: "Address", description: "Where you live", status: currentStep === 2 ? "current" : currentStep > 2 ? "completed" : "upcoming" },
    { number: 3, title: "Employment", description: "Income details", status: currentStep === 3 ? "current" : currentStep > 3 ? "completed" : "upcoming" },
    { number: 4, title: "Loan Details", description: "Amount & purpose", status: currentStep === 4 ? "current" : currentStep > 4 ? "completed" : "upcoming" },
    { number: 5, title: "Review", description: "Agreements", status: currentStep === 5 ? "current" : currentStep > 5 ? "completed" : "upcoming" },
  ];

  // Load saved draft from localStorage
  useEffect(() => {
    const savedDraft = localStorage.getItem('loanApplicationDraft');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        setFormData(prev => ({ ...prev, ...parsed.formData }));
        setCurrentStep(parsed.currentStep || 1);
        toast.info("Loaded your saved application");
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, []);

  // Save draft to localStorage
  const saveDraft = () => {
    const draft = {
      formData,
      currentStep,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('loanApplicationDraft', JSON.stringify(draft));
    toast.success("Application saved! You can continue later.");
  };

  const submitMutation = trpc.loans.submit.useMutation({
    onSuccess: () => {
      // Clear saved draft
      localStorage.removeItem('loanApplicationDraft');
      
      toast.success("Application submitted successfully!");
      
      // Trigger celebration confetti
      const duration = 2500;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 40 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#0033A0', '#FFA500', '#D4AF37', '#00A651']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#0033A0', '#FFA500', '#D4AF37', '#00A651']
        });
      }, 250);
      
      setTimeout(() => setLocation("/dashboard"), 1500);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate SSN format
    if (!/^\d{3}-\d{2}-\d{4}$/.test(formData.ssn)) {
      toast.error("SSN must be in format XXX-XX-XXXX");
      return;
    }

    // Validate date of birth format (MM/DD/YYYY)
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(formData.dateOfBirth)) {
      toast.error("Date of birth must be in format MM/DD/YYYY");
      return;
    }

    // Convert MM/DD/YYYY to YYYY-MM-DD for API
    const [month, day, year] = formData.dateOfBirth.split("/");
    const dateOfBirthISO = `${year}-${month}-${day}`;

    // Convert amounts to cents
    const monthlyIncome = Math.round(parseFloat(formData.monthlyIncome) * 100);
    const requestedAmount = Math.round(parseFloat(formData.requestedAmount) * 100);

    if (isNaN(monthlyIncome) || monthlyIncome <= 0) {
      toast.error("Please enter a valid monthly income");
      return;
    }

    if (isNaN(requestedAmount) || requestedAmount <= 0) {
      toast.error("Please enter a valid loan amount");
      return;
    }

    submitMutation.mutate({
      ...formData,
      dateOfBirth: dateOfBirthISO,
      employmentStatus: formData.employmentStatus as "employed" | "self_employed" | "unemployed" | "retired",
      loanType: formData.loanType as "installment" | "short_term",
      monthlyIncome,
      requestedAmount,
    });
  };

  const updateFormData = (field: string, value: string | boolean | any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatSSN = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Format as XXX-XX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 5) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5, 9)}`;
    }
  };

  const handleSSNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSSN(e.target.value);
    updateFormData("ssn", formatted);
  };

  const handleDateOfBirthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // The date input automatically provides YYYY-MM-DD format
    updateFormData("dateOfBirth", e.target.value);
  };

  const handleDateOfBirthInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    let formatted = "";

    if (value.length <= 2) {
      formatted = value;
    } else if (value.length <= 4) {
      formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
    } else {
      formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4, 8)}`;
    }

    // Store in the state as the raw display value
    setFormData((prev) => ({ 
      ...prev, 
      dateOfBirth: formatted
    }));
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "");
    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    updateFormData("phone", formatted);
  };

  const capitalizeWords = (value: string) => {
    // Capitalize first letter of each word
    return value
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleFullNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = capitalizeWords(e.target.value);
    updateFormData("fullName", formatted);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.fullName.trim()) {
          toast.error("Please enter your full name");
          return false;
        }
        if (!formData.middleInitial.trim()) {
          toast.error("Please enter your middle initial");
          return false;
        }
        if (!formData.email.trim() || !formData.email.includes("@")) {
          toast.error("Please enter a valid email address");
          return false;
        }
        if (!formData.phone.trim() || formData.phone.length < 7) {
          toast.error("Please enter a valid phone number (at least 7 characters)");
          return false;
        }
        if (!formData.dateOfBirth) {
          toast.error("Please enter your date of birth");
          return false;
        }

        // Validate age (must be 18+)
        const [month, day, year] = formData.dateOfBirth.split("/");
        if (month && day && year) {
          const birthDate = new Date(`${year}-${month}-${day}`);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDifference = today.getMonth() - birthDate.getMonth();
          
          if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < parseInt(day))) {
            age--;
          }
          
          if (age < 18) {
            toast.error("You must be at least 18 years old to apply for a loan");
            return false;
          }
        }

        if (!/^\d{3}-\d{2}-\d{4}$/.test(formData.ssn)) {
          toast.error("SSN must be in format XXX-XX-XXXX");
          return false;
        }

        // Validate SSN doesn't start with invalid patterns
        const ssnPrefix = formData.ssn.substring(0, 3);
        if (ssnPrefix === "000" || ssnPrefix === "666") {
          toast.error("Invalid SSN - cannot start with 000 or 666");
          return false;
        }
        if (ssnPrefix.startsWith("9")) {
          toast.error("Invalid SSN - cannot start with 9");
          return false;
        }

        if (!formData.idType) {
          toast.error("Please select your government-issued ID type");
          return false;
        }
        if (!formData.idNumber.trim() || formData.idNumber.length < 5) {
          toast.error("Please enter a valid government-issued ID number");
          return false;
        }
        if (!formData.maritalStatus) {
          toast.error("Please select your marital status");
          return false;
        }
        if (formData.dependents === "" || formData.dependents === null) {
          toast.error("Please enter the number of dependents");
          return false;
        }
        if (!formData.citizenshipStatus) {
          toast.error("Please select your citizenship status");
          return false;
        }
        if (formData.priorBankruptcy && !formData.bankruptcyDate) {
          toast.error("Please enter the date of your bankruptcy");
          return false;
        }
        return true;

      case 2:
        if (!formData.street.trim()) {
          toast.error("Please enter your street address");
          return false;
        }
        if (!formData.city.trim()) {
          toast.error("Please enter your city");
          return false;
        }
        if (!formData.state || formData.state.length !== 2) {
          toast.error("Please select a state");
          return false;
        }
        if (!formData.zipCode.trim() || formData.zipCode.length < 5) {
          toast.error("Please enter a valid zip code (at least 5 characters)");
          return false;
        }
        return true;

      case 3:
        if (!formData.employmentStatus) {
          toast.error("Please select your employment status");
          return false;
        }
        if (!formData.monthlyIncome || parseFloat(formData.monthlyIncome) <= 0) {
          toast.error("Please enter a valid monthly income");
          return false;
        }
        return true;

      case 4:
        if (!formData.loanType) {
          toast.error("Please select a loan type");
          return false;
        }
        if (!formData.requestedAmount || parseFloat(formData.requestedAmount) <= 0) {
          toast.error("Please enter a valid loan amount");
          return false;
        }
        const loanAmount = parseFloat(formData.requestedAmount);
        if (loanAmount > 100000) {
          toast.error("Maximum loan amount is $100,000");
          return false;
        }
        if (loanAmount < 500) {
          toast.error("Minimum loan amount is $500");
          return false;
        }
        if (!formData.loanPurpose.trim() || formData.loanPurpose.length < 5) {
          toast.error("Please enter a loan purpose (at least 5 characters)");
          return false;
        }
        return true;

      case 5:
        if (!formData.termsConsent) {
          toast.error("You must agree to the Terms of Use");
          return false;
        }
        if (!formData.privacyConsent) {
          toast.error("You must agree to the Privacy Policy");
          return false;
        }
        if (!formData.creditCheckConsent) {
          toast.error("You must authorize the credit check");
          return false;
        }
        if (!formData.loanAgreementConsent) {
          toast.error("You must agree to the Loan Agreement");
          return false;
        }
        if (!formData.esignConsent) {
          toast.error("You must consent to electronic signatures");
          return false;
        }
        return true;

      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-[#0033A0]" />
      </div>
    );
  }

  if (!isAuthenticated) {
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
              <div className="flex items-center gap-3">
                <a
                  href="tel:945-212-1609"
                  className="hidden md:flex items-center gap-2 text-gray-700 hover:text-[#0033A0]"
                >
                  <Phone className="w-4 h-4" />
                  (945) 212-1609
                </a>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-[#0033A0] text-[#0033A0]"
                  >
                    Log In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center py-12">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#0033A0]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#0033A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-2">Sign In Required</h2>
              <p className="text-gray-600 mb-6">
                Please sign in to your account to apply for a loan. This helps us keep your information secure and allows you to track your application.
              </p>
              <Link href="/login" className="inline-block w-full">
                <Button
                  className="w-full bg-[#FFA500] hover:bg-[#FF8C00] text-white"
                >
                  Sign In to Continue
                </Button>
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                Don't have an account? Signing in will create one automatically.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/" className="text-2xl font-bold">
                <span className="text-[#0033A0]">Ameri</span>
                <span className="text-[#D4AF37]">Lend</span>
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
              <Link href="/dashboard">
                <Button variant="outline" className="border-[#0033A0] text-[#0033A0]">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Progress Tracker */}
      <ProgressTracker steps={progressSteps} currentStep={currentStep} />

      {/* Form Content */}
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Compulsory Information Section - Only show on Step 1 */}
          {currentStep === 1 && !formData.fullName && (
            <div className="mb-8 border-l-4 border-[#0033A0] bg-blue-50 p-6 rounded">
              <h3 className="text-xl font-bold text-[#0033A0] mb-4">
                Required Information to Apply
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex gap-3">
                  <span className="text-[#0033A0] font-bold">✓</span>
                  <div>
                    <strong>Age Requirement:</strong> You must be 18 years of age or older to apply for a loan.
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#0033A0] font-bold">✓</span>
                  <div>
                    <strong>Valid Social Security Number (SSN):</strong> A valid SSN is required for identity verification and credit check purposes.
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#0033A0] font-bold">✓</span>
                  <div>
                    <strong>Valid Government-Issued ID:</strong> We will need to verify your identity using a valid government-issued photo ID.
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#0033A0] font-bold">✓</span>
                  <div>
                    <strong>Active Email Address:</strong> A valid, active email address is required for communication regarding your application status.
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-[#0033A0] font-bold">✓</span>
                  <div>
                    <strong>Valid Phone Number:</strong> We will use this phone number to contact you about your application.
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-bold text-[#0033A0] mb-3">Important Notices</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <strong>Credit Check:</strong> By submitting this application, you authorize us to perform a credit check and verify your financial information. Your credit score may be impacted by this inquiry.
                  </p>
                  <p>
                    <strong>Identity Verification:</strong> All applicants must complete identity verification. We use third-party services to verify your identity and may request additional documents.
                  </p>
                  <p>
                    <strong>Data Privacy:</strong> Your personal and financial information will be handled according to our <Link to="/privacy-policy" className="text-[#0033A0] underline hover:text-[#002080]">Privacy Policy</Link> and used solely for loan processing and credit decisions.
                  </p>
                  <p>
                    <strong>Application Timeline:</strong> Most applications are reviewed within 24-48 hours. You will receive a decision via email and phone.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-3 p-4 bg-white border border-orange-200 rounded">
                <span className="text-orange-500 font-bold text-lg mt-1">!</span>
                <p className="text-sm text-gray-700">
                  By clicking "Continue" below, you acknowledge that you have read and understood these requirements and agree to our <Link to="/terms-of-use" className="text-[#0033A0] underline hover:text-[#002080]">Terms of Use</Link>.
                </p>
              </div>
            </div>
          )}

          <Card>
            <CardContent className="p-8">
              {/* Required Fields Legend */}
              <div className="mb-6 pb-6 border-b">
                <p className="text-sm text-gray-600">
                  <span className="text-red-500 font-bold">*</span> indicates a required field. All marked fields must be completed to proceed.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0033A0] mb-2">
                        Personal Information
                      </h2>
                      <p className="text-gray-600 mb-3">
                        Let's start with some basic information about you.
                      </p>
                      <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4 text-sm text-gray-700">
                        <strong className="text-[#0033A0]">Required in this step:</strong> Full Name, Middle Initial, Phone, DOB, SSN, Government ID, Marital Status, Dependents, and Citizenship Status
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Row 1: Full Name and Middle Initial */}
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={formData.fullName}
                          onChange={handleFullNameChange}
                          placeholder="John Doe"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="middleInitial">Middle Initial *</Label>
                        <Input
                          id="middleInitial"
                          value={formData.middleInitial}
                          onChange={(e) => updateFormData("middleInitial", e.target.value.substring(0, 1).toUpperCase())}
                          placeholder="M"
                          maxLength={1}
                          required
                        />
                      </div>

                      {/* Row 2: Email and Phone */}
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          placeholder={formData.email || "your.email@example.com"}
                          disabled
                          className="bg-gray-100 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500">Pre-filled from your account</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          placeholder="(555) 123-4567"
                          maxLength={14}
                          required
                        />
                      </div>

                      {/* Row 3: Date of Birth and SSN */}
                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="text"
                          inputMode="numeric"
                          placeholder="MM/DD/YYYY"
                          value={formData.dateOfBirth}
                          onChange={handleDateOfBirthInput}
                          maxLength={10}
                          required
                        />
                        <p className="text-xs text-gray-500">Format: MM/DD/YYYY (e.g., 05/10/1990)</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ssn">Social Security Number *</Label>
                        <Input
                          id="ssn"
                          value={formData.ssn}
                          onChange={handleSSNChange}
                          placeholder="000-00-0000"
                          maxLength={11}
                          required
                        />
                        <p className="text-xs text-gray-500">
                          Your SSN is encrypted and secure. (auto-formatted)
                        </p>
                      </div>

                      {/* Row 4: Government ID Type and ID Number */}
                      <div className="space-y-2">
                        <Label htmlFor="idType">Government-Issued ID Type *</Label>
                        <Select
                          value={formData.idType}
                          onValueChange={(value) => updateFormData("idType", value)}
                          required
                        >
                          <SelectTrigger id="idType">
                            <SelectValue placeholder="Select ID type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="drivers_license">Driver's License</SelectItem>
                            <SelectItem value="passport">Passport</SelectItem>
                            <SelectItem value="state_id">State ID Card</SelectItem>
                            <SelectItem value="military_id">Military ID</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="idNumber">ID Number *</Label>
                        <Input
                          id="idNumber"
                          value={formData.idNumber}
                          onChange={(e) => updateFormData("idNumber", e.target.value)}
                          placeholder="Enter your ID number"
                          required
                        />
                        <p className="text-xs text-gray-500">We'll use this for identity verification</p>
                      </div>

                      {/* Row 5: Marital Status and Dependents */}
                      <div className="space-y-2">
                        <Label htmlFor="maritalStatus">Marital Status *</Label>
                        <Select
                          value={formData.maritalStatus}
                          onValueChange={(value) => updateFormData("maritalStatus", value)}
                          required
                        >
                          <SelectTrigger id="maritalStatus">
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="single">Single</SelectItem>
                            <SelectItem value="married">Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                            <SelectItem value="domestic_partnership">Domestic Partnership</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dependents">Number of Dependents *</Label>
                        <Select
                          value={formData.dependents}
                          onValueChange={(value) => updateFormData("dependents", value)}
                          required
                        >
                          <SelectTrigger id="dependents">
                            <SelectValue placeholder="Select number" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">0</SelectItem>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                            <SelectItem value="5">5+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Row 6: Citizenship Status */}
                      <div className="space-y-2">
                        <Label htmlFor="citizenshipStatus">Citizenship Status *</Label>
                        <Select
                          value={formData.citizenshipStatus}
                          onValueChange={(value) => updateFormData("citizenshipStatus", value)}
                          required
                        >
                          <SelectTrigger id="citizenshipStatus">
                            <SelectValue placeholder="Select citizenship" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="us_citizen">U.S. Citizen</SelectItem>
                            <SelectItem value="permanent_resident">U.S. Permanent Resident (Green Card)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Row 7: Prior Bankruptcy - Checkbox */}
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            id="priorBankruptcy"
                            checked={formData.priorBankruptcy}
                            onChange={(e) => updateFormData("priorBankruptcy", e.target.checked)}
                            className="w-4 h-4 accent-[#0033A0] cursor-pointer"
                          />
                          <label htmlFor="priorBankruptcy" className="cursor-pointer text-sm font-medium text-gray-700">
                            I have filed for bankruptcy in the past
                          </label>
                        </div>
                        {formData.priorBankruptcy && (
                          <div className="space-y-2 mt-3 p-3 bg-blue-50 rounded border border-blue-200">
                            <Label htmlFor="bankruptcyDate">Date of Bankruptcy Filing *</Label>
                            <Input
                              id="bankruptcyDate"
                              type="text"
                              inputMode="numeric"
                              placeholder="MM/DD/YYYY"
                              value={formData.bankruptcyDate}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, "");
                                let formatted = "";
                                if (value.length <= 2) {
                                  formatted = value;
                                } else if (value.length <= 4) {
                                  formatted = `${value.slice(0, 2)}/${value.slice(2)}`;
                                } else {
                                  formatted = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4, 8)}`;
                                }
                                updateFormData("bankruptcyDate", formatted);
                              }}
                              maxLength={10}
                              required={formData.priorBankruptcy}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={saveDraft}
                        className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save & Continue Later
                      </Button>
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-[#FFA500] hover:bg-[#FF8C00] text-white px-8"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Address Information */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0033A0] mb-2">
                        Address Information
                      </h2>
                      <p className="text-gray-600 mb-3">
                        Where do you currently reside?
                      </p>
                      <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4 text-sm text-gray-700">
                        <strong className="text-[#0033A0]">Required in this step:</strong> Street Address, City, State, and ZIP Code
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="street">Street Address *</Label>
                        <Input
                          id="street"
                          value={formData.street}
                          onChange={(e) => updateFormData("street", e.target.value)}
                          placeholder="123 Main Street"
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => updateFormData("city", e.target.value)}
                            placeholder="New York"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Select
                            value={formData.state}
                            onValueChange={(value) => updateFormData("state", value)}
                            required
                          >
                            <SelectTrigger id="state">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {US_STATES.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code *</Label>
                          <Input
                            id="zipCode"
                            value={formData.zipCode}
                            onChange={(e) => updateFormData("zipCode", e.target.value)}
                            placeholder="10001"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 gap-3">
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={prevStep}
                          variant="outline"
                          className="border-[#0033A0] text-[#0033A0]"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={saveDraft}
                          className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </div>
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-[#FFA500] hover:bg-[#FF8C00] text-white px-8"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Employment Information */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0033A0] mb-2">
                        Employment Information
                      </h2>
                      <p className="text-gray-600 mb-3">
                        Tell us about your employment and income.
                      </p>
                      <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4 text-sm text-gray-700">
                        <strong className="text-[#0033A0]">Required in this step:</strong> Employment Status and Monthly Income. Employer Name required if employed/self-employed.
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="employmentStatus">Employment Status *</Label>
                        <Select
                          value={formData.employmentStatus}
                          onValueChange={(value) => updateFormData("employmentStatus", value)}
                          required
                        >
                          <SelectTrigger id="employmentStatus">
                            <SelectValue placeholder="Select employment status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="employed">Employed</SelectItem>
                            <SelectItem value="self_employed">Self-Employed</SelectItem>
                            <SelectItem value="unemployed">Unemployed</SelectItem>
                            <SelectItem value="retired">Retired</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {(formData.employmentStatus === "employed" ||
                        formData.employmentStatus === "self_employed") && (
                        <div className="space-y-2">
                          <Label htmlFor="employer">Employer Name *</Label>
                          <Input
                            id="employer"
                            value={formData.employer}
                            onChange={(e) => updateFormData("employer", e.target.value)}
                            placeholder="Company Name"
                            required
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="monthlyIncome">Monthly Income *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <Input
                            id="monthlyIncome"
                            type="number"
                            step="0.01"
                            value={formData.monthlyIncome}
                            onChange={(e) => updateFormData("monthlyIncome", e.target.value)}
                            placeholder="3000.00"
                            className="pl-7"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Enter your gross monthly income before taxes
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 gap-3">
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          onClick={prevStep}
                          variant="outline"
                          className="border-[#0033A0] text-[#0033A0]"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={saveDraft}
                          className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      </div>
                      <Button
                        type="button"
                        onClick={nextStep}
                        className="bg-[#FFA500] hover:bg-[#FF8C00] text-white px-8"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 4: Loan Details */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0033A0] mb-2">
                        Loan Details
                      </h2>
                      <p className="text-gray-600 mb-3">
                        Finally, tell us about the loan you're requesting.
                      </p>
                      <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4 text-sm text-gray-700">
                        <strong className="text-[#0033A0]">Required in this step:</strong> Loan Type, Requested Amount, and Loan Purpose
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="loanType">Loan Type *</Label>
                        <Select
                          value={formData.loanType}
                          onValueChange={(value) => updateFormData("loanType", value)}
                          required
                        >
                          <SelectTrigger id="loanType">
                            <SelectValue placeholder="Select loan type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="personal">Personal Loan</SelectItem>
                            <SelectItem value="installment">Installment Loan</SelectItem>
                            <SelectItem value="short_term">Short-Term Loan</SelectItem>
                            <SelectItem value="auto">Auto Loan</SelectItem>
                            <SelectItem value="home_equity">Home Equity Loan</SelectItem>
                            <SelectItem value="heloc">HELOC (Home Equity Line of Credit)</SelectItem>
                            <SelectItem value="student">Student Loan</SelectItem>
                            <SelectItem value="business">Business Loan</SelectItem>
                            <SelectItem value="debt_consolidation">Debt Consolidation Loan</SelectItem>
                            <SelectItem value="mortgage">Mortgage</SelectItem>
                            <SelectItem value="private_money">Private Money Loan</SelectItem>
                            <SelectItem value="title">Title Loan</SelectItem>
                            <SelectItem value="credit_builder">Credit Builder Loan</SelectItem>
                            <SelectItem value="signature">Signature Loan</SelectItem>
                            <SelectItem value="peer_to_peer">Peer-to-Peer (P2P) Loan</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                          Select the loan type that best fits your needs
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="requestedAmount">Requested Amount *</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            $
                          </span>
                          <Input
                            id="requestedAmount"
                            type="number"
                            step="0.01"
                            value={formData.requestedAmount}
                            onChange={(e) => updateFormData("requestedAmount", e.target.value)}
                            placeholder="50000.00"
                            className="pl-7"
                            required
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          Typical range: $500 - $100,000
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="loanPurpose">Loan Purpose *</Label>
                        <Textarea
                          id="loanPurpose"
                          value={formData.loanPurpose}
                          onChange={(e) => updateFormData("loanPurpose", e.target.value)}
                          placeholder="Describe how you plan to use the loan funds..."
                          rows={4}
                          required
                        />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-[#0033A0] mb-2">Before You Submit</h4>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Review all information for accuracy</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>You'll receive a decision within 24 hours</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>Processing fee applies upon approval (typically 2%)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        onClick={prevStep}
                        variant="outline"
                        className="border-[#0033A0] text-[#0033A0]"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitMutation.isPending}
                        className="bg-[#FFA500] hover:bg-[#FF8C00] text-white px-8"
                      >
                        {submitMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 5: Agreements and Preferences */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold text-[#0033A0] mb-2">
                        Agreements & Preferences
                      </h2>
                      <p className="text-gray-600 mb-3">
                        Please review and accept the required agreements.
                      </p>
                      <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4 text-sm text-gray-700">
                        <strong className="text-[#0033A0]">Required in this step:</strong> All agreement checkboxes must be checked to proceed
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Agreements Section */}
                      <div className="bg-gray-50 border rounded-lg p-5">
                        <h3 className="font-bold text-[#0033A0] mb-4">Required Agreements</h3>
                        
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="termsConsent"
                              checked={formData.termsConsent}
                              onChange={(e) => updateFormData("termsConsent", e.target.checked ? "true" : "false")}
                              className="w-5 h-5 mt-1 accent-[#0033A0] cursor-pointer"
                            />
                            <label htmlFor="termsConsent" className="flex-1 cursor-pointer">
                              <span className="font-semibold text-gray-700">I agree to the Terms of Use *</span>
                              <p className="text-sm text-gray-600 mt-1">
                                I have read and agree to the <Link to="/terms-of-use" className="text-[#0033A0] underline hover:text-[#002080]">Terms of Use</Link>
                              </p>
                            </label>
                          </div>

                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="privacyConsent"
                              checked={formData.privacyConsent}
                              onChange={(e) => updateFormData("privacyConsent", e.target.checked ? "true" : "false")}
                              className="w-5 h-5 mt-1 accent-[#0033A0] cursor-pointer"
                            />
                            <label htmlFor="privacyConsent" className="flex-1 cursor-pointer">
                              <span className="font-semibold text-gray-700">I agree to the Privacy Policy *</span>
                              <p className="text-sm text-gray-600 mt-1">
                                I have read and agree to the <Link to="/privacy-policy" className="text-[#0033A0] underline hover:text-[#002080]">Privacy Policy</Link> and understand how my data will be used
                              </p>
                            </label>
                          </div>

                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="creditCheckConsent"
                              checked={formData.creditCheckConsent}
                              onChange={(e) => updateFormData("creditCheckConsent", e.target.checked ? "true" : "false")}
                              className="w-5 h-5 mt-1 accent-[#0033A0] cursor-pointer"
                            />
                            <label htmlFor="creditCheckConsent" className="flex-1 cursor-pointer">
                              <span className="font-semibold text-gray-700">I authorize a credit check *</span>
                              <p className="text-sm text-gray-600 mt-1">
                                I authorize AmeriLend and its partners to perform a credit check and pull my credit report as part of the loan application process
                              </p>
                            </label>
                          </div>

                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="loanAgreementConsent"
                              checked={formData.loanAgreementConsent}
                              onChange={(e) => updateFormData("loanAgreementConsent", e.target.checked ? "true" : "false")}
                              className="w-5 h-5 mt-1 accent-[#0033A0] cursor-pointer"
                            />
                            <label htmlFor="loanAgreementConsent" className="flex-1 cursor-pointer">
                              <span className="font-semibold text-gray-700">I agree to the Loan Agreement *</span>
                              <p className="text-sm text-gray-600 mt-1">
                                I have reviewed and agree to the terms of the loan agreement, including interest rates, fees, and repayment terms
                              </p>
                            </label>
                          </div>

                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="esignConsent"
                              checked={formData.esignConsent}
                              onChange={(e) => updateFormData("esignConsent", e.target.checked ? "true" : "false")}
                              className="w-5 h-5 mt-1 accent-[#0033A0] cursor-pointer"
                            />
                            <label htmlFor="esignConsent" className="flex-1 cursor-pointer">
                              <span className="font-semibold text-gray-700">I consent to electronic signatures *</span>
                              <p className="text-sm text-gray-600 mt-1">
                                I consent to sign this agreement electronically and understand that my electronic signature is legally binding
                              </p>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Contact Preference Section */}
                      <div className="bg-gray-50 border rounded-lg p-5">
                        <h3 className="font-bold text-[#0033A0] mb-4">Contact Preference</h3>
                        <p className="text-sm text-gray-600 mb-4">
                          How would you like us to contact you about your application status?
                        </p>
                        
                        <div className="space-y-2">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="contactMethod"
                              value="email"
                              checked={formData.preferredContact === "email"}
                              onChange={(e) => updateFormData("preferredContact", e.target.value as any)}
                              className="w-4 h-4 accent-[#0033A0]"
                            />
                            <span className="text-gray-700">Email to {formData.email}</span>
                          </label>
                          
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="contactMethod"
                              value="phone"
                              checked={formData.preferredContact === "phone"}
                              onChange={(e) => updateFormData("preferredContact", e.target.value as any)}
                              className="w-4 h-4 accent-[#0033A0]"
                            />
                            <span className="text-gray-700">Call me at {formData.phone || "(not provided)"}</span>
                          </label>
                          
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="contactMethod"
                              value="sms"
                              checked={formData.preferredContact === "sms"}
                              onChange={(e) => updateFormData("preferredContact", e.target.value as any)}
                              className="w-4 h-4 accent-[#0033A0]"
                            />
                            <span className="text-gray-700">Text me at {formData.phone || "(not provided)"}</span>
                          </label>
                        </div>
                      </div>

                      {/* Summary Box */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-[#0033A0] mb-2">Ready to Submit?</h4>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>All agreements have been reviewed and accepted</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Your contact preference has been set</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>You will receive a decision within 24 hours</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        onClick={prevStep}
                        variant="outline"
                        className="border-[#0033A0] text-[#0033A0]"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={submitMutation.isPending || !formData.termsConsent || !formData.privacyConsent || !formData.creditCheckConsent || !formData.loanAgreementConsent || !formData.esignConsent}
                        className="bg-[#FFA500] hover:bg-[#FF8C00] text-white px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Application"
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-2">Need help with your application?</p>
            <div className="flex items-center justify-center gap-4">
              <a
                href="tel:945-212-1609"
                className="flex items-center gap-2 text-[#0033A0] hover:underline"
              >
                <Phone className="w-4 h-4" />
                (945) 212-1609
              </a>
              <span className="text-gray-400">|</span>
              <a href="#faq" className="text-[#0033A0] hover:underline">
                View FAQs
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Main Footer Content */}
          <div className="space-y-6 text-sm text-gray-300">
            {/* Copyright and Links */}
            <div className="border-b border-gray-700 pb-6">
              <p className="mb-3">
                © 2025 AmeriLend. All Rights Reserved. Use of AmeriLend is subject to our Terms of Use and Privacy Policy.
              </p>
              <div className="flex flex-wrap gap-4 text-xs">
                <Link href="/terms-of-use">
                  <span className="text-[#FFA500] hover:underline cursor-pointer">Terms of Use</span>
                </Link>
                <span>|</span>
                <Link href="/privacy-policy">
                  <span className="text-[#FFA500] hover:underline cursor-pointer">Privacy Policy</span>
                </Link>
                <span>|</span>
                <Link href="/california-privacy">
                  <span className="text-[#FFA500] hover:underline cursor-pointer">California Privacy</span>
                </Link>
                <span>|</span>
                <Link href="/california-privacy">
                  <span className="text-[#FFA500] hover:underline cursor-pointer">Do Not Sell My Personal Information</span>
                </Link>
              </div>
            </div>

            {/* California Disclosures */}
            <div className="border-b border-gray-700 pb-6">
              <h3 className="font-semibold text-white mb-2">California Disclosures</h3>
              <p className="text-xs">
                California Consumers can opt-out of the sale of personal information by clicking "Do Not Sell My Personal Information" above.
              </p>
            </div>

            {/* Products Availability */}
            <div className="border-b border-gray-700 pb-6">
              <h3 className="font-semibold text-white mb-2">Product Availability</h3>
              <p className="text-xs">
                Applications submitted on the AmeriLend platform will be originated by one of our bank partners and serviced by AmeriLend. Please see the Rates and Terms for details regarding the availability of products in your state of residence.
              </p>
            </div>

            {/* Testimonials Disclaimer */}
            <div className="border-b border-gray-700 pb-6">
              <h3 className="font-semibold text-white mb-2">About Testimonials & Reviews</h3>
              <p className="text-xs">
                Testimonials reflect the individual's opinion and may not be illustrative of all individual experiences with AmeriLend. Ratings on third-party websites may periodically change; please check the third-party websites for up-to-date reviews and ratings.
              </p>
            </div>

            {/* USA PATRIOT ACT NOTICE */}
            <div className="border-b border-gray-700 pb-6">
              <h3 className="font-semibold text-white mb-3">USA PATRIOT ACT NOTICE: IMPORTANT INFORMATION ABOUT PROCEDURES FOR OPENING A NEW ACCOUNT</h3>
              <p className="text-xs leading-relaxed">
                To help the government fight the funding of terrorism and money laundering activities, Federal law requires all financial institutions to obtain, verify, and record information that identifies each person who opens an account. 
              </p>
              <p className="text-xs leading-relaxed mt-2">
                <strong>What this means for you:</strong> When you open an account, we will ask for your name, address, date of birth, and other information that will allow us to identify you. We may also ask to see your driver's license or other identifying documents.
              </p>
            </div>

            {/* Customer Support */}
            <div className="pb-6">
              <h3 className="font-semibold text-white mb-3">Customer Support</h3>
              <p className="text-xs leading-relaxed">
                If you have questions or concerns, please contact the AmeriLend Customer Support Team:
              </p>
              <div className="mt-2 text-xs space-y-1">
                <p><strong>Phone:</strong> (800) 990-9130</p>
                <p>Monday – Friday: 7 a.m. – 11:00 p.m. Central Time</p>
                <p>Saturday & Sunday: 9 a.m. – 5:00 p.m. Central Time</p>
                <p><strong>Email:</strong> <a href="mailto:info@amerilend.com" className="text-[#FFA500] hover:underline">info@amerilend.com</a></p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-6 text-center text-xs text-gray-500">
            <p>AmeriLend is committed to providing transparent and fair lending practices.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
