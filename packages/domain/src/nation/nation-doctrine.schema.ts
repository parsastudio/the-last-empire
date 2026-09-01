import { z } from "zod";

export const AiDoctrineTypeSchema = z.enum([
  "ARMS_IMPORTER_RENTIER",
  "DOMESTIC_INDUSTRIALIST",
  "MERCANTILE_ECONOMIC",
  "MILITARIST_HAWK",
  "GLOBAL_HEGEMON",
]);

export const AiDoctrineWeightsSchema = z.object({
  innovationWeight: z.number().min(0).max(1).default(0.25),
  globalMarketWeight: z.number().min(0).max(1).default(0.35),
  domesticInfraWeight: z.number().min(0).max(1).default(0.25),
  geopoliticsWeight: z.number().min(0).max(1).default(0.15),
  peacetimeArmyCap: z.number().min(0).max(1).default(0.7),
});

export const NationDoctrineProfileSchema = z.object({
  type: AiDoctrineTypeSchema,
  weights: AiDoctrineWeightsSchema,
});

export type AiDoctrineType = z.infer<typeof AiDoctrineTypeSchema>;
export type AiDoctrineWeights = z.infer<typeof AiDoctrineWeightsSchema>;
export type NationDoctrineProfile = z.infer<typeof NationDoctrineProfileSchema>;
