import { z } from "zod";

export const EconomicDoctrineStanceSchema = z.enum([
  "AUTARKY",
  "PROTECTIONISM",
  "BALANCED_MIXED",
  "FREE_TRADE",
  "MERCANTILE_HUB",
]);

export type EconomicDoctrineStance = z.infer<
  typeof EconomicDoctrineStanceSchema
>;

export const EconomicDoctrineConfigSchema = z.object({
  stance: EconomicDoctrineStanceSchema,
  domesticWeight: z.number().min(0).max(1),
  globalWeight: z.number().min(0).max(1),
});

export type EconomicDoctrineConfig = z.infer<
  typeof EconomicDoctrineConfigSchema
>;
