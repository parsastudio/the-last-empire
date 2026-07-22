import { z } from "zod";

export const TradeRouteSchema = z.object({
  partnerId: z.string(),
  isPeaceful: z.boolean(),
  baseTradeValue: z.number().nonnegative(),
});

export const TariffRateSchema = z.object({
  rate: z.number().min(0).max(100),
  gdpGrowthPenalty: z.number().nonnegative(),
});

export const LoanAgreementSchema = z.object({
  id: z.string(),
  lenderId: z.string(),
  borrowerId: z.string(),
  principalAmount: z.number().positive(),
  interestRate: z.number().nonnegative(),
  turnsRemaining: z.number().nonnegative(),
});

export const ResourceMarketSchema = z.object({
  oilPrice: z.number().positive(),
  steelPrice: z.number().positive(),
  oilSupply: z.number().nonnegative(),
  oilDemand: z.number().nonnegative(),
  steelSupply: z.number().nonnegative(),
  steelDemand: z.number().nonnegative(),
});
