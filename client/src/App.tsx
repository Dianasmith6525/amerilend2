import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import ServerError from "@/pages/ServerError";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { CookieConsent } from "./components/CookieConsent";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import IdentityVerificationHub from "./pages/IdentityVerificationHub";
import PaymentPage from "./pages/PaymentPage";
import DisbursementPage from "./pages/DisbursementPage";
import DocumentUploadPage from "./pages/DocumentUploadPage";
import OTPLogin from "./pages/OTPLogin";
import OTPSignup from "./pages/OTPSignup";
import LegalDocument from "./pages/LegalDocument";
import AuthorizeNetPayment from "./pages/AuthorizeNetPayment";
import StripePayment from "./pages/StripePayment";
import EnhancedPaymentPage from "./pages/EnhancedPaymentPage";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CaliforniaPrivacy from "./pages/CaliforniaPrivacy";
import AboutUs from "./pages/AboutUs";
import FAQ from "./pages/FAQ";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import LoanGuides from "./pages/LoanGuides";
import LoanGuideDetail from "./pages/LoanGuideDetail";
import UserProfile from "./pages/UserProfile";
import PreQualification from "./pages/PreQualification";
import Apply from "./pages/Apply";
import LoanApplicationForm from "./pages/LoanApplicationForm";
import GoogleCallback from "./pages/GoogleCallback";
import StatusCheck from "./pages/StatusCheck";
import LoanApplicationDetail from "./pages/LoanApplicationDetail";
import UserApplications from "./pages/UserApplications";
import VerifyEmail from "./pages/VerifyEmail";
import VerifyEmailSignup from "./pages/VerifyEmailSignup";
import Contact from "./pages/Contact";
import ForgotPassword from "./pages/ForgotPassword";
import Support from "./pages/Support";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/apply"} component={Apply} />
      <Route path={"/loan-application"} component={LoanApplicationForm} />
      <Route path={"/pre-qualify"} component={PreQualification} />
      <Route path={"/check-status"} component={StatusCheck} />
      <Route path={"/verify-email"} component={VerifyEmailSignup} />
      <Route path={"/verify-email/:token"} component={VerifyEmail} />
      <Route path={"/application/:id"} component={LoanApplicationDetail} />
      <Route path={"/admin"} component={Dashboard} />
      <Route path={"/admin/applications"} component={UserApplications} />
      <Route path={"/admin/*"} component={Dashboard} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/dashboard/identity-verification"} component={IdentityVerificationHub} />
      <Route path={"/payment/:id"} component={StripePayment} />
      <Route path={"/verify-identity/:id"} component={DocumentUploadPage} />
      <Route path={"/disbursement/:id"} component={DisbursementPage} />
      <Route path={"/stripe-payment/:id"} component={StripePayment} />
      <Route path={"/login"} component={OTPLogin} />
      <Route path={"/signup"} component={OTPSignup} />
      <Route path={"/auth/google/callback"} component={GoogleCallback} />
      <Route path={"/legal/:type"} component={LegalDocument} />
      <Route path={"/otp-login"} component={OTPLogin} />
      <Route path={"/payment-enhanced/:id"} component={EnhancedPaymentPage} />
      <Route path={"/terms-of-use"} component={TermsOfUse} />
      <Route path={"/privacy-policy"} component={PrivacyPolicy} />
      <Route path={"/california-privacy"} component={CaliforniaPrivacy} />
      <Route path={"/about-us"} component={AboutUs} />
      <Route path={"/faq"} component={FAQ} />
      <Route path={"/blog"} component={Blog} />
      <Route path={"/blog/:slug"} component={BlogPost} />
      <Route path={"/loan-guides"} component={LoanGuides} />
      <Route path={"/loan-guides/:guideId"} component={LoanGuideDetail} />
      <Route path={"/profile"} component={UserProfile} />
      <Route path={"/forgot-password"} component={ForgotPassword} />
      <Route path={"/contact"} component={Contact} />
      <Route path={"/support"} component={Support} />
      <Route path={"/404"} component={NotFound} />
      <Route path={"/500"} component={ServerError} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
          <CookieConsent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
