import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { CookieConsent } from "./components/CookieConsent";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import ApplyLoan from "./pages/ApplyLoan";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PaymentPage from "./pages/PaymentPage";
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
import UserProfile from "./pages/UserProfile";
import PreQualification from "./pages/PreQualification";
import GoogleCallback from "./pages/GoogleCallback";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/apply"} component={ApplyLoan} />
      <Route path={"/pre-qualify"} component={PreQualification} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/admin"} component={AdminDashboard} />
      <Route path={"/payment/:id"} component={AuthorizeNetPayment} />
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
      <Route path={"/profile"} component={UserProfile} />
      <Route path={"/404"} component={NotFound} />
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
