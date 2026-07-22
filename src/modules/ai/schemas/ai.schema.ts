import { z } from "zod";

export const AIPersonalityTypeSchema = z.enum([
  "AGGRESSIVE",
  "PACIFIST",
  "ECONOMIC",
  "ISOLATIONIST",
]);

export const AINeedEvaluationSchema = z.object({
  needTreasury: z.number().min(0).max(1),
  needMilitary: z.number().min(0).max(1),
  needDiplomacy: z.number().min(0).max(1),
  needStability: z.number().min(0).max(1),
});

export const AIPersonalityWeightsSchema = z.object({
  personality: AIPersonalityTypeSchema,
  aggressionMultiplier: z.number().nonnegative(),
  defenseMultiplier: z.number().nonnegative(),
  economicFocus: z.number().nonnegative(),
  diplomaticFocus: z.number().nonnegative(),
});

export type AIPersonalityType = z.infer<typeof AIPersonalityTypeSchema>;
export type AINeedEvaluation = z.infer<typeof AINeedEvaluationSchema>;
export type AIPersonalityWeights = z.infer<typeof AIPersonalityWeightsSchema>;
