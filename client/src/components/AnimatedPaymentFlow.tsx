import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, DollarSign, CheckCircle2, Lock, Clock } from 'lucide-react';

export function AnimatedPaymentFlow() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Verify Application',
      description: 'We\'re reviewing your loan details',
      icon: CheckCircle2,
      status: 'completed',
    },
    {
      title: 'Enter Payment Info',
      description: 'Add your payment method securely',
      icon: CreditCard,
      status: 'active',
    },
    {
      title: 'Confirm Amount',
      description: 'Review and confirm your payment',
      icon: DollarSign,
      status: 'pending',
    },
    {
      title: 'Process Payment',
      description: 'Secure processing via Stripe',
      icon: Lock,
      status: 'pending',
    },
    {
      title: 'Funding Complete',
      description: 'Funds will be disbursed',
      icon: Clock,
      status: 'pending',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-12">
        {/* Progress Bar */}
        <div className="relative mb-8">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-blue-500 smooth-transition"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-5 gap-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            const isCompleted = i < currentStep;
            const isActive = i === currentStep;
            const isPending = i > currentStep;

            return (
              <div
                key={i}
                className={`fade-in-up ${isActive ? 'scale-in' : ''}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <button
                  onClick={() => setCurrentStep(i)}
                  disabled={isPending}
                  className="w-full text-center"
                >
                  <div className="relative mb-2">
                    {/* Circle Background */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto smooth-transition ${
                        isCompleted
                          ? 'bg-green-500 text-white scale-100'
                          : isActive
                          ? 'bg-blue-600 text-white ring-4 ring-blue-300 scale-110'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Checkmark for Completed */}
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-0.5 check-mark">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="text-xs">
                    <p className={`font-semibold ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                      Step {i + 1}
                    </p>
                    <p className="text-gray-600 text-xs">{step.title.split(' ')[0]}</p>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2">
          <Card className="border-0 shadow-lg fade-in-up" style={{ animationDelay: '0.2s' }}>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="flex items-center gap-2">
                {React.createElement(steps[currentStep].icon, { className: 'w-6 h-6 text-blue-600' })}
                {steps[currentStep].title}
              </CardTitle>
              <CardDescription>{steps[currentStep].description}</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-green-900">Application Verified</p>
                      <p className="text-sm text-green-700">Loan #1 for $40,000 is approved</p>
                    </div>
                  </div>
                  <p className="text-gray-700">Ready to proceed with payment of $40,005.75 (loan amount + $5.75 fee).</p>
                  <Button onClick={() => setCurrentStep(1)} className="w-full">
                    Continue to Payment
                  </Button>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Card Information</p>
                    <div className="bg-white rounded p-3 border border-blue-200">
                      <p className="text-sm text-gray-600">Visa •••• 4242</p>
                      <p className="text-xs text-gray-500 mt-1">Expires 12/25</p>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">Your payment information is encrypted and secured by Stripe.</p>
                  <Button onClick={() => setCurrentStep(2)} className="w-full">
                    Confirm Card
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-yellow-900 mb-3">Amount Summary</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-700">Loan Amount</span>
                        <span className="font-semibold">$40,000.00</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Processing Fee (0.01%)</span>
                        <span>$5.75</span>
                      </div>
                      <div className="border-t border-yellow-200 pt-2 mt-2 flex justify-between font-bold">
                        <span>Total Payment</span>
                        <span className="text-yellow-600">$40,005.75</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => setCurrentStep(3)} className="w-full">
                    Process Payment
                  </Button>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-4 text-center py-8">
                  <div className="inline-block p-4 rounded-full bg-blue-100 animate-pulse">
                    <Lock className="w-8 h-8 text-blue-600 spin-slow" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">Processing your payment...</p>
                  <p className="text-sm text-gray-600">Please don't close this window</p>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4 text-center py-8">
                  <div className="inline-block p-4 rounded-full bg-green-100 scale-in">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">Payment Successful!</p>
                  <p className="text-sm text-gray-600">Your application fee has been processed</p>
                  <p className="text-xs text-gray-500 mt-4">Funds will be disbursed within 1-2 business days</p>
                  <Button variant="outline" className="w-full mt-4">
                    Go to Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-4">
          <Card className="border-0 shadow-md fade-in-up" style={{ animationDelay: '0.3s' }}>
            <CardHeader>
              <CardTitle className="text-lg">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Loan Amount</p>
                  <p className="text-2xl font-bold text-blue-600">$40,000</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Processing Fee</p>
                  <p className="text-lg font-semibold text-gray-900">$5.75</p>
                </div>
                <div className="bg-gray-100 rounded p-3">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">$40,005.75</p>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 rounded-lg p-4 text-sm">
                <p className="font-semibold text-blue-900 mb-2">🔒 Secure Payment</p>
                <p className="text-blue-700 text-xs">Your payment is protected by industry-leading security encryption.</p>
              </div>
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card className="border-0 shadow-md fade-in-up" style={{ animationDelay: '0.4s' }}>
            <CardHeader>
              <CardTitle className="text-sm">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">Contact our support team for assistance.</p>
              <Button variant="outline" size="sm" className="w-full">
                Chat with Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
