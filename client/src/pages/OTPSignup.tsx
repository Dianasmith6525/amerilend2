import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { ArrowLeft, PartyPopper, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

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

export default function OTPSignup() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [authMethod, setAuthMethod] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSocialSignup = (provider: string) => {
    toast.info(`${provider} signup coming soon!`);
    // TODO: Implement OAuth flow for each provider
    // window.location.href = `/api/auth/${provider.toLowerCase()}`;
  };

  const passwordRegisterMutation = trpc.password.register.useMutation({
    onSuccess: (data) => {
      const userEmail = data.user?.email?.split('@')[0] || 'User';
      
      if (data.requiresVerification) {
        // New flow: redirect to email verification
        toast.success(`✅ Account Created, ${userEmail}!`, {
          description: 'Check your email to verify your account',
          duration: 3000,
        });
        
        // Redirect to verification page
        setTimeout(() => {
          window.location.href = '/verify-email';
        }, 1500);
      } else {
        // Fallback (if verification not required)
        toast.success(`✅ Welcome to AmeriLend, ${userEmail}!`, {
          description: 'Your account has been created successfully. Let\'s get you a loan!',
          duration: 3000,
        });
        
        // Trigger welcome confetti
        const duration = 2000;
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
            colors: ['#0033A0', '#FFA500', '#D4AF37', '#00A651']
          });
          confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
            colors: ['#0033A0', '#FFA500', '#D4AF37', '#00A651']
          });
        }, 250);
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      }
    },
    onError: (error) => {
      toast.error("❌ Account Creation Failed", {
        description: error.message || 'Failed to create account',
        duration: 4000,
      });
    },
  });

  const requestCodeMutation = trpc.otp.requestCode.useMutation({
    onSuccess: () => {
      toast.success("✅ Code Sent!", {
        description: "Check your email for the verification code",
        duration: 3000,
      });
      setStep('verify');
    },
    onError: (error) => {
      toast.error("❌ Failed to Send Code", {
        description: error.message || 'Failed to send verification code',
        duration: 4000,
      });
    },
  });

  const verifyCodeMutation = trpc.otp.verifyCode.useMutation({
    onSuccess: (data) => {
      const userEmail = data.user?.email?.split('@')[0] || 'User';
      toast.success(`✅ Email Verified, ${userEmail}!`, {
        description: 'Your account is all set. Redirecting to loan application...',
        duration: 3000,
      });
      
      // Trigger welcome confetti
      const duration = 2000;
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
          colors: ['#0033A0', '#FFA500', '#D4AF37', '#00A651']
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#0033A0', '#FFA500', '#D4AF37', '#00A651']
        });
      }, 250);
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    },
    onError: (error) => {
      toast.error("❌ Verification Failed", {
        description: error.message || 'Invalid verification code',
        duration: 4000,
      });
    },
  });

  const handlePasswordSignup = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    passwordRegisterMutation.mutate({ email, password });
  };

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    requestCodeMutation.mutate({
      email,
      purpose: 'signup',
    });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter the 6-digit code');
      return;
    }

    verifyCodeMutation.mutate({
      email,
      code: otp,
      purpose: 'signup',
    });
  };

  const handleResendCode = () => {
    setOtp('');
    requestCodeMutation.mutate({
      email,
      purpose: 'signup',
    });
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-12'>
      <Link href='/'>
        <button className="absolute top-4 left-4 flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back Home</span>
        </button>
      </Link>

      <div className='w-full max-w-4xl'>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold"><span className="text-blue-600">Ameri</span><span className="text-yellow-600">Lend</span></h1>
          <p className="text-gray-600 mt-2">Create Your Account</p>
        </div>

        <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
          <CardContent className="py-8 px-6">
            {step === 'email' ? (
              <div className="space-y-8">
                <h2 className="text-3xl font-bold text-center mb-8">Sign Up</h2>

                <form onSubmit={handlePasswordSignup} className='space-y-4'>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='email' className='text-base'>Email Address</Label>
                      <Input
                        id='email'
                        type='email'
                        placeholder='you@example.com'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        className='pl-4 h-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-600'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='password' className='text-base'>Create Password</Label>
                      <div className='relative'>
                        <Input
                          id='password'
                          type={showPassword ? 'text' : 'password'}
                          placeholder='Min. 8 characters'
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className='pl-4 pr-12 h-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-600'
                        />
                        <button
                          type='button'
                          onClick={() => setShowPassword(!showPassword)}
                          className='absolute right-3 top-3 text-gray-600 hover:text-gray-900 transition-colors'
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className='w-5 h-5' />
                          ) : (
                            <Eye className='w-5 h-5' />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='confirmPassword' className='text-base'>Confirm Password</Label>
                      <div className='relative'>
                        <Input
                          id='confirmPassword'
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder='Re-enter password'
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className='pl-4 pr-12 h-12 text-base border-2 border-gray-200 rounded-xl focus:border-blue-600'
                        />
                        <button
                          type='button'
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className='absolute right-3 top-3 text-gray-600 hover:text-gray-900 transition-colors'
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className='w-5 h-5' />
                          ) : (
                            <Eye className='w-5 h-5' />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <Button 
                    type='submit' 
                    className='w-full h-12 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-xl'
                    disabled={passwordRegisterMutation.isPending}
                  >
                    {passwordRegisterMutation.isPending ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </form>

                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-white text-gray-500 font-medium">Or continue with</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {SOCIAL_PROVIDERS.map((provider) => (
                    <Button
                      key={provider.name}
                      type="button"
                      variant="outline"
                      className="w-full h-12 border-2 border-gray-300 hover:bg-gray-50 rounded-xl text-base font-medium transition-all"
                      onClick={() => handleSocialSignup(provider.name)}
                    >
                      <span className="mr-3">{provider.icon}</span>
                      {provider.name === "Google" ? "Sign up with Google" : `Sign up with ${provider.name}`}
                    </Button>
                  ))}
                </div>

                <div className="text-center text-sm pt-4">
                  <span className="text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login">
                      <span className="text-blue-600 hover:underline cursor-pointer font-semibold">
                        Log in
                      </span>
                    </Link>
                  </span>
                </div>
              </div>
            ) : step === 'verify' ? (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold">Verify Email</h2>
                  <p className="text-base text-gray-600 mt-3">Enter the code sent to {email}</p>
                </div>

                <form onSubmit={handleVerify} className='space-y-6'>
                  <Input
                    type='text'
                    placeholder='000000'
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className='text-center text-3xl tracking-widest font-mono h-12 rounded-lg'
                    required
                  />

                  <Button 
                    type='submit' 
                    className='w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold rounded-lg'
                    disabled={verifyCodeMutation.isPending}
                  >
                    {verifyCodeMutation.isPending ? 'Verifying...' : 'Verify & Continue'}
                  </Button>

                  <Button
                    type='button'
                    variant='outline'
                    className='w-full h-12 border-2 border-gray-200 rounded-lg text-base'
                    onClick={handleResendCode}
                    disabled={requestCodeMutation.isPending}
                  >
                    {requestCodeMutation.isPending ? 'Resending...' : 'Resend Code'}
                  </Button>
                </form>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-600 mt-6">
          By continuing, you agree to our{" "}
          <Link href="/legal/terms_of_service">
            <span className="text-blue-600 hover:underline cursor-pointer">Terms of Service</span>
          </Link>
          {" "}and{" "}
          <Link href="/legal/privacy_policy">
            <span className="text-blue-600 hover:underline cursor-pointer">Privacy Policy</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
