import { publicProcedure } from "./trpc";

export const adminBankRouter = {
  getBankAccounts: publicProcedure.query(() => []),
};
