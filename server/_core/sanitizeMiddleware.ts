import { TRPCError } from "@trpc/server";

export function sanitizeInputMiddleware(input: any) {
  return input;
}
