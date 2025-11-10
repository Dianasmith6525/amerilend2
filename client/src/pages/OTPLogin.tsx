import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { httpBatchLink, createTRPCProxyClient } from "@trpc/client";
import { Loader2, Mail, KeyRound, Lock, ArrowLeft } from "lucide-react";
import superjson from "superjson";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

// Social login providers
const SOCIAL_PROVIDERS = [
  {
    name: "Google",
    icon: (
      <img 
        src="https://www.google.com/favicon.ico" 
        alt="Google" 
        className="w-5 h-5"
        onError={(e) => {
          e.currentTarget.src = "https://cdn.cdnlogo.com/logos/g/35/google-icon.svg";
        }}
      />
    ),
    color: "hover:bg-gray-50 border-gray-200"
  },
  {
    name: "Facebook",
    icon: (
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/b/b9/2023_Facebook_icon.svg" 
        alt="Facebook" 
        className="w-5 h-5"
        onError={(e) => {
          e.currentTarget.src = "https://cdn.cdnlogo.com/logos/f/84/facebook.svg";
        }}
      />
    ),
    color: "hover:bg-blue-50 border-gray-200"
  },
  {
    name: "Apple",
    icon: (
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" 
        alt="Apple" 
        className="w-5 h-5"
        onError={(e) => {
          e.currentTarget.src = "https://cdn.cdnlogo.com/logos/a/19/apple.svg";
        }}
      />
    ),
    color: "hover:bg-gray-50 border-gray-200"
  },
  {
    name: "Microsoft",
    icon: (
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
        alt="Microsoft" 
        className="w-5 h-5"
        onError={(e) => {
          e.currentTarget.src = "https://cdn.cdnlogo.com/logos/m/8/microsoft.svg";
        }}
      />
    ),
    color: "hover:bg-gray-50 border-gray-200"
  }
];

