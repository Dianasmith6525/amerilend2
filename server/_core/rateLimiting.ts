import { TRPCError } from '@trpc/server';

export const RateLimits = {
  OTP: 'otp',
  AUTH: 'auth',
  LOAN_SUBMISSION: 'loan',
  PAYMENT: 'payment',
  AI_CHAT: 'ai_chat',
};

export function createRateLimitMiddleware(limitKey: string) {
  // Simple stub that doesn't actually rate limit
  // In production, this would use Redis or similar
  return async (opts: any) => {
    return opts.next();
  };
}
