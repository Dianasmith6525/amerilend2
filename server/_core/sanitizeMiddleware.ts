import { TRPCError } from '@trpc/server';

export function sanitizeInputMiddleware() {
  // Simple stub that doesn't actually sanitize
  // In production, this would remove harmful content
  return async (opts: any) => {
    return opts.next();
  };
}
