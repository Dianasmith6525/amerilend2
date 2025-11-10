import { TRPCError } from "@trpc/server";

export function createRateLimitMiddleware() {
  return (ctx: any) => ctx;
}

export const RateLimits = {
  LOGIN: 5,
  SIGNUP: 3,
};