export default function OTPLogin() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"email" | "code" | "forgot" | "reset">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loginMethod, setLoginMethod] = useState<"password" | "otp">("password");
  const [isLoginView, setIsLoginView] = useState(true); // Track which form is visible
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // State for Google OAuth
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Handle swipe gestures for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setTouchEnd(e.changedTouches[0].clientX);
    handleSwipe();
  };

  const handleSwipe = () => {
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && isLoginView) {
      // Swipe left: show signup
      setIsLoginView(false);
    } else if (isRightSwipe && !isLoginView) {
      // Swipe right: show login
      setIsLoginView(true);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    const providerMap: { [key: string]: string } = {
      Google: "google",
      Facebook: "facebook",
      Apple: "apple",
      Microsoft: "microsoft",
    };

    const providerKey = providerMap[provider];
    if (!providerKey) {
      toast.error(`Unknown provider: ${provider}`);
      return;
    }

    setIsGoogleLoading(true);
    try {
      console.log(`Starting ${provider} OAuth flow...`);

      // Get OAuth URL from backend
      let authUrl: string | undefined;

      if (provider === "Google") {
        const trpcClient = createTRPCProxyClient({
          links: [
            httpBatchLink({
              url: "/api/trpc",
              transformer: superjson,
              fetch(input, init) {
                return globalThis.fetch(input, {
                  ...(init ?? {}),
                  credentials: "include",
                });
              },
            }),
          ],
        });

        const result = await trpcClient.googleAuth.getAuthUrl.query();
        authUrl = result?.url;
      } else {
        // For Facebook, Apple, Microsoft - use direct backend endpoints
        const response = await fetch(`/api/auth/${providerKey}/url`);
        if (response.ok) {
          const data = await response.json();
          authUrl = data.url;
        }
      }

      if (authUrl) {
        console.log(`Redirecting to ${provider} OAuth:`, authUrl);
        window.location.href = authUrl;
      } else {
        console.error(`No URL returned from backend for ${provider}`);
        toast.error(`Failed to initialize ${provider} login`);
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`Failed to initialize ${provider} login`);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const passwordLoginMutation = trpc.password.login.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Welcome back, ${data.user?.email?.split('@')[0] || 'User'}!`, {
        description: 'Redirecting to your dashboard...',
        duration: 2000,
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    },
    onError: (error) => {
      toast.error("❌ Login Failed", {
        description: error.message || "Invalid email or password",
        duration: 4000,
      });
    },
  });

  const requestCodeMutation = trpc.otp.requestCode.useMutation({
    onSuccess: () => {
      toast.success("Verification code sent to your email");
      setStep("code");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send code");
    },
  });

  const verifyCodeMutation = trpc.otp.verifyCode.useMutation({
    onSuccess: (data) => {
      toast.success(`✅ Welcome, ${data.user?.email?.split('@')[0] || 'User'}!`, {
        description: 'Your email has been verified. Redirecting...',
        duration: 2000,
      });
      // Reload to refresh auth state, then redirect to dashboard
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    },
    onError: (error) => {
      toast.error("❌ Verification Failed", {
        description: error.message || "Invalid code",
        duration: 4000,
      });
    },
  });

  const requestPasswordResetMutation = trpc.password.requestPasswordReset.useMutation({
    onSuccess: () => {
      toast.success("Reset code sent to your email");
      setStep("reset");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send reset code");
    },
  });

  const resetPasswordMutation = trpc.password.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("✅ Password Reset Successfully!", {
        description: "Your password has been updated. Please login with your new password.",
        duration: 3000,
      });
      setStep("email");
      setResetCode("");
      setNewPassword("");
      setConfirmNewPassword("");
      setLoginMethod("password");
    },
    onError: (error) => {
      toast.error("❌ Password Reset Failed", {
        description: error.message || "Failed to reset password",
        duration: 4000,
      });
    },
  });

  const handlePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter your email and password");
      return;
    }
    passwordLoginMutation.mutate({ email, password });
  };

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    requestCodeMutation.mutate({
      email,
      purpose: "login",
    });
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    verifyCodeMutation.mutate({
      email,
      code,
      purpose: "login",
    });
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }
    requestPasswordResetMutation.mutate({ email });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetCode.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error("Passwords do not match");
      return;
    }
    resetPasswordMutation.mutate({
      email,
      code: resetCode,
      newPassword,
    });
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Back to Home Button */}
      <Link href="/">
        <button className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-[#0033A0] hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back Home</span>
        </button>
      </Link>

      <div className="w-full max-w-5xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl font-bold mb-2"><span className="text-blue-600">Ameri</span><span className="text-yellow-600">Lend</span></h1>
          <p className="text-muted-foreground text-lg">Fast, Simple, Secure Lending</p>
        </div>

        {/* Slider Container with overflow hidden for animation */}
        <div className="relative overflow-hidden rounded-lg">
          <style>{`
            @keyframes slideInFromLeft {
              from { opacity: 0; transform: translateX(-100%); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideOutToRight {
              from { opacity: 1; transform: translateX(0); }
              to { opacity: 0; transform: translateX(100%); }
            }
            @keyframes slideInFromRight {
              from { opacity: 0; transform: translateX(100%); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideOutToLeft {
              from { opacity: 1; transform: translateX(0); }
              to { opacity: 0; transform: translateX(-100%); }
            }
            .slide-in-left { animation: slideInFromLeft 0.5s ease-out forwards; }
            .slide-out-right { animation: slideOutToRight 0.5s ease-out forwards; }
            .slide-in-right { animation: slideInFromRight 0.5s ease-out forwards; }
            .slide-out-left { animation: slideOutToLeft 0.5s ease-out forwards; }
          `}</style>

          {/* Login Card - slides in from left when isLoginView is true */}
          {isLoginView && (
            <div className="slide-in-left w-full mx-auto">
              <Card className="flex flex-col h-full">
                <CardHeader className="pb-6 pt-8 px-8">
                  <CardTitle className="text-3xl font-bold">Login</CardTitle>
                  <CardDescription className="text-base mt-2">Welcome back to your account</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 px-8 py-6">
              {step === "email" ? (
                <>
                  <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as "password" | "otp")} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8">
                      <TabsTrigger value="password" className="py-2">Password</TabsTrigger>
                      <TabsTrigger value="otp" className="py-2">Email Code</TabsTrigger>
                    </TabsList>

                    <TabsContent value="password">
                      <form onSubmit={handlePasswordLogin} className="space-y-7 mt-6">
                        <div className="space-y-3">
                          <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 h-12 text-base"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="password" className="text-base font-semibold">Password</Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="password"
                              type="password"
                              placeholder="Enter your password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="pl-10 h-12 text-base"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setStep("forgot")}
                            className="text-sm text-[#0033A0] hover:underline font-medium"
                          >
                            Forgot password?
                          </button>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-semibold bg-[#0033A0] hover:bg-[#002080]"
                          disabled={passwordLoginMutation.isPending}
                        >
                          {passwordLoginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Logging in...
                            </>
                          ) : (
                            "Log In"
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="otp">
                      <form onSubmit={handleRequestCode} className="space-y-7 mt-6">
                        <div className="space-y-3">
                          <Label htmlFor="email-otp" className="text-base font-semibold">Email Address</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email-otp"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 h-12 text-base"
                              required
                            />
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full h-12 text-base font-semibold bg-[#0033A0] hover:bg-[#002080]"
                          disabled={requestCodeMutation.isPending}
                        >
                          {requestCodeMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending Code...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Verification Code
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>

                  <div className="relative my-6">
                    <Separator />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
                      Or continue with
                    </span>
                  </div>

                  <div className="space-y-3">
                    {SOCIAL_PROVIDERS.map((provider) => (
                      <Button
                        key={provider.name}
                        type="button"
                        variant="outline"
                        className={`w-full h-10 ${provider.color}`}
                        onClick={() => handleSocialLogin(provider.name)}
                        disabled={provider.name === "Google" && isGoogleLoading}
                      >
                        {provider.name === "Google" && isGoogleLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <span className="mr-2">{provider.icon}</span>
                            {provider.name}
                          </>
                        )}
                      </Button>
                    ))}
                  </div>
                </>
              ) : step === "code" ? (
                <form onSubmit={handleVerifyCode} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="code" className="text-base">Verification Code</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      We sent a code to {email}
                    </p>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="code"
                        type="text"
                        placeholder="000000"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="pl-10 text-center text-2xl tracking-widest font-mono h-10"
                        maxLength={6}
                        required
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Expires in 10 minutes
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 text-base bg-[#0033A0] hover:bg-[#002080]"
                    disabled={verifyCodeMutation.isPending}
                  >
                    {verifyCodeMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Login"
                    )}
                  </Button>

                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setStep("email")}
                    >
                      Use Different Email
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => requestCodeMutation.mutate({ email, purpose: "login" })}
                      disabled={requestCodeMutation.isPending}
                    >
                      Resend Code
                    </Button>
                  </div>
                </form>
              ) : step === "forgot" ? (
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("email")}
                    className="mb-4"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to login
                  </Button>

                  <div className="space-y-3">
                    <Label htmlFor="forgot-email" className="text-base">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-10"
                        required
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      We'll send you a code to reset your password
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 text-base bg-[#0033A0] hover:bg-[#002080]"
                    disabled={requestPasswordResetMutation.isPending}
                  >
                    {requestPasswordResetMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Code"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep("forgot")}
                    className="mb-4"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800">
                      Check your email for the 6-digit reset code
                    </p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="reset-code" className="text-base">Reset Code</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="reset-code"
                        type="text"
                        placeholder="000000"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        className="pl-10 text-center text-2xl tracking-widest font-mono h-10"
                        maxLength={6}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="new-password" className="text-base">New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Min. 8 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="pl-10 h-10"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="confirm-password" className="text-base">Confirm New Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Re-enter password"
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        className="pl-10 h-10"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10 text-base bg-[#0033A0] hover:bg-[#002080]"
                    disabled={resetPasswordMutation.isPending}
                  >
                    {resetPasswordMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => requestPasswordResetMutation.mutate({ email })}
                    disabled={requestPasswordResetMutation.isPending}
                  >
                    Resend Reset Code
                  </Button>
                </form>
              )}

              <div className="mt-8 pt-6 border-t text-center text-sm">
                <p className="text-muted-foreground">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLoginView(false)}
                    className="text-[#0033A0] hover:underline cursor-pointer font-semibold"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
            </div>
          )}

          {/* Signup Card - slides in from right when isLoginView is false */}
          {!isLoginView && (
            <div className="slide-in-right w-full mx-auto">
          <Card className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-6 pt-8 px-8">
              <CardTitle className="text-3xl font-bold">Sign Up</CardTitle>
              <CardDescription className="text-base mt-2">Create your account to get started</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col px-8 py-6">
              <form className="space-y-7 flex-1">
                <div className="space-y-3">
                  <Label htmlFor="signup-email" className="text-base font-semibold">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 h-12 text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="signup-password" className="text-base font-semibold">Create Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Min. 8 characters"
                      className="pl-10 h-12 text-base"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="confirm-signup-password" className="text-base font-semibold">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-signup-password"
                      type="password"
                      placeholder="Re-enter password"
                      className="pl-10 h-12 text-base"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold bg-[#0033A0] hover:bg-[#002080]"
                >
                  Create Account
                </Button>
              </form>

              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-50 to-indigo-50 px-2 text-xs text-muted-foreground">
                  Or
                </span>
              </div>

              <div className="space-y-3 mb-6">
                {SOCIAL_PROVIDERS.map((provider) => (
                  <Button
                    key={provider.name}
                    type="button"
                    variant="outline"
                    className={`w-full h-10 ${provider.color}`}
                    onClick={() => handleSocialLogin(provider.name)}
                  >
                    <span className="mr-2">{provider.icon}</span>
                    {provider.name}
                  </Button>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t text-center text-sm">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsLoginView(true)}
                    className="text-[#0033A0] hover:underline cursor-pointer font-semibold"
                  >
                    Log in
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
            </div>
          )}
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-4 justify-center mt-8 mb-6">
          <Button
            variant={isLoginView ? "default" : "outline"}
            className={`px-8 h-10 ${isLoginView ? 'bg-[#0033A0] hover:bg-[#002080]' : ''}`}
            onClick={() => setIsLoginView(true)}
          >
            Login
          </Button>
          <Button
            variant={!isLoginView ? "default" : "outline"}
            className={`px-8 h-10 ${!isLoginView ? 'bg-[#0033A0] hover:bg-[#002080]' : ''}`}
            onClick={() => setIsLoginView(false)}
          >
            Sign Up
          </Button>
        </div>

        {/* Terms and Privacy */}
        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link href="/legal/terms_of_service">
            <span className="text-[#0033A0] hover:underline cursor-pointer">Terms of Service</span>
          </Link>
          {" "}and{" "}
          <Link href="/legal/privacy_policy">
            <span className="text-[#0033A0] hover:underline cursor-pointer">Privacy Policy</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
