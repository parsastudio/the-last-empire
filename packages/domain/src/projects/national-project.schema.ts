import { z } from "zod";

export const ProjectCategorySchema = z.enum([
  "MILITARY",
  "ECONOMIC",
  "GEOPOLITICAL",
  "INDUSTRY_TECH",
]);

export const ProjectScopeTierSchema = z.enum([
  "SHORT_TERM",
  "MID_TERM",
  "LONG_TERM",
]);

export const NationalProjectEffectSchema = z.object({
  factoryYieldBonusMultiplier: z.number().optional(),
  militaryPowerBonusMultiplier: z.number().optional(),
  globalTradeIncomeBonusMultiplier: z.number().optional(),
  defenseCasualtyReductionMultiplier: z.number().optional(),
  autoMissileInterceptionRate: z.number().optional(),
  permanentStabilityBonus: z.number().optional(),
  fullOmniscienceIntel: z.boolean().optional(),
  procurementCostDiscountMultiplier: z.number().optional(),
  globalReputationBonus: z.number().optional(),
  maintenanceCostDiscountMultiplier: z.number().optional(),
  petroTributeShare: z.number().optional(),
  factorySlotExpansionRatio: z.number().optional(),
  deterrenceWarThresholdMultiplier: z.number().optional(),
});

export const NationalProjectConfigSchema = z.object({
  id: z.string(),
  nameFa: z.string().min(1),
  taglineFa: z.string().min(1),
  descriptionFa: z.string().min(1),
  category: ProjectCategorySchema,
  tier: ProjectScopeTierSchema,
  totalStepsRequired: z.number().int().min(10),
  costPerStep: z.number().positive(),
  effect: NationalProjectEffectSchema,
});

export type ProjectCategory = z.infer<typeof ProjectCategorySchema>;
export type ProjectScopeTier = z.infer<typeof ProjectScopeTierSchema>;
export type NationalProjectEffect = z.infer<typeof NationalProjectEffectSchema>;
export type NationalProjectConfig = z.infer<typeof NationalProjectConfigSchema>;
