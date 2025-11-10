import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { CodeButton } from "@/components/ui/CodeButton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { AdminBankAccounts } from "@/components/AdminBankAccounts";
import SEO from "@/components/SEO";
import { ApplicationCardSkeleton, TableRowSkeleton } from "@/components/ui/skeleton";
import { ErrorDisplay, InlineError } from "@/components/ui/error-display";
import {
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
  FileText,
  Phone,
  LogOut,
  AlertCircle,
  CreditCard,
  Share2,
  ArrowLeft,
  ArrowRight,
  Home,
  PartyPopper,
  Sparkles,
  TrendingUp,
  Calendar,
  Bell,
  Download,
  Upload,
  History,
  Loader2,
  Settings,
  CheckCircle,
  Send,
  Eye,
  MapPin,
  Briefcase,
  User,
  Activity,
  Shield,
  MessageSquare,
  Paperclip,
} from "lucide-react";
import { FullPageLoader, Loader } from "@/components/ui/loader";
import { EmailVerificationBanner } from "@/components/EmailVerificationBanner";
import { EnhancedFullPageLoader } from "@/components/ui/enhanced-loaders";
import { PrimaryButton, SecondaryButton } from "@/components/ui/enhanced-buttons";
import { LoanCard, DataCard, EnhancedCard } from "@/components/ui/enhanced-cards";
import { Link, useLocation } from "wouter";
import { AISupportChat } from "@/components/AISupportChat";
import { ReferralComponent } from "@/components/ReferralComponent";
import { DocumentReupload } from "@/components/DocumentReupload";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, logout, loading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: "/login"
  });
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const isAdmin = user?.role === "admin";

  // ============================================================================
  // ADMIN-SPECIFIC STATE
  // ============================================================================

  // Approval dialog state
  const [approvalDialog, setApprovalDialog] = useState<{ open: boolean; applicationId: number | null }>({
    open: false,
    applicationId: null,
  });
  const [approvalAmount, setApprovalAmount] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");

  // Rejection dialog state
  const [rejectionDialog, setRejectionDialog] = useState<{ open: boolean; applicationId: number | null }>({
    open: false,
    applicationId: null,
  });
  const [rejectionReason, setRejectionReason] = useState("");

  // Request more info dialog state
  const [requestInfoDialog, setRequestInfoDialog] = useState<{ open: boolean; applicationId: number | null }>({
    open: false,
    applicationId: null,
  });
  const [requestInfoMessage, setRequestInfoMessage] = useState("");

  // Disbursement dialog state
  const [disbursementDialog, setDisbursementDialog] = useState<{ open: boolean; applicationId: number | null }>({
    open: false,
    applicationId: null,
  });
  const [disbursementMethod, setDisbursementMethod] = useState<"ach" | "wire" | "check" | "paycard">("ach");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [accountType, setAccountType] = useState<"checking" | "savings">("checking");
  const [swiftCode, setSwiftCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [checkMailingAddress, setCheckMailingAddress] = useState("");
  const [checkPayeeName, setCheckPayeeName] = useState("");
  const [disbursementNotes, setDisbursementNotes] = useState("");

  // Fee config state
  const [feeMode, setFeeMode] = useState<"percentage" | "fixed">("percentage");
  const [percentageRate, setPercentageRate] = useState("2.00");
  const [fixedFeeAmount, setFixedFeeAmount] = useState("5.75");

  // Identity verification dialog state
  const [identityDialog, setIdentityDialog] = useState<{ open: boolean; applicationId: number | null; status: "approved" | "rejected" | null }>({
    open: false,
    applicationId: null,
    status: null,
  });
  const [identityVerificationNotes, setIdentityVerificationNotes] = useState("");
  const [identityApproving, setIdentityApproving] = useState(false);

  // Fraud monitoring state (admin only)
  const [fraudApprovalDialog, setFraudApprovalDialog] = useState<{ open: boolean; applicationId: number | null; fraudScore: number | null }>({
    open: false,
    applicationId: null,
    fraudScore: null,
  });
  const [fraudApprovalNotes, setFraudApprovalNotes] = useState("");

  const [fraudRejectionDialog, setFraudRejectionDialog] = useState<{ open: boolean; applicationId: number | null; fraudScore: number | null }>({
    open: false,
    applicationId: null,
    fraudScore: null,
  });
  const [fraudRejectionReason, setFraudRejectionReason] = useState("");

  // Customer details dialog state
  const [customerDetailsDialog, setCustomerDetailsDialog] = useState<{ open: boolean; application: any | null }>({
    open: false,
    application: null,
  });

  // ============================================================================
  // QUERIES
  // ============================================================================

  // Admin: all applications | User: personal applications only
  const { data: applications, isLoading: adminLoading } = trpc.loans.adminList.useQuery(undefined, {
    enabled: isAuthenticated && isAdmin,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { data: loans, isLoading } = trpc.loans.myApplications.useQuery(undefined, {
    enabled: isAuthenticated && !isAdmin,
  });

  const { data: feeConfig } = trpc.feeConfig.getActive.useQuery(undefined, {
    enabled: isAuthenticated && isAdmin,
  });

  // Admin: Fraud monitoring query
  const { data: flaggedApplications, isLoading: fraudLoading, refetch: refetchFlagged } = trpc.fraud.getFlagged.useQuery(
    { minScore: 50 },
    {
      enabled: isAuthenticated && isAdmin,
      retry: 1,
      refetchOnWindowFocus: false,
    }
  );

  const [celebratedLoans, setCelebratedLoans] = useState<Set<number>>(new Set());

  // Trigger confetti for newly approved loans
  useEffect(() => {
    if (loans && loans.length > 0) {
      loans.forEach((loan: any) => {
        if (loan.status === "approved" && !celebratedLoans.has(loan.id)) {
          // Add to celebrated loans to avoid repeated animations
          setCelebratedLoans(prev => new Set(prev).add(loan.id));
          
          // Trigger confetti animation
          const duration = 2500;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

          const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

          const interval: any = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
              return clearInterval(interval);
            }

            const particleCount = 30 * (timeLeft / duration);
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
              colors: ['#0033A0', '#00A651', '#D4AF37', '#FFA500']
            });
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
              colors: ['#0033A0', '#00A651', '#D4AF37', '#FFA500']
            });
          }, 250);
        }
      });
    }
  }, [loans]);

  // ============================================================================
  // ADMIN MUTATIONS
  // ============================================================================

  const adminApproveMutation = trpc.loans.adminApprove.useMutation({
    onSuccess: () => {
      utils.loans.adminList.invalidate();
      setApprovalDialog({ open: false, applicationId: null });
      setApprovalAmount("");
      setApprovalNotes("");
      toast.success("Application approved successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve application");
    },
  });

  const adminRejectMutation = trpc.loans.adminReject.useMutation({
    onSuccess: () => {
      utils.loans.adminList.invalidate();
      setRejectionDialog({ open: false, applicationId: null });
      setRejectionReason("");
      toast.success("Application rejected successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject application");
    },
  });

  const adminRequestInfoMutation = trpc.loans.adminRequestInfo.useMutation({
    onSuccess: () => {
      utils.loans.adminList.invalidate();
      setRequestInfoDialog({ open: false, applicationId: null });
      setRequestInfoMessage("");
      toast.success("Info request sent successfully!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to request info");
    },
  });

  const disbursementMutation = trpc.disbursements.adminInitiate.useMutation({
    onSuccess: (data) => {
      utils.loans.adminList.invalidate();
      setDisbursementDialog({ open: false, applicationId: null });
      setDisbursementMethod("ach");
      setAccountHolderName("");
      setAccountNumber("");
      setRoutingNumber("");
      setAccountType("checking");
      setSwiftCode("");
      setBankName("");
      setCheckMailingAddress("");
      setCheckPayeeName("");
      setDisbursementNotes("");
      
      // Show success with tracking number
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      toast.success(
        <div>
          <p className="font-bold">Disbursement initiated successfully!</p>
          <p className="text-sm">Tracking: {data.trackingNumber}</p>
          <p className="text-sm">Reference: {data.referenceNumber}</p>
        </div>,
        { duration: 8000 }
      );
    },
    onError: (error) => {
      toast.error(error.message || "Failed to initiate disbursement");
    },
  });

  const updateFeeConfigMutation = trpc.feeConfig.adminUpdate.useMutation({
    onSuccess: () => {
      utils.feeConfig.getActive.invalidate();
      toast.success("Fee configuration updated!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update fee config");
    },
  });

  const updateIdentityVerificationMutation = trpc.identity.updateVerificationStatus.useMutation({
    onSuccess: (data) => {
      utils.loans.adminList.invalidate();
      setIdentityDialog({ open: false, applicationId: null, status: null });
      setIdentityVerificationNotes("");
      setIdentityApproving(false);
      toast.success(data.message);
    },
    onError: (error) => {
      setIdentityApproving(false);
      toast.error(error.message || "Failed to update identity verification");
    },
  });

  // ============================================================================
  // ADMIN HANDLERS
  // ============================================================================

  const handleApprove = () => {
    if (!approvalDialog.applicationId || !approvalAmount) {
      toast.error("Please enter an approval amount");
      return;
    }

    adminApproveMutation.mutate({
      id: approvalDialog.applicationId,
      approvedAmount: parseFloat(approvalAmount),
      adminNotes: approvalNotes,
    });
  };

  const handleReject = () => {
    if (!rejectionDialog.applicationId) return;

    adminRejectMutation.mutate({
      id: rejectionDialog.applicationId,
      rejectionReason: rejectionReason,
    });
  };

  const handleRequestInfo = () => {
    if (!requestInfoDialog.applicationId) return;

    adminRequestInfoMutation.mutate({
      id: requestInfoDialog.applicationId,
      message: requestInfoMessage,
    });
  };

  const handleDisburse = () => {
    if (!disbursementDialog.applicationId) return;

    const disbursementData: any = {
      applicationId: disbursementDialog.applicationId,
      method: disbursementMethod,
      notes: disbursementNotes,
    };

    if (disbursementMethod === "ach") {
      if (!accountHolderName || !accountNumber || !routingNumber) {
        toast.error("Please fill in all ACH details");
        return;
      }
      disbursementData.accountHolderName = accountHolderName;
      disbursementData.accountNumber = accountNumber;
      disbursementData.routingNumber = routingNumber;
      disbursementData.accountType = accountType;
    } else if (disbursementMethod === "wire") {
      if (!bankName || !accountNumber || !swiftCode) {
        toast.error("Please fill in all wire details");
        return;
      }
      disbursementData.bankName = bankName;
      disbursementData.accountNumber = accountNumber;
      disbursementData.swiftCode = swiftCode;
    } else if (disbursementMethod === "check") {
      if (!checkPayeeName || !checkMailingAddress) {
        toast.error("Please fill in check details");
        return;
      }
      disbursementData.checkPayeeName = checkPayeeName;
      disbursementData.checkMailingAddress = checkMailingAddress;
    }

    disbursementMutation.mutate(disbursementData);
  };

  const handleUpdateFeeConfig = () => {
    const rate = feeMode === "percentage" ? parseFloat(percentageRate) : parseFloat(fixedFeeAmount);

    if (isNaN(rate) || rate < 0) {
      toast.error("Invalid fee amount");
      return;
    }

    updateFeeConfigMutation.mutate({
      calculationMode: feeMode,
      percentageRate: feeMode === "percentage" ? rate : undefined,
      fixedFeeAmount: feeMode === "fixed" ? rate : undefined,
    });
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  if (loading) {
    return <EnhancedFullPageLoader text="Loading your dashboard..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
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

        <div className="flex-1 flex items-center justify-center py-12">
          <Card className="w-full max-w-lg mx-4">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-[#0033A0]/10 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#0033A0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#0033A0] mb-2">Sign In Required</h2>
              <p className="text-gray-600 mb-6">
                Please sign in to view your dashboard and manage your loan applications.
              </p>
              <Button
                className="w-full bg-[#FFA500] hover:bg-[#FF8C00] text-white"
                asChild
              >
                <a href={getLoginUrl()}>Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        icon: Clock,
        text: "Under Review",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        borderColor: "border-yellow-300",
      },
      approved: {
        icon: CheckCircle2,
        text: "Approved",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "border-green-300",
      },
      rejected: {
        icon: XCircle,
        text: "Not Approved",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        borderColor: "border-red-300",
      },
      fee_pending: {
        icon: AlertCircle,
        text: "Payment Required",
        bgColor: "bg-orange-100",
        textColor: "text-orange-800",
        borderColor: "border-orange-300",
      },
      fee_paid: {
        icon: CreditCard,
        text: "Payment Confirmed",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        borderColor: "border-blue-300",
      },
      disbursed: {
        icon: CheckCircle2,
        text: "Funded",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        borderColor: "border-green-300",
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border ${config.bgColor} ${config.textColor} ${config.borderColor}`}
      >
        <Icon className="w-4 h-4" />
        <span className="text-sm font-semibold">{config.text}</span>
      </div>
    );
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date));
  };

  // ============================================================================
  // ADMIN VIEW
  // ============================================================================
  
  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard - Loan Management</h1>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user?.email}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
              <TabsTrigger value="applications">Loan Applications</TabsTrigger>
              <TabsTrigger value="bank-accounts">Bank Accounts</TabsTrigger>
              <TabsTrigger value="identity-verification">Identity Verification</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Loan Applications Tab */}
            <TabsContent value="applications" className="space-y-6">
              {adminLoading ? (
                <EnhancedFullPageLoader text="Loading loan applications..." />
              ) : !applications || applications.length === 0 ? (
                <Card className="bg-white border-gray-200">
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-600">No applications found</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <DataCard
                      label="Total Applications"
                      value={applications.length.toString()}
                      icon={<Briefcase className="w-8 h-8 text-blue-400" />}
                    />
                    <DataCard
                      label="Total Requested"
                      value={formatCurrency(applications.reduce((sum: number, app: any) => sum + ((app.requestedAmount ? Number(app.requestedAmount) : app.loanAmount) || 0), 0))}
                      icon={<DollarSign className="w-8 h-8 text-green-400" />}
                    />
                    <DataCard
                      label="Total Approved"
                      value={formatCurrency(applications.reduce((sum: number, app: any) => sum + (app.approvedAmount ? Number(app.approvedAmount) : 0), 0))}
                      icon={<CheckCircle className="w-8 h-8 text-emerald-400" />}
                    />
                    <DataCard
                      label="Pending Review"
                      value={applications.filter((app: any) => app.status === "pending" || app.status === "under_review").length.toString()}
                      icon={<Clock className="w-8 h-8 text-yellow-400" />}
                    />
                  </div>

                  <div className="space-y-4">
                    {applications.map((application: any) => (
                      <Card key={application.id} className="bg-white border-gray-200 hover:border-blue-300 hover:shadow-md transition">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-gray-900">{application.firstName} {application.lastName}</CardTitle>
                              <CardDescription className="text-gray-600">{application.email}</CardDescription>
                            </div>
                            <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">
                              {application.status?.replace(/_/g, " ").toUpperCase() || "PENDING"}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Requested Amount</p>
                              <p className="text-gray-900 font-semibold">{formatCurrency((application.requestedAmount ? Number(application.requestedAmount) : application.loanAmount) || 0)}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Approved Amount</p>
                              <p className="text-gray-900 font-semibold">{application.approvedAmount ? formatCurrency(Number(application.approvedAmount)) : "—"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Fraud Score</p>
                              <p className="text-gray-900 font-semibold">{application.fraudScore || "—"}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Application Date</p>
                              <p className="text-gray-900 font-semibold">
                                {application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "—"}
                              </p>
                            </div>
                          </div>

                          {application.documents && application.documents.length > 0 && (
                            <div className="pt-2 border-t border-gray-200">
                              <p className="text-sm font-semibold text-gray-700 mb-2">Documents</p>
                              <div className="space-y-2">
                                {application.documents.map((doc: any) => (
                                  <div key={doc.id} className="flex items-center justify-between bg-gray-50 border border-gray-200 p-2 rounded">
                                    <span className="text-sm text-gray-700 flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-gray-600" />
                                      {doc.fileName}
                                    </span>
                                    <a href={doc.fileUrl} download title={`Download ${doc.fileName}`} className="text-blue-600 hover:text-blue-700">
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2 pt-2">
                            <Link href={`/application/${application.id}`}>
                              <Button
                                size="sm"
                                variant="outline"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View Full Details
                              </Button>
                            </Link>
                            {(application.status === "pending" || application.status === "under_review") && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setRequestInfoDialog({ open: true, applicationId: application.id })}
                                >
                                  <MessageSquare className="w-4 h-4 mr-1" />
                                  Request Info
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    setApprovalDialog({ open: true, applicationId: application.id });
                                    setApprovalAmount((application.requestedAmount ? Number(application.requestedAmount).toString() : application.loanAmount?.toString()) || "");
                                  }}
                                >
                                  <CheckCircle className="w-4 h-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => setRejectionDialog({ open: true, applicationId: application.id })}
                                >
                                  <XCircle className="w-4 h-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            {application.status === "approved" && (
                              <Button
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => setDisbursementDialog({ open: true, applicationId: application.id })}
                              >
                                <Send className="w-4 h-4 mr-1" />
                                Disburse
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Bank Accounts Tab */}
            <TabsContent value="bank-accounts" className="space-y-6">
              <AdminBankAccounts />
            </TabsContent>

            {/* Identity Verification Tab */}
            <TabsContent value="identity-verification" className="space-y-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900 flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-600" />
                    Identity Verification Hub
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Review and approve ID documents and selfies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {adminLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : !applications || applications.length === 0 ? (
                    <p className="text-center text-gray-600 py-8">No applications found</p>
                  ) : (
                    <div className="space-y-4">
                      {/* Filter: Show only applications that need ID verification */}
                      {applications
                        .filter((app: any) => app.status !== "rejected" && app.status !== "cancelled")
                        .map((application: any) => (
                        <Card key={application.id} className="border-2 hover:border-blue-300 transition">
                          <CardContent className="p-6">
                            <div className="flex flex-col lg:flex-row gap-6">
                              {/* Applicant Info */}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-4">
                                  <div>
                                    <h3 className="text-lg font-bold text-gray-900">
                                      {application.firstName} {application.lastName}
                                    </h3>
                                    <p className="text-sm text-gray-600">{application.email}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      Ref: {application.applicationReferenceNumber || `#${application.id}`}
                                    </p>
                                  </div>
                                  <Badge className={
                                    application.identityVerificationStatus === "approved" 
                                      ? "bg-green-100 text-green-800"
                                      : application.identityVerificationStatus === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }>
                                    {application.identityVerificationStatus === "approved" ? "✓ Verified" : 
                                     application.identityVerificationStatus === "rejected" ? "✗ Rejected" :
                                     "⏰ Pending Review"}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                                  <div>
                                    <p className="text-gray-500">ID Type</p>
                                    <p className="font-semibold text-gray-900 capitalize">
                                      {application.idType?.replace(/_/g, " ") || "N/A"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">ID Number</p>
                                    <p className="font-semibold text-gray-900">{application.idNumber || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">DOB</p>
                                    <p className="font-semibold text-gray-900">{application.dateOfBirth || "N/A"}</p>
                                  </div>
                                  <div>
                                    <p className="text-gray-500">Loan Amount</p>
                                    <p className="font-semibold text-gray-900">
                                      {formatCurrency((application.requestedAmount ? Number(application.requestedAmount) : application.loanAmount) || 0)}
                                    </p>
                                  </div>
                                </div>

                                {/* Identity Documents Display - Improved */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                  {/* ID Document */}
                                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden hover:border-blue-500 transition">
                                    {application.idDocumentUrl ? (
                                      <div className="relative bg-gray-100 aspect-video flex items-center justify-center group">
                                        <img 
                                          src={application.idDocumentUrl} 
                                          alt="Government ID"
                                          className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                                          <Button 
                                            size="sm" 
                                            variant="secondary" 
                                            className="opacity-0 group-hover:opacity-100 transition"
                                            asChild
                                          >
                                            <a href={application.idDocumentUrl} target="_blank" rel="noopener noreferrer">
                                              <Eye className="w-4 h-4 mr-1" />
                                              Fullscreen
                                            </a>
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-gray-50 aspect-video flex flex-col items-center justify-center p-4 text-center">
                                        <FileText className="w-12 h-12 text-gray-300 mb-2" />
                                        <p className="text-sm font-semibold text-gray-600">Government ID</p>
                                        <p className="text-xs text-gray-500 mt-1">Not uploaded</p>
                                      </div>
                                    )}
                                    <div className="px-3 py-2 bg-white border-t border-gray-200">
                                      <p className="text-xs font-semibold text-gray-600">Government ID</p>
                                      <p className="text-xs text-gray-500">
                                        {application.idDocumentUrl ? "✓ Uploaded" : "✗ Missing"}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Selfie */}
                                  <div className="border-2 border-gray-300 rounded-lg overflow-hidden hover:border-blue-500 transition">
                                    {application.selfieUrl ? (
                                      <div className="relative bg-gray-100 aspect-video flex items-center justify-center group">
                                        <img 
                                          src={application.selfieUrl} 
                                          alt="Live Selfie"
                                          className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                                          <Button 
                                            size="sm" 
                                            variant="secondary" 
                                            className="opacity-0 group-hover:opacity-100 transition"
                                            asChild
                                          >
                                            <a href={application.selfieUrl} target="_blank" rel="noopener noreferrer">
                                              <Eye className="w-4 h-4 mr-1" />
                                              Fullscreen
                                            </a>
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="bg-gray-50 aspect-video flex flex-col items-center justify-center p-4 text-center">
                                        <User className="w-12 h-12 text-gray-300 mb-2" />
                                        <p className="text-sm font-semibold text-gray-600">Live Selfie</p>
                                        <p className="text-xs text-gray-500 mt-1">Not uploaded</p>
                                      </div>
                                    )}
                                    <div className="px-3 py-2 bg-white border-t border-gray-200">
                                      <p className="text-xs font-semibold text-gray-600">Live Selfie</p>
                                      <p className="text-xs text-gray-500">
                                        {application.selfieUrl ? "✓ Uploaded" : "✗ Missing"}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {application.verificationNotes && (
                                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                                    <p className="text-xs font-semibold text-gray-700 mb-1">Verification Notes:</p>
                                    <p className="text-sm text-gray-600">{application.verificationNotes}</p>
                                  </div>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col gap-2 min-w-[200px]">
                                {application.identityVerificationStatus === "pending" && (
                                  <>
                                    <Button 
                                      className="bg-green-600 hover:bg-green-700 w-full"
                                      disabled={identityApproving}
                                      onClick={() => {
                                        setIdentityApproving(true);
                                        updateIdentityVerificationMutation.mutate({
                                          loanApplicationId: application.id,
                                          status: "approved",
                                          verificationNotes: identityVerificationNotes,
                                          verifierId: user?.id || 0,
                                        });
                                      }}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      {identityApproving ? "Approving..." : "Approve ID"}
                                    </Button>
                                    <Button 
                                      variant="destructive"
                                      className="w-full"
                                      disabled={identityApproving}
                                      onClick={() => {
                                        setIdentityApproving(true);
                                        updateIdentityVerificationMutation.mutate({
                                          loanApplicationId: application.id,
                                          status: "rejected",
                                          verificationNotes: identityVerificationNotes,
                                          verifierId: user?.id || 0,
                                        });
                                      }}
                                    >
                                      <XCircle className="w-4 h-4 mr-2" />
                                      {identityApproving ? "Rejecting..." : "Reject ID"}
                                    </Button>
                                  </>
                                )}
                                {application.identityVerificationStatus === "approved" && (
                                  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 text-center">
                                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                                    <p className="font-semibold text-green-900">Verified</p>
                                    {application.verificationDate && (
                                      <p className="text-xs text-green-700 mt-1">
                                        {new Date(application.verificationDate).toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                )}
                                {application.identityVerificationStatus === "rejected" && (
                                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 text-center">
                                    <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                                    <p className="font-semibold text-red-900">Rejected</p>
                                  </div>
                                )}
                                <Link href={`/application/${application.id}`}>
                                  <Button variant="outline" size="sm" className="w-full">
                                    <Eye className="w-4 h-4 mr-2" />
                                    Full Details
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card className="bg-white border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">Fee Configuration</CardTitle>
                  <CardDescription className="text-gray-600">Configure application fees</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-700">Fee Mode</Label>
                    <Select value={feeMode} onValueChange={(value) => setFeeMode(value as "percentage" | "fixed")}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200">
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {feeMode === "percentage" ? (
                    <div className="space-y-2">
                      <Label className="text-gray-700">Percentage Rate (%)</Label>
                      <Input
                        type="number"
                        value={percentageRate}
                        onChange={(e) => setPercentageRate(e.target.value)}
                        step="0.01"
                        min="0"
                        className="border-gray-300 text-gray-900"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="text-gray-700">Fixed Fee Amount ($)</Label>
                      <Input
                        type="number"
                        value={fixedFeeAmount}
                        onChange={(e) => setFixedFeeAmount(e.target.value)}
                        step="0.01"
                        min="0"
                        className="border-gray-300 text-gray-900"
                      />
                    </div>
                  )}

                  <Button onClick={handleUpdateFeeConfig} className="bg-blue-600 hover:bg-blue-700 w-full">
                    {updateFeeConfigMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Fee Configuration
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Admin Dialogs */}
        {/* Approval Dialog */}
        <Dialog open={approvalDialog.open} onOpenChange={(open) => !open && setApprovalDialog({ ...approvalDialog, open })}>
          <DialogContent className="bg-white border-gray-200 !w-11/12 !max-w-none max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Approve Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700">Approval Amount ($)</Label>
                <Input
                  type="number"
                  value={approvalAmount}
                  onChange={(e) => setApprovalAmount(e.target.value)}
                  placeholder="Enter amount"
                  step="100"
                  className="border-gray-300 text-gray-900"
                />
              </div>
              <div>
                <Label className="text-gray-700">Notes</Label>
                <Textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Add notes (optional)"
                  className="border-gray-300 text-gray-900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApprovalDialog({ open: false, applicationId: null })}>
                Cancel
              </Button>
              <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700" disabled={adminApproveMutation.isPending}>
                {adminApproveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rejection Dialog */}
        <Dialog open={rejectionDialog.open} onOpenChange={(open) => !open && setRejectionDialog({ ...rejectionDialog, open })}>
          <DialogContent className="bg-white border-gray-200 !w-11/12 !max-w-none max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Reject Application</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700">Rejection Reason</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter rejection reason"
                  className="border-gray-300 text-gray-900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectionDialog({ open: false, applicationId: null })}>
                Cancel
              </Button>
              <Button onClick={handleReject} variant="destructive" disabled={adminRejectMutation.isPending}>
                {adminRejectMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Reject
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Request Info Dialog */}
        <Dialog open={requestInfoDialog.open} onOpenChange={(open) => !open && setRequestInfoDialog({ ...requestInfoDialog, open })}>
          <DialogContent className="bg-white border-gray-200 !w-11/12 !max-w-none max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Request Information</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700">Message</Label>
                <Textarea
                  value={requestInfoMessage}
                  onChange={(e) => setRequestInfoMessage(e.target.value)}
                  placeholder="Enter information request message"
                  className="border-gray-300 text-gray-900"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRequestInfoDialog({ open: false, applicationId: null })}>
                Cancel
              </Button>
              <Button onClick={handleRequestInfo} disabled={adminRequestInfoMutation.isPending}>
                {adminRequestInfoMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Disbursement Dialog */}
        <Dialog open={disbursementDialog.open} onOpenChange={(open) => !open && setDisbursementDialog({ ...disbursementDialog, open })}>
          <DialogContent className="bg-white border-gray-200 !w-11/12 !max-w-none max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Initiate Disbursement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700">Disbursement Method</Label>
                <Select value={disbursementMethod} onValueChange={(value) => setDisbursementMethod(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ach">ACH Transfer</SelectItem>
                    <SelectItem value="wire">Wire Transfer</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="paycard">Pay Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {disbursementMethod === "ach" && (
                <>
                  <div>
                    <Label>Account Holder Name</Label>
                    <Input value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Account Number</Label>
                    <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} type="password" />
                  </div>
                  <div>
                    <Label>Routing Number</Label>
                    <Input value={routingNumber} onChange={(e) => setRoutingNumber(e.target.value)} />
                  </div>
                  <div>
                    <Label>Account Type</Label>
                    <Select value={accountType} onValueChange={(value) => setAccountType(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="checking">Checking</SelectItem>
                        <SelectItem value="savings">Savings</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {disbursementMethod === "wire" && (
                <>
                  <div>
                    <Label className="text-gray-700">Bank Name</Label>
                    <Input value={bankName} onChange={(e) => setBankName(e.target.value)} className="border-gray-300 text-gray-900" />
                  </div>
                  <div>
                    <Label className="text-gray-700">Account Number</Label>
                    <Input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} type="password" className="border-gray-300 text-gray-900" />
                  </div>
                  <div>
                    <Label className="text-gray-700">SWIFT Code</Label>
                    <Input value={swiftCode} onChange={(e) => setSwiftCode(e.target.value)} className="border-gray-300 text-gray-900" />
                  </div>
                </>
              )}

              {disbursementMethod === "check" && (
                <>
                  <div>
                    <Label className="text-gray-700">Payee Name</Label>
                    <Input value={checkPayeeName} onChange={(e) => setCheckPayeeName(e.target.value)} className="border-gray-300 text-gray-900" />
                  </div>
                  <div>
                    <Label className="text-gray-700">Mailing Address</Label>
                    <Textarea value={checkMailingAddress} onChange={(e) => setCheckMailingAddress(e.target.value)} className="border-gray-300 text-gray-900" />
                  </div>
                </>
              )}

              <div>
                <Label className="text-gray-700">Notes</Label>
                <Textarea value={disbursementNotes} onChange={(e) => setDisbursementNotes(e.target.value)} placeholder="Add notes (optional)" className="border-gray-300 text-gray-900" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDisbursementDialog({ open: false, applicationId: null })}>
                Cancel
              </Button>
              <Button onClick={handleDisburse} className="bg-purple-600 hover:bg-purple-700" disabled={disbursementMutation.isPending}>
                {disbursementMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Disburse
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Customer Details Dialog */}
        <Dialog open={customerDetailsDialog.open} onOpenChange={(open) => !open && setCustomerDetailsDialog({ ...customerDetailsDialog, open })}>
          <DialogContent className="bg-slate-800 border-purple-500/30 !w-11/12 !max-w-none max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Customer Details</DialogTitle>
            </DialogHeader>
            {customerDetailsDialog.application && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">First Name</p>
                    <p className="text-white font-semibold">{customerDetailsDialog.application.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Last Name</p>
                    <p className="text-white font-semibold">{customerDetailsDialog.application.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white font-semibold">{customerDetailsDialog.application.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white font-semibold">{customerDetailsDialog.application.phoneNumber || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Requested Amount</p>
                    <p className="text-white font-semibold">{formatCurrency((customerDetailsDialog.application.requestedAmount ? Number(customerDetailsDialog.application.requestedAmount) : customerDetailsDialog.application.loanAmount) || 0)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Approved Amount</p>
                    <p className="text-white font-semibold">{customerDetailsDialog.application.approvedAmount ? formatCurrency(Number(customerDetailsDialog.application.approvedAmount)) : "—"}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setCustomerDetailsDialog({ open: false, application: null })}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ============================================================================
  // USER VIEW
  // ============================================================================

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <SEO
        title="My Dashboard - Manage Your Loan"
        description="Access your AmeriLend dashboard to view loan details, make payments, upload documents, and track your application status. Secure account management portal."
        ogType="website"
      />
      
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
              <Link href="/profile">
                <Button variant="outline" className="border-[#0033A0] text-[#0033A0] hover:bg-[#0033A0] hover:text-white">
                  Profile
                </Button>
              </Link>
              {user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="outline" className="border-[#0033A0] text-[#0033A0]">
                    Admin Panel
                  </Button>
                </Link>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-[#0033A0] text-[#0033A0]"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Welcome Banner */}
      <div className="bg-[#0033A0] text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name || "Valued Customer"}!</h1>
          <p className="text-white/90">
            Manage your loan applications and track your progress.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Email Verification Banner */}
          {loans && loans.length > 0 && loans.some((loan: any) => loan.emailVerified === 0) && (() => {
            const unverifiedLoan = loans.find((loan: any) => loan.emailVerified === 0);
            return unverifiedLoan ? (
              <EmailVerificationBanner 
                applicationId={unverifiedLoan.id}
                email={unverifiedLoan.email}
              />
            ) : null;
          })()}

          {/* Account Overview Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4 mb-8">
            <DataCard 
              label="Total Requested"
              value={formatCurrency(
                loans?.reduce((sum: number, loan: any) => sum + Number(loan.requestedAmount), 0) || 0
              )}
              icon={<DollarSign className="w-6 h-6" />}
            />

            <DataCard 
              label="Approved Loans"
              value={loans?.filter((l: any) => l.status === 'approved' || l.status === 'fee_pending' || l.status === 'fee_paid' || l.status === 'disbursed').length || 0}
              icon={<CheckCircle2 className="w-6 h-6" />}
            />

            <DataCard 
              label="Pending Review"
              value={loans?.filter((l: any) => l.status === 'pending' || l.status === 'under_review').length || 0}
              icon={<Clock className="w-6 h-6" />}
            />

            <DataCard 
              label="This Month"
              value={loans?.filter((l: any) => {
                const loanDate = new Date(l.createdAt);
                const now = new Date();
                return loanDate.getMonth() === now.getMonth() && 
                       loanDate.getFullYear() === now.getFullYear();
              }).length || 0}
              icon={<TrendingUp className="w-6 h-6" />}
            />
          </div>

          {/* Notifications/Alerts */}
          {loans && loans.some((loan: any) => loan.status === 'approved' || loan.status === 'fee_pending') && (
            <Card className="mb-8 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Bell className="w-5 h-5 text-orange-600 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                      <span>Action Required</span>
                      <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">
                        {loans.filter((l: any) => l.status === 'approved' || l.status === 'fee_pending').length}
                      </span>
                    </h3>
                    <p className="text-sm text-gray-700 mb-3">
                      You have approved loans waiting for payment. Complete the processing fee to receive your funds.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {loans
                        .filter((loan: any) => loan.status === 'approved' || loan.status === 'fee_pending')
                        .map((loan: any) => (
                          <Link key={loan.id} href={`/payment/${loan.applicationReferenceNumber}?amount=${(Number(loan.requestedAmount) * 0.045).toFixed(2)}`} className="inline-block">
                            <PrimaryButton size="sm">
                              Pay {loan.applicationReferenceNumber || `Loan #${loan.id}`}
                            </PrimaryButton>
                          </Link>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-8">
            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0033A0] mb-1">New Application</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Check your application status
                    </p>
                    <Link href="/check-status" className="inline-block w-full">
                      <PrimaryButton className="w-full" icon={<ArrowRight />}>
                        Check Status
                      </PrimaryButton>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0033A0] mb-1">Contact Support</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Speak with a Loan Advocate
                    </p>
                    <Button
                      variant="outline"
                      className="border-[#0033A0] text-[#0033A0] w-full"
                      asChild
                    >
                      <a href="tel:945-212-1609">Call Now</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0033A0] mb-1">Total Applications</h3>
                    <p className="text-3xl font-bold text-gray-800 mb-1">
                      {loans?.length || 0}
                    </p>
                    <p className="text-sm text-gray-600">Active and completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Applications, Referrals, Activity, Payments, Documents, and Settings */}
          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 bg-gray-100 gap-1 sm:gap-0" id="dashboard-tabs">
              <TabsTrigger value="applications" className="data-[state=active]:bg-white text-xs sm:text-sm p-2 sm:p-3">
                <FileText className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">My Applications</span>
              </TabsTrigger>
              <TabsTrigger value="referrals" className="data-[state=active]:bg-white text-xs sm:text-sm p-2 sm:p-3">
                <Share2 className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Referrals</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-white text-xs sm:text-sm p-2 sm:p-3">
                <History className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Activity</span>
              </TabsTrigger>
              <TabsTrigger value="payments" className="data-[state=active]:bg-white text-xs sm:text-sm p-2 sm:p-3">
                <CreditCard className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Payments</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="data-[state=active]:bg-white text-xs sm:text-sm p-2 sm:p-3" id="documents-tab">
                <FileText className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Documents</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-white text-xs sm:text-sm p-2 sm:p-3">
                <Settings className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Applications Tab */}
            <TabsContent value="applications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-[#0033A0]">My Loan Applications</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <ApplicationCardSkeleton />
                  <ApplicationCardSkeleton />
                </div>
              ) : loans && loans.length > 0 ? (
                <div className="space-y-4">
                  {loans.map((loan: any) => (
                    <Card 
                      key={loan.id} 
                      className={`border-l-4 ${
                        loan.status === "approved" 
                          ? "border-l-green-500 bg-gradient-to-r from-green-50 to-white shadow-lg animate-slide-up" 
                          : "border-l-[#0033A0]"
                      }`}
                    >
                      <CardContent className="p-3 sm:p-4 md:p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800">
                                {loan.loanType === "installment" ? "Installment Loan" : "Short-Term Loan"}
                              </h3>
                              {getStatusBadge(loan.status)}
                            </div>
                            {/* Loan Status Overview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mb-3 sm:mb-4">
                              <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
                                <p className="text-xs text-gray-600 mb-1">Loan Amount</p>
                                <p className="font-bold text-sm sm:text-base md:text-lg text-[#0033A0]">
                                  {formatCurrency(Number(loan.requestedAmount))}
                                </p>
                              </div>
                              <div className={`rounded-lg p-2 sm:p-3 ${loan.processingFeeAmount ? 'bg-green-50' : 'bg-orange-50'}`}>
                                <p className="text-xs text-gray-600 mb-1">Processing Fee</p>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <p className="font-semibold text-xs sm:text-sm">
                                    {loan.processingFeeAmount ? formatCurrency(Number(loan.processingFeeAmount)) : formatCurrency(Math.round(Number(loan.requestedAmount) * 0.045))}
                                  </p>
                                  {loan.status === "under_review" || loan.status === "approved" || loan.status === "fee_paid" || loan.status === "disbursed" ? (
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                                  ) : (
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                              <div className={`rounded-lg p-2 sm:p-3 ${loan.identityVerificationStatus === 'approved' ? 'bg-green-50' : 'bg-yellow-50'}`}>
                                <p className="text-xs text-gray-600 mb-1">ID Verification</p>
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <p className="font-semibold text-xs sm:text-sm capitalize">{loan.identityVerificationStatus || 'pending'}</p>
                                  {loan.identityVerificationStatus === 'approved' ? (
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                                  ) : loan.identityVerificationStatus === 'rejected' ? (
                                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-600 flex-shrink-0" />
                                  ) : (
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                              <div className={`rounded-lg p-2 sm:p-3 ${loan.status === 'disbursed' ? 'bg-green-50' : 'bg-gray-50'}`}>
                                <p className="text-xs text-gray-600 mb-1">Loan Status</p>
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm capitalize">
                                    {loan.status === 'pending' ? 'Payment Pending' : 
                                     loan.status === 'under_review' ? 'Under Review' : 
                                     loan.status === 'approved' ? 'Approved' :
                                     loan.status === 'fee_paid' ? 'Processing' :
                                     loan.status === 'disbursed' ? 'Disbursed' :
                                     loan.status}
                                  </p>
                                  {loan.status === 'disbursed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                                </div>
                              </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-semibold text-gray-700">Application Progress</span>
                                <span className="text-xs text-gray-600">
                                  {loan.status === 'pending' ? '25%' : 
                                   loan.status === 'under_review' ? '50%' : 
                                   loan.status === 'approved' ? '75%' :
                                   loan.status === 'disbursed' ? '100%' : '25%'}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                  className={`h-2.5 rounded-full transition-all duration-500 ${
                                    loan.status === 'disbursed' ? 'bg-green-600' : 
                                    loan.status === 'approved' ? 'bg-blue-600' : 
                                    'bg-orange-500'
                                  }`}
                                  style={{
                                    width: loan.status === 'pending' ? '25%' : 
                                           loan.status === 'under_review' ? '50%' : 
                                           loan.status === 'approved' ? '75%' :
                                           loan.status === 'disbursed' ? '100%' : '25%'
                                  }}
                                ></div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Application Date</p>
                                <p className="font-semibold text-gray-800">
                                  {formatDate(loan.createdAt)}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Reference Number</p>
                                <p className="font-semibold text-gray-800 font-mono">
                                  {loan.applicationReferenceNumber || `#${loan.id}`}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {/* Pending - Awaiting Admin Review */}
                            {loan.status === "pending" && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded p-1.5 sm:p-2 md:p-3 text-xs">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 flex-shrink-0" />
                                  <p className="font-semibold text-yellow-900">Under Review</p>
                                </div>
                              </div>
                            )}

                            {/* Approved - Ready to Pay Processing Fee */}
                            {loan.status === "approved" && (
                              <>
                                <div className="bg-orange-50 border border-orange-200 rounded p-1.5 sm:p-2 md:p-3 text-xs mb-2">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600 flex-shrink-0" />
                                    <p className="font-semibold text-orange-900">Pay Fee</p>
                                  </div>
                                </div>
                                <Link href={`/payment/${loan.applicationReferenceNumber}?amount=${(Number(loan.requestedAmount) * 0.045).toFixed(2)}`} className="inline-block w-full">
                                  <Button className="w-full bg-[#FFA500] hover:bg-[#FF8C00] text-white text-xs sm:text-sm h-8 sm:h-9 md:h-10">
                                    <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    Pay Fee
                                  </Button>
                                </Link>
                              </>
                            )}

                            {/* Fee Paid - Awaiting Disbursement */}
                            {loan.status === "fee_paid" && (
                              <>
                                <div className="bg-blue-50 border border-blue-200 rounded p-1.5 sm:p-2 text-xs mb-2">
                                  <div className="flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                                    <p className="font-semibold text-blue-900">Processing</p>
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Disbursed */}
                            {loan.status === "disbursed" && (
                              <div className="bg-green-50 border border-green-200 rounded p-1.5 sm:p-2 md:p-3 text-xs">
                                <div className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                                  <p className="font-semibold text-green-900">Funds Received!</p>
                                </div>
                              </div>
                            )}

                            {/* Rejected */}
                            {loan.status === "rejected" && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3 text-xs sm:text-sm text-red-800">
                                <p className="font-semibold flex items-center gap-2">
                                  <XCircle className="w-4 h-4 flex-shrink-0" />
                                  <span>Application Declined</span>
                                </p>
                                {loan.rejectionReason && (
                                  <p className="text-xs mt-1 line-clamp-2">{loan.rejectionReason}</p>
                                )}
                                <p className="text-xs mt-1 sm:mt-2">Contact support for details.</p>
                              </div>
                            )}

                            {/* View Details Button - Always Available */}
                            <Link href={`/application/${loan.id}`}>
                              <Button variant="outline" size="sm" className="w-full mt-2 text-xs sm:text-sm h-8 sm:h-9">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                <span className="hidden sm:inline">View</span> Details
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">No Applications Yet</h3>
                  <p className="text-gray-600 mb-6">
                    You haven't submitted any loan applications. Please contact support to apply.
                  </p>
                  <Link href="mailto:support@amerilendloan.com" className="inline-block">
                    <Button className="bg-[#0033A0] hover:bg-[#001F66] text-white px-8">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
            </TabsContent>

            {/* Referrals Tab */}
            <TabsContent value="referrals" className="mt-4">
              <ReferralComponent />
            </TabsContent>

            {/* Activity Timeline Tab */}
            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl text-[#0033A0] flex items-center gap-2">
                    <History className="w-6 h-6" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loans && loans.length > 0 ? (
                    <div className="space-y-4">
                      {loans
                        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 10)
                        .map((loan: any) => (
                          <div key={loan.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-[#0033A0] flex items-center justify-center flex-shrink-0 mt-1">
                              {loan.status === 'approved' || loan.status === 'disbursed' ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : loan.status === 'rejected' ? (
                                <XCircle className="w-5 h-5 text-white" />
                              ) : (
                                <Clock className="w-5 h-5 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-semibold text-gray-800">
                                  {loan.status === 'pending' && 'Application Submitted'}
                                  {loan.status === 'under_review' && 'Under Review'}
                                  {loan.status === 'approved' && 'Loan Approved! 🎉'}
                                  {loan.status === 'fee_pending' && 'Payment Required'}
                                  {loan.status === 'fee_paid' && 'Payment Confirmed'}
                                  {loan.status === 'disbursed' && 'Funds Disbursed'}
                                  {loan.status === 'rejected' && 'Application Declined'}
                                </h4>
                                <span className="text-sm text-gray-500 font-mono">
                                  {loan.applicationReferenceNumber || `#${loan.id}`}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {loan.loanType === 'installment' ? 'Installment' : 'Short-Term'} Loan - {formatCurrency(Number(loan.requestedAmount))}
                                {loan.approvedAmount && ` • Approved: ${formatCurrency(Number(loan.approvedAmount))}`}
                              </p>
                              {loan.status === 'approved' && (
                                <Link href={`/payment/${loan.applicationReferenceNumber}?amount=${(Number(loan.requestedAmount) * 0.045).toFixed(2)}`} className="inline-block mt-2">
                                  <SecondaryButton size="sm" className="bg-[#FFA500] hover:bg-[#FF8C00] text-white border-0">
                                    Complete Payment
                                  </SecondaryButton>
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                        <History className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600">No activity yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments" className="mt-4">
              <PaymentsTabContent />
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-4">
              <DocumentsTabContent />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-4">
              <SettingsTabContent />
            </TabsContent>

          </Tabs>

          {/* Help Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#0033A0] mb-2">Need Help?</h3>
                <p className="text-gray-700 mb-4">
                  Our Loan Advocates are here to help you every step of the way. Call us Monday-Friday, 8am-8pm EST.
                </p>
                <div className="flex flex-wrap gap-3">
                  <PrimaryButton asChild>
                    <a href="tel:945-212-1609">
                      <Phone className="w-4 h-4 mr-2" />
                      (945) 212-1609
                    </a>
                  </PrimaryButton>
                  <SecondaryButton asChild>
                    <Link href="/#faq">
                      View FAQs
                    </Link>
                  </SecondaryButton>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links & Resources */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Download className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-[#0033A0]">Download Documents</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Access your loan agreements and receipts
                </p>
                <SecondaryButton 
                  className="w-full"
                  onClick={() => {
                    const documentsTab = document.getElementById('documents-tab');
                    if (documentsTab) {
                      documentsTab.click();
                      documentsTab.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  View Documents
                </SecondaryButton>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-bold text-[#0033A0]">Loan Guides</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Learn about different loan types and options
                </p>
                <Link href="/loan-guides" className="inline-block w-full">
                  <SecondaryButton className="w-full">
                    <FileText className="w-4 h-4 mr-2" />
                    View Guides
                  </SecondaryButton>
                </Link>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-[#0033A0]">Help Center</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Get answers to frequently asked questions
                </p>
                <Link href="/#faq" className="inline-block w-full">
                  <SecondaryButton className="w-full">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Browse FAQs
                  </SecondaryButton>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 border-t border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center mb-4">
            <span className="text-lg font-semibold text-white">{APP_TITLE}</span>
          </div>
          <p className="text-sm text-gray-400 text-center">
            © 2025 {APP_TITLE} - U.S. Consumer Loan Platform. All rights reserved.
          </p>
        </div>
      </footer>

      {/* AI Support Chat Widget */}
      <AISupportChat 
        mode="floating" 
        loanApplicationId={loans?.[0]?.id}
      />
    </div>
  );
}

// Payments Tab Content Component
function PaymentsTabContent() {
  const { data: payments, isLoading } = trpc.payments.myPayments.useQuery();

  const downloadReceipt = (payment: any) => {
    const receiptText = `
=====================================
AMERILEND PAYMENT RECEIPT
=====================================

Receipt #: ${payment.transactionId || payment.id}
Date: ${new Date(payment.createdAt).toLocaleString('en-US')}

PAYMENT DETAILS
-------------------------------------
Loan Reference: ${payment.loanDetails?.applicationReferenceNumber || `#${payment.loanApplicationId}`}
Amount Paid: $${Number(payment.amount / 100).toFixed(2)}
Payment Method: ${payment.paymentMethod?.replace('_', ' ').toUpperCase()}
Status: ${payment.status.toUpperCase()}
Transaction ID: ${payment.transactionId || 'N/A'}

LOAN INFORMATION
-------------------------------------
Loan Type: ${payment.loanDetails?.loanType?.replace('_', ' ').toUpperCase() || 'N/A'}
${payment.loanDetails?.approvedAmount ? `Approved Amount: $${Number(payment.loanDetails.approvedAmount).toFixed(2)}` : ''}

=====================================
Thank you for your payment!
For questions, contact: (945) 212-1609
=====================================
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AmeriLend-Receipt-${payment.transactionId || payment.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Receipt downloaded successfully');
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-6 w-20 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                <div className="flex gap-2">
                  <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment History
        </CardTitle>
        <CardDescription>
          View all your payment transactions and download receipts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payments && payments.length > 0 ? (
          <div className="space-y-4">
            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto -mx-6 px-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-3 sm:px-4 font-semibold text-gray-700 text-sm">Date</th>
                    <th className="text-left py-4 px-3 sm:px-4 font-semibold text-gray-700 text-sm">Loan</th>
                    <th className="text-left py-4 px-3 sm:px-4 font-semibold text-gray-700 text-sm">Amount</th>
                    <th className="text-left py-4 px-3 sm:px-4 font-semibold text-gray-700 text-sm">Method</th>
                    <th className="text-left py-4 px-3 sm:px-4 font-semibold text-gray-700 text-sm">Status</th>
                    <th className="text-left py-4 px-3 sm:px-4 font-semibold text-gray-700 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment: any) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm">
                        {new Date(payment.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm">
                        {payment.loanDetails?.applicationReferenceNumber || `Loan #${payment.loanApplicationId}`}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold">
                        ${Number(payment.amount / 100).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm">
                        <Badge variant="outline" className="text-xs capitalize">
                          {payment.paymentMethod?.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm">
                        <Badge 
                          className={`text-xs ${
                            payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {payment.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm">
                        {payment.transactionId && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs sm:text-sm h-8 sm:h-9"
                            onClick={() => downloadReceipt(payment)}
                          >
                            <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            Receipt
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden space-y-3 sm:space-y-4">
              {payments.map((payment: any) => (
                <div key={payment.id} className="border rounded-lg p-3 sm:p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-sm sm:text-base">${Number(payment.amount / 100).toFixed(2)}</p>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        {payment.loanDetails?.applicationReferenceNumber || `Loan #${payment.loanApplicationId}`}
                      </p>
                    </div>
                    <Badge 
                      className={`text-xs sm:text-sm whitespace-nowrap ${
                        payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {payment.status}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                    <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                    <Badge variant="outline" className="text-xs sm:text-sm w-fit capitalize">
                      {payment.paymentMethod?.replace('_', ' ')}
                    </Badge>
                  </div>
                  {payment.transactionId && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs sm:text-sm h-9 sm:h-10"
                      onClick={() => downloadReceipt(payment)}
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Download Receipt
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">No payment history yet</p>
            <p className="text-sm text-gray-500 mt-2">Your payment transactions will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Documents Tab Content Component
function DocumentsTabContent() {
  const { data: loans } = trpc.loans.myApplications.useQuery();
  
  const generateLoanAgreement = (loan: any) => {
    const agreementText = `
=====================================
AMERILEND LOAN AGREEMENT
=====================================

Loan Reference: ${loan.applicationReferenceNumber}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Loan Status: ${loan.status?.toUpperCase()}

BORROWER INFORMATION
-------------------------------------
Loan Type: ${loan.loanType?.replace('_', ' ').toUpperCase() || 'N/A'}
Requested Amount: $${Number(loan.requestedAmount).toFixed(2)}
${loan.approvedAmount ? `Approved Amount: $${Number(loan.approvedAmount).toFixed(2)}` : ''}
Processing Fee (4.5%): $${(Number(loan.requestedAmount) * 0.045).toFixed(2)}

LOAN TERMS
-------------------------------------
Loan Type: ${loan.loanType === 'short_term' ? 'Short-Term Loan' : 'Installment Loan'}
${loan.loanType === 'installment' ? 'Term: 60 months (5 years)' : 'Term: 12 months'}
${loan.loanType === 'installment' ? 'APR: 12%' : 'APR: 10%'}

APPLICATION DETAILS
-------------------------------------
Application Date: ${new Date(loan.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
Reference Number: ${loan.applicationReferenceNumber}
Status: ${loan.status?.replace(/_/g, ' ').toUpperCase()}

IMPORTANT NOTICES
-------------------------------------
1. This is a binding legal agreement
2. All terms and conditions are subject to the borrower's acceptance
3. The borrower agrees to repay the loan amount plus applicable interest
4. Late payments may result in additional fees
5. Default may result in collection proceedings

TERMS AND CONDITIONS
-------------------------------------
By accepting this loan agreement, the borrower acknowledges:
- Receipt of all loan terms and conditions
- Understanding of the interest rate and payment schedule
- Responsibility for timely payment of all installments
- Authorization for AmeriLend to verify employment and financial information

For questions or concerns, contact:
Phone: (945) 212-1609
Hours: Monday-Friday, 8am-8pm EST

=====================================
Loan Agreement Generated: ${new Date().toLocaleString('en-US')}
=====================================
    `.trim();

    const blob = new Blob([agreementText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AmeriLend-Loan-Agreement-${loan.applicationReferenceNumber}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Loan agreement downloaded successfully');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          My Documents
        </CardTitle>
        <CardDescription>
          Access all your loan documents and agreements
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loans && loans.length > 0 ? (
          <div className="space-y-6">
            {loans.map((loan: any) => (
              <div key={loan.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">
                      {loan.loanType?.replace('_', ' ').toUpperCase()} Loan
                    </h3>
                    <p className="text-sm text-gray-600">
                      Ref: {loan.applicationReferenceNumber}
                    </p>
                  </div>
                  <Badge className={
                    loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                    loan.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    loan.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {loan.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {/* Loan Agreement */}
                  {(loan.status === 'approved' || loan.status === 'fee_paid' || loan.status === 'fee_pending' || loan.status === 'disbursed') && (
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Loan Agreement</p>
                          <p className="text-xs text-gray-500">PDF Document</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => generateLoanAgreement(loan)}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}

                  {/* Submitted Documents */}
                  {loan.hasSubmittedDocuments && (
                    <>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <div>
                            <p className="font-medium">ID Document</p>
                            <p className="text-xs text-gray-500">Your uploaded ID</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`/documents/${loan.id}/government_id`, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `/documents/${loan.id}/government_id`;
                              link.download = `ID-Document-${loan.applicationReferenceNumber}.jpg`;
                              link.click();
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium">Proof of Income</p>
                            <p className="text-xs text-gray-500">Your uploaded income proof</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`/documents/${loan.id}/proof_of_income`, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `/documents/${loan.id}/proof_of_income`;
                              link.download = `Income-Proof-${loan.applicationReferenceNumber}.jpg`;
                              link.click();
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          <div>
                            <p className="font-medium">Selfie Verification</p>
                            <p className="text-xs text-gray-500">Your identity verification photo</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => window.open(`/documents/${loan.id}/selfie`, '_blank')}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = `/documents/${loan.id}/selfie`;
                              link.download = `Selfie-Verification-${loan.applicationReferenceNumber}.jpg`;
                              link.click();
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">No documents yet</p>
            <p className="text-sm text-gray-500 mt-2">Apply for a loan to see your documents here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Settings Tab Content Component
function SettingsTabContent() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [phone, setPhone] = useState(user?.phone || '');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Fetch preferences
  const { data: preferences, isLoading: prefsLoading } = trpc.profile.getPreferences.useQuery();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Update local state when preferences load
  useEffect(() => {
    if (preferences) {
      setEmailNotifications(preferences.emailNotifications);
      setSmsNotifications(preferences.smsNotifications);
      setMarketingEmails(preferences.marketingEmails);
    }
  }, [preferences]);

  // Mutations
  const updatePhoneMutation = trpc.profile.updatePhone.useMutation({
    onSuccess: () => {
      toast.success("Phone number updated successfully");
      utils.profile.getPreferences.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update phone number");
    }
  });

  const updatePreferencesMutation = trpc.profile.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success("Preferences saved successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save preferences");
    }
  });

  const changePasswordMutation = trpc.profile.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed successfully");
      setShowPasswordDialog(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    }
  });

  const handlePhoneUpdate = () => {
    if (!phone) {
      toast.error("Please enter a phone number");
      return;
    }
    
    // Remove all non-digit characters for validation
    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast.error("Phone number must contain at least 10 digits");
      return;
    }
    
    if (phone !== user?.phone) {
      updatePhoneMutation.mutate({ phone });
    }
  };

  const handlePreferenceChange = (pref: 'email' | 'sms' | 'marketing', value: boolean) => {
    if (pref === 'email') setEmailNotifications(value);
    if (pref === 'sms') setSmsNotifications(value);
    if (pref === 'marketing') setMarketingEmails(value);

    // Save immediately
    updatePreferencesMutation.mutate({
      emailNotifications: pref === 'email' ? value : emailNotifications,
      smsNotifications: pref === 'sms' ? value : smsNotifications,
      marketingEmails: pref === 'marketing' ? value : marketingEmails,
    });
  };

  const handlePasswordChange = () => {
    // Validation
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    
    if (!newPassword) {
      toast.error("Please enter a new password");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    changePasswordMutation.mutate({ currentPassword, newPassword });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Account Settings
        </CardTitle>
        <CardDescription>
          Manage your profile and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Information */}
        <div>
          <h3 className="font-semibold text-lg mb-4">Profile Information</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email Address</Label>
                <Input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled 
                  className="bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contact support to change your email
                </p>
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(555) 123-4567"
                />
                <Button 
                  variant="link" 
                  size="sm" 
                  className="px-0 mt-1"
                  onClick={handlePhoneUpdate}
                  disabled={!phone || phone === user?.phone || updatePhoneMutation.isPending}
                >
                  {updatePhoneMutation.isPending ? 'Updating...' : 'Update Phone'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">Security</h3>
          <div className="space-y-4">
            <div>
              <Label>Password</Label>
              <div className="flex gap-2">
                <Input type="password" value="••••••••" disabled className="bg-gray-50" />
                <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                  <Shield className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">Notifications</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-500">Receive updates about your applications</p>
              </div>
              <input 
                type="checkbox" 
                checked={emailNotifications}
                onChange={(e) => handlePreferenceChange('email', e.target.checked)}
                className="w-5 h-5" 
                aria-label="Enable email notifications" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-500">Get text messages for important updates</p>
              </div>
              <input 
                type="checkbox" 
                checked={smsNotifications}
                onChange={(e) => handlePreferenceChange('sms', e.target.checked)}
                className="w-5 h-5" 
                aria-label="Enable SMS notifications" 
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Communications</p>
                <p className="text-sm text-gray-500">Receive offers and promotions</p>
              </div>
              <input 
                type="checkbox" 
                checked={marketingEmails}
                onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                className="w-5 h-5" 
                aria-label="Enable marketing communications" 
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold text-lg mb-4">Payment Methods</h3>
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">Available Payment Methods:</span>
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                <li>Credit/Debit Cards (Visa, Mastercard, American Express)</li>
                <li>Bank Transfer (ACH)</li>
                <li>Cryptocurrency (Bitcoin, Ethereum)</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                Payment methods are managed securely during the checkout process. No payment information is stored permanently.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <Button variant="destructive" className="w-full md:w-auto">
            Delete Account
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            This action cannot be undone. All your data will be permanently deleted.
          </p>
        </div>
      </CardContent>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePasswordChange}
              disabled={!currentPassword || !newPassword || !confirmPassword || changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? 'Changing...' : 'Change Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// Repayment Schedule Component
function RepaymentSchedule({ 
  approvedAmount, 
  processingFee, 
  loanType 
}: { 
  approvedAmount: number; 
  processingFee: number; 
  loanType: string;
}) {
  // Calculate loan terms based on type
  const getLoanTerms = () => {
    const totalAmount = approvedAmount + processingFee;
    
    switch (loanType) {
      case 'short_term':
        return { months: 1, rate: 0.15 }; // 15% for 1 month
      case 'installment':
      case 'personal':
        return { months: 12, rate: 0.10 }; // 10% APR for 12 months
      case 'auto':
        return { months: 60, rate: 0.08 }; // 8% APR for 60 months
      case 'home_equity':
      case 'heloc':
      case 'mortgage':
        return { months: 360, rate: 0.06 }; // 6% APR for 30 years
      case 'student':
        return { months: 120, rate: 0.05 }; // 5% APR for 10 years
      case 'business':
        return { months: 60, rate: 0.12 }; // 12% APR for 5 years
      default:
        return { months: 12, rate: 0.10 }; // Default: 10% APR for 12 months
    }
  };

  const { months, rate } = getLoanTerms();
  const monthlyRate = rate / 12;
  
  // Calculate monthly payment using amortization formula
  const totalAmount = approvedAmount + processingFee;
  const monthlyPayment = totalAmount * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  
  const totalInterest = (monthlyPayment * months) - totalAmount;

  // Generate schedule for first 6 months or total months if less than 6
  const scheduleMonths = Math.min(6, months);
  const today = new Date();
  
  let remainingBalance = totalAmount;
  const schedule = [];
  
  for (let i = 1; i <= scheduleMonths; i++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;
    
    const paymentDate = new Date(today);
    paymentDate.setMonth(paymentDate.getMonth() + i);
    
    schedule.push({
      month: i,
      date: paymentDate,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: remainingBalance > 0 ? remainingBalance : 0
    });
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-gray-600 text-xs">Monthly Payment</p>
          <p className="font-bold text-blue-900">${monthlyPayment.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-gray-600 text-xs">Term</p>
          <p className="font-bold text-blue-900">{months} months</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-gray-600 text-xs">Interest Rate</p>
          <p className="font-bold text-blue-900">{(rate * 100).toFixed(1)}% APR</p>
        </div>
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <p className="text-gray-600 text-xs">Total Interest</p>
          <p className="font-bold text-blue-900">${totalInterest.toFixed(2)}</p>
        </div>
      </div>

      {/* Payment Schedule Table */}
      <div className="bg-white rounded-lg border border-blue-100 overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full text-sm">
            <thead className="bg-blue-100 text-blue-900">
              <tr>
                <th className="px-3 py-2 text-left">Payment #</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-right">Payment</th>
                <th className="px-3 py-2 text-right">Principal</th>
                <th className="px-3 py-2 text-right">Interest</th>
                <th className="px-3 py-2 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {schedule.map((payment) => (
                <tr key={payment.month} className="border-b border-blue-50 hover:bg-blue-50">
                  <td className="px-3 py-2">{payment.month}</td>
                  <td className="px-3 py-2">
                    {payment.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold">${payment.payment.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-green-700">${payment.principal.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right text-orange-700">${payment.interest.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-semibold">${payment.balance.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden space-y-2 p-3">
          {schedule.map((payment) => (
            <div key={payment.month} className="border-b border-blue-100 pb-2 last:border-0">
              <div className="flex justify-between items-center mb-1">
                <span className="font-semibold text-blue-900">Payment #{payment.month}</span>
                <span className="text-sm text-gray-600">
                  {payment.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Payment: </span>
                  <span className="font-semibold">${payment.payment.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Balance: </span>
                  <span className="font-semibold">${payment.balance.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Principal: </span>
                  <span className="text-green-700">${payment.principal.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Interest: </span>
                  <span className="text-orange-700">${payment.interest.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {months > 6 && (
        <p className="text-xs text-gray-600 text-center">
          Showing first {scheduleMonths} of {months} payments
        </p>
      )}
    </div>
  );
}
