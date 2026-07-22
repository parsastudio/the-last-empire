import { z } from "zod";

export const TradeRouteSchema = z.object({
  partnerId: z.string(),
  isPeaceful: z.boolean(),
  baseTradeValue: z.number().nonnegative(),
});

export const ImfLoanSchema = z.object({
  id: z.string(),
  principalAmount: z.number().positive(),
  interestRate: z.number().nonnegative(),
  turnsRemaining: z.number().nonnegative(),
  totalRepayable: z.number().nonnegative(),
});

export const ResourceMarketSchema = z.object({
  oilPrice: z.number().positive(),
  steelPrice: z.number().positive(),
  oilSupply: z.number().nonnegative(),
  oilDemand: z.number().nonnegative(),
  steelSupply: z.number().nonnegative(),
  steelDemand: z.number().nonnegative(),
});

export type TradeRoute = z.infer<typeof TradeRouteSchema>;
export type ImfLoan = z.infer<typeof ImfLoanSchema>;
export type ResourceMarket = z.infer<typeof ResourceMarketSchema>;
