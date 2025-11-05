import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function AnimatedLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="space-y-3 p-4 bg-white rounded-lg border">
            <div className="flex gap-4">
              <Skeleton className="w-12 h-12 rounded-lg shimmer" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32 shimmer" />
                <Skeleton className="h-3 w-48 shimmer" style={{ animationDelay: '0.1s' }} />
              </div>
            </div>
            <Skeleton className="h-2 w-full shimmer" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnimatedCardSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg p-6 border fade-in-up"
          style={{ animationDelay: `${i * 0.15}s` }}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-32 shimmer" />
              <Skeleton className="h-3 w-24 shimmer" style={{ animationDelay: '0.05s' }} />
            </div>
            <Skeleton className="w-10 h-10 rounded-lg shimmer" style={{ animationDelay: '0.1s' }} />
          </div>
          <Skeleton className="h-8 w-20 shimmer" style={{ animationDelay: '0.15s' }} />
        </div>
      ))}
    </div>
  );
}

export function AnimatedChartSkeleton() {
  return (
    <div className="space-y-4 p-6 bg-white rounded-lg border fade-in-up">
      <Skeleton className="h-6 w-32 shimmer" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <Skeleton className="h-8 w-20 shimmer" style={{ animationDelay: `${i * 0.1}s` }} />
            <div className="flex-1">
              <Skeleton className="h-4 w-full shimmer" style={{ animationDelay: `${i * 0.1 + 0.05}s` }} />
            </div>
            <Skeleton className="h-4 w-12 shimmer" style={{ animationDelay: `${i * 0.1 + 0.1}s` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AnimatedSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`${sizes[size]} spin-slow`}>
      <svg
        className="w-full h-full text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
    </div>
  );
}

export function SuccessCheck() {
  return (
    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center scale-in">
      <svg className="w-8 h-8 text-green-600 check-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path>
      </svg>
    </div>
  );
}

export function ErrorShake() {
  return (
    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center error-shake">
      <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </div>
  );
}

export function LoadingBar() {
  return (
    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-600 to-blue-400 animate-pulse"
        style={{
          animation: 'shimmer 2s infinite',
        }}
      ></div>
    </div>
  );
}
