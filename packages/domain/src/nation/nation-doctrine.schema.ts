import { z } from "zod";

export const AiDoctrineTypeSchema = z.enum([
  "ARMS_IMPORTER_RENTIER",
  "DOMESTIC_INDUSTRIALIST",
  "MERCANTILE_ECONOMIC",
  "MILITARIST_HAWK",
  "GLOBAL_HEGEMON",
]);

export const AiDoctrineWeightsSchema = z.object({
  armsImportRatio: z.number().min(0).max(1),
  machineryImportRatio: z.number().min(0).max(1).default(0.3),
  researchFocusWeight: z.number().min(0).max(1),
  developmentPriority: z.number().min(0).max(1),
  peacetimeArmyCap: z.number().min(0).max(1),
});

export const NationDoctrineProfileSchema = z.object({
  type: AiDoctrineTypeSchema,
  weights: AiDoctrineWeightsSchema,
});

export type AiDoctrineType = z.infer<typeof AiDoctrineTypeSchema>;
export type AiDoctrineWeights = z.infer<typeof AiDoctrineWeightsSchema>;
export type NationDoctrineProfile = z.infer<typeof NationDoctrineProfileSchema>;
