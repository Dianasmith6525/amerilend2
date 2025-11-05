import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle2, Shield, Zap } from 'lucide-react';

export function AnimatedHeroSection() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-blue-50/50 pt-20 pb-32">
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Headline */}
        <div className="text-center fade-in-up mb-12">
          <div className="inline-block mb-6">
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 hover-lift">
              <span className="text-sm font-semibold text-blue-700">✨ Fast • Safe • Trusted</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Quick Loans
            </span>
            <br />
            <span className="text-gray-900">When You Need Them</span>
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Get approved for up to $40,000 in minutes. No hidden fees. No surprises. 
            Just fast, transparent lending with your financial needs in mind.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="rounded-lg px-8 py-6 text-base font-semibold hover-scale">
              Apply Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="rounded-lg px-8 py-6 text-base font-semibold hover-scale"
            >
              Learn More
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 fade-in" style={{ animationDelay: '0.1s' }}>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Instant Approval</span>
            </div>
            <div className="flex items-center justify-center gap-2 fade-in" style={{ animationDelay: '0.2s' }}>
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">100% Secure</span>
            </div>
            <div className="flex items-center justify-center gap-2 fade-in" style={{ animationDelay: '0.3s' }}>
              <Zap className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Fast Funding</span>
            </div>
          </div>
        </div>

        {/* Social Proof Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16">
          {[
            { number: '50K+', label: 'Happy Customers', delay: '0s' },
            { number: '$2B+', label: 'Funds Disbursed', delay: '0.1s' },
            { number: '4.8★', label: 'Customer Rating', delay: '0.2s' },
          ].map((stat, i) => (
            <div 
              key={i}
              className="bg-white rounded-xl p-6 shadow-md hover-lift fade-in-up"
              style={{ animationDelay: stat.delay }}
            >
              <div className="text-3xl font-bold text-blue-600 mb-2">{stat.number}</div>
              <p className="text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-20">
        <svg 
          className="w-full h-full" 
          preserveAspectRatio="none" 
          viewBox="0 0 1200 120" 
          fill="none"
        >
          <path 
            d="M0,50 Q300,0 600,50 T1200,50 L1200,120 L0,120 Z" 
            fill="#ffffff"
          />
        </svg>
      </div>
    </div>
  );
}
