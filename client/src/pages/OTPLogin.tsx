import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { APP_LOGO, APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import { Loader2, Mail, KeyRound, Lock, ArrowLeft } from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";

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

  // Query to get Google Auth URL
  const { data: googleAuthData } = trpc.googleAuth.getAuthUrl.useQuery(undefined, {
    enabled: false, // Only fetch when needed
  });

  const handleSocialLogin = async (provider: string) => {
    if (provider === "Google") {
      try {
        // Get Google OAuth URL from backend
        const result = await trpc.googleAuth.getAuthUrl.query();
        if (result?.url) {
          // Redirect to Google OAuth page
          window.location.href = result.url;
        } else {
          toast.error("Failed to initialize Google login");
        }
      } catch (error) {
        console.error("Google login error:", error);
        toast.error("Failed to initialize Google login");
      }
    } else {
      toast.info(`${provider} login coming soon!`);
    }
  };

  const passwordLoginMutation = trpc.password.login.useMutation({
    onSuccess: () => {
      toast.success("Login successful!");
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error(error.message || "Invalid email or password");
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
    onSuccess: () => {
      toast.success("Login successful!");
      // Reload to refresh auth state, then redirect to dashboard
      window.location.href = "/dashboard";
    },
    onError: (error) => {
      toast.error(error.message || "Invalid code");
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
      toast.success("Password reset successful! Please login with your new password.");
      setStep("email");
      setResetCode("");
      setNewPassword("");
      setConfirmNewPassword("");
      setLoginMethod("password");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset password");
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold"><span className="text-blue-600">Ameri</span><span className="text-yellow-600">Lend</span></h1>
          <p className="text-muted-foreground mt-2">Secure OTP Login</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === "code" 
                ? "Enter Verification Code" 
                : step === "forgot"
                ? "Forgot Password"
                : step === "reset"
                ? "Reset Your Password"
                : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {step === "code"
                ? `We sent a code to ${email}`
                : step === "forgot"
                ? "Enter your email to receive a password reset code"
                : step === "reset"
                ? `Reset code sent to ${email}`
                : "Choose your preferred login method"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === "email" ? (
              <>
                <Tabs value={loginMethod} onValueChange={(v) => setLoginMethod(v as "password" | "otp")} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="password">Password</TabsTrigger>
                  <TabsTrigger value="otp">Email Code</TabsTrigger>
                </TabsList>

                <TabsContent value="password">
                  <form onSubmit={handlePasswordLogin} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setStep("forgot")}
                          className="text-sm text-[#0033A0] hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
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
                  <form onSubmit={handleRequestCode} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-otp">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email-otp"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
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
                    className={`w-full ${provider.color}`}
                    onClick={() => handleSocialLogin(provider.name)}
                  >
                    <span className="mr-2">{provider.icon}</span>
                    Continue with {provider.name}
                  </Button>
                ))}
              </div>
              </>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="code"
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="pl-10 text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Check your email for the 6-digit code. It expires in 10 minutes.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
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
              </form>
            )}

            {step === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("email")}
                  className="mb-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>

                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We'll send you a code to reset your password
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0033A0] hover:bg-[#002080]"
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
            )}

            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("forgot")}
                  className="mb-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-blue-800">
                    Check your email for the 6-digit reset code
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reset-code">Reset Code</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reset-code"
                      type="text"
                      placeholder="000000"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="pl-10 text-center text-2xl tracking-widest font-mono"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Re-enter password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={8}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#0033A0] hover:bg-[#002080]"
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

            <div className="mt-6 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup">
                  <span className="text-primary hover:underline cursor-pointer font-medium">
                    Sign up here
                  </span>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          By continuing, you agree to our{" "}
          <Link href="/legal/terms_of_service">
            <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>
          </Link>
          {" "}and{" "}
          <Link href="/legal/privacy_policy">
            <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
