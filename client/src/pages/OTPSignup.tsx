import { useState } from 'react';
import { useLocation, Link } from 'wouter';
import { ArrowLeft, PartyPopper } from 'lucide-react';
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

  const handleSocialSignup = (provider: string) => {
    toast.info(`${provider} signup coming soon!`);
    // TODO: Implement OAuth flow for each provider
    // window.location.href = `/api/auth/${provider.toLowerCase()}`;
  };

  const passwordRegisterMutation = trpc.password.register.useMutation({
    onSuccess: (data) => {
      const userEmail = data.user?.email?.split('@')[0] || 'User';
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
        window.location.href = '/apply';
      }, 1500);
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
        window.location.href = '/apply';
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
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader>
          <div className='flex items-center gap-2 mb-2'>
            <Link href='/'>
              <Button variant='ghost' size='sm' className='p-0 h-8 w-8'>
                <ArrowLeft className='h-4 w-4' />
              </Button>
            </Link>
          </div>
          <CardTitle className='text-2xl'>Create Account</CardTitle>
          <CardDescription>
            {step === 'verify' 
              ? 'Enter the verification code sent to your email'
              : 'Choose your preferred signup method'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 'email' ? (
            <>
              <Tabs value={authMethod} onValueChange={(v) => setAuthMethod(v)} className='w-full'>
              <TabsList className='grid w-full grid-cols-2'>
                <TabsTrigger value='password'>Password</TabsTrigger>
                <TabsTrigger value='otp'>Email Code</TabsTrigger>
              </TabsList>

              <TabsContent value='password'>
                <form onSubmit={handlePasswordSignup} className='space-y-4 mt-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='email'>Email Address</Label>
                    <Input
                      id='email'
                      type='email'
                      placeholder='you@example.com'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='password'>Password</Label>
                    <Input
                      id='password'
                      type='password'
                      placeholder='At least 8 characters'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='confirmPassword'>Confirm Password</Label>
                    <Input
                      id='confirmPassword'
                      type='password'
                      placeholder='Re-enter your password'
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <Button 
                    type='submit' 
                    className='w-full'
                    disabled={passwordRegisterMutation.isPending}
                  >
                    {passwordRegisterMutation.isPending ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value='otp'>
                <form onSubmit={handleSendCode} className='space-y-4 mt-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='email-otp'>Email Address</Label>
                    <Input
                      id='email-otp'
                      type='email'
                      placeholder='you@example.com'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <Button 
                    type='submit' 
                    className='w-full'
                    disabled={requestCodeMutation.isPending}
                  >
                    {requestCodeMutation.isPending ? 'Sending...' : 'Send Verification Code'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className='relative my-6'>
              <Separator />
              <span className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground'>
                Or continue with
              </span>
            </div>

            <div className='space-y-3'>
              {SOCIAL_PROVIDERS.map((provider) => (
                <Button
                  key={provider.name}
                  type='button'
                  variant='outline'
                  className={`w-full ${provider.color}`}
                  onClick={() => handleSocialSignup(provider.name)}
                >
                  <span className='mr-2'>{provider.icon}</span>
                  Continue with {provider.name}
                </Button>
              ))}
            </div>
            </>
          ) : (
            <form onSubmit={handleVerify} className='space-y-6'>
              <div className='space-y-2'>
                <Label htmlFor='otp'>Verification Code</Label>
                <div className='flex justify-center'>
                  <InputOTP
                    maxLength={6}
                    value={otp}
                    onChange={(value) => setOtp(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className='text-xs text-center text-muted-foreground mt-2'>
                  Code sent to {email}
                </p>
              </div>

              <Button 
                type='submit' 
                className='w-full'
                disabled={verifyCodeMutation.isPending || otp.length !== 6}
              >
                {verifyCodeMutation.isPending ? 'Verifying...' : 'Verify & Create Account'}
              </Button>

              <div className='space-y-2'>
                <Button
                  type='button'
                  variant='outline'
                  className='w-full'
                  onClick={handleResendCode}
                  disabled={requestCodeMutation.isPending}
                >
                  {requestCodeMutation.isPending ? 'Sending...' : 'Resend Code'}
                </Button>

                <Button
                  type='button'
                  variant='ghost'
                  className='w-full'
                  onClick={() => {
                    setStep('email');
                    setOtp('');
                  }}
                >
                  Change Email
                </Button>
              </div>
            </form>
          )}

          <div className='mt-6 text-center text-sm'>
            <p className='text-muted-foreground'>
              Already have an account?{' '}
              <Link href='/login'>
                <span className='text-primary hover:underline cursor-pointer font-medium'>
                  Log in here
                </span>
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
