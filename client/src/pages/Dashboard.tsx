import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { CodeButton } from "@/components/ui/CodeButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
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
} from "lucide-react";
import { FullPageLoader } from "@/components/ui/loader";
import { Link } from "wouter";
import { AISupportChat } from "@/components/AISupportChat";
import { ReferralComponent } from "@/components/ReferralComponent";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { user, isAuthenticated, logout, loading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: "/login"
  });
  const { data: loans, isLoading } = trpc.loans.myApplications.useQuery(undefined, {
    enabled: isAuthenticated,
  });

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

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  if (loading) {
    return <FullPageLoader text="Loading your dashboard..." />;
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
          <Card className="max-w-md w-full mx-4">
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
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
          {/* Account Overview Statistics */}
          <div className="grid md:grid-cols-4 gap-4 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Total Requested</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {formatCurrency(
                        loans?.reduce((sum: number, loan: any) => sum + loan.requestedAmount, 0) || 0
                      )}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Approved Loans</p>
                    <p className="text-2xl font-bold text-green-600">
                      {loans?.filter((l: any) => l.status === 'approved' || l.status === 'fee_pending' || l.status === 'fee_paid' || l.status === 'disbursed').length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Pending Review</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {loans?.filter((l: any) => l.status === 'pending' || l.status === 'under_review').length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">This Month</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {loans?.filter((l: any) => {
                        const loanDate = new Date(l.createdAt);
                        const now = new Date();
                        return loanDate.getMonth() === now.getMonth() && 
                               loanDate.getFullYear() === now.getFullYear();
                      }).length || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
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
                          <Link key={loan.id} href={`/payment/${loan.id}`} className="inline-block">
                            <Button size="sm" className="bg-[#FFA500] hover:bg-[#FF8C00] text-white">
                              Pay Loan #{loan.id}
                            </Button>
                          </Link>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-[#0033A0] mb-1">New Application</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Start a new loan application
                    </p>
                    <Link href="/apply" className="inline-block w-full">
                      <CodeButton className="w-full" icon={<ArrowRight />}>
                        Apply Now
                      </CodeButton>
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

          {/* Tabs for Applications and Referrals */}
          <Tabs defaultValue="applications" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gray-100">
              <TabsTrigger value="applications" className="data-[state=active]:bg-white">
                <FileText className="w-4 h-4 mr-2" />
                My Applications
              </TabsTrigger>
              <TabsTrigger value="referrals" className="data-[state=active]:bg-white">
                <Share2 className="w-4 h-4 mr-2" />
                Referrals
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-white">
                <History className="w-4 h-4 mr-2" />
                Activity
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
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-4 border-[#0033A0] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 mt-4">Loading your applications...</p>
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
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-gray-800">
                                {loan.loanType === "installment" ? "Installment Loan" : "Short-Term Loan"}
                              </h3>
                              {getStatusBadge(loan.status)}
                            </div>
                            <div className="grid md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500">Requested Amount</p>
                                <p className="font-semibold text-gray-800">
                                  {formatCurrency(loan.requestedAmount)}
                                </p>
                              </div>
                              {loan.approvedAmount && (
                                <div className="animate-fade-in">
                                  <p className="text-gray-500 flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-yellow-500" />
                                    Approved Amount
                                  </p>
                                  <p className="font-bold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-green-700">
                                    {formatCurrency(loan.approvedAmount)}
                                  </p>
                                </div>
                              )}
                              <div>
                                <p className="text-gray-500">Application Date</p>
                                <p className="font-semibold text-gray-800">
                                  {formatDate(loan.createdAt)}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            {loan.status === "approved" && (
                              <>
                                <div className="bg-gradient-to-br from-green-100 to-green-50 border-2 border-green-300 rounded-xl p-4 text-sm text-green-800 mb-2 animate-bounce-in shadow-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                                      <PartyPopper className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="font-bold text-lg">Congratulations!</p>
                                  </div>
                                  <p className="font-semibold">🎉 Your loan has been approved!</p>
                                  <p className="text-xs mt-1 text-green-700">Complete the payment to receive your funds.</p>
                                </div>
                                <Link href={`/payment/${loan.id}`} className="inline-block w-full">
                                  <Button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white w-full">
                                    Pay Processing Fee
                                  </Button>
                                </Link>
                              </>
                            )}
                            {loan.status === "fee_paid" && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                                <p className="font-semibold">Payment Confirmed</p>
                                <p>Your loan is being processed.</p>
                              </div>
                            )}
                            {loan.status === "disbursed" && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
                                <p className="font-semibold">Funds Disbursed</p>
                                <p>Check your bank account.</p>
                              </div>
                            )}
                            {loan.status === "rejected" && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                                <p className="font-semibold">Not Approved</p>
                                <p>Contact us for details.</p>
                              </div>
                            )}
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
                    You haven't submitted any loan applications. Ready to get started?
                  </p>
                  <Link href="/apply" className="inline-block">
                    <Button className="bg-[#FFA500] hover:bg-[#FF8C00] text-white px-8">
                      Apply for a Loan
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
                                <span className="text-sm text-gray-500">
                                  {formatDate(loan.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">
                                {loan.loanType === 'installment' ? 'Installment' : 'Short-Term'} Loan - {formatCurrency(loan.requestedAmount)}
                                {loan.approvedAmount && ` • Approved: ${formatCurrency(loan.approvedAmount)}`}
                              </p>
                              {loan.status === 'approved' && (
                                <Link href={`/payment/${loan.id}`} className="inline-block mt-2">
                                  <Button size="sm" className="bg-[#FFA500] hover:bg-[#FF8C00] text-white">
                                    Complete Payment
                                  </Button>
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
                  <Button
                    className="bg-[#FFA500] hover:bg-[#FF8C00] text-white"
                    asChild
                  >
                    <a href="tel:945-212-1609">
                      <Phone className="w-4 h-4 mr-2" />
                      (945) 212-1609
                    </a>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#0033A0] text-[#0033A0]"
                    asChild
                  >
                    <Link href="/#faq">
                      View FAQs
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links & Resources */}
          <div className="mt-8 grid md:grid-cols-3 gap-6">
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
                <Button variant="outline" className="w-full border-[#0033A0] text-[#0033A0]">
                  <Download className="w-4 h-4 mr-2" />
                  View Documents
                </Button>
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
                  <Button variant="outline" className="w-full border-[#0033A0] text-[#0033A0]">
                    <FileText className="w-4 h-4 mr-2" />
                    View Guides
                  </Button>
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
                  <Button variant="outline" className="w-full border-[#0033A0] text-[#0033A0]">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Browse FAQs
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">
            © 2025 AmeriLend - U.S. Consumer Loan Platform. All rights reserved.
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
