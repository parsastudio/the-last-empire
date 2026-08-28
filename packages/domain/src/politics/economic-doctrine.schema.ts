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
  nameFa: z.string(),
  tagline: z.string(),
  description: z.string(),
  domesticWeight: z.number().min(0).max(1),
  globalWeight: z.number().min(0).max(1),
  stabilityDelta: z.number(),
  badgeText: z.string(),
});

export type EconomicDoctrineConfig = z.infer<
  typeof EconomicDoctrineConfigSchema
>;
