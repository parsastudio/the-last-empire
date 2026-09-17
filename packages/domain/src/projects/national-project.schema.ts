import { z } from "zod";

export const ProjectCategorySchema = z.enum([
  "INDUSTRY",
  "RESEARCH",
  "LOGISTICS",
  "MILITARY",
]);

export const ProjectMilestoneEffectSchema = z.object({
  level: z.number().int().min(1).max(3),
  stepThreshold: z.number().int().positive(),
  factoryYieldBonusMultiplier: z.number().optional(),
  researchCostDiscountMultiplier: z.number().optional(),
  procurementCostDiscountMultiplier: z.number().optional(),
  militaryPowerBonusMultiplier: z.number().optional(),
});

export const NationalProjectConfigSchema = z.object({
  id: z.string(),
  category: ProjectCategorySchema,
  totalStepsRequired: z.number().int().default(30),
  costPerStep: z.number().positive(),
  milestones: z.array(ProjectMilestoneEffectSchema),
});

export type ProjectCategory = z.infer<typeof ProjectCategorySchema>;
export type ProjectMilestoneEffect = z.infer<
  typeof ProjectMilestoneEffectSchema
>;
export type NationalProjectConfig = z.infer<typeof NationalProjectConfigSchema>;
