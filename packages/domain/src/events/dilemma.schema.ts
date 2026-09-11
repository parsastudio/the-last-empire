import { z } from "zod";

export const DilemmaCategorySchema = z.enum([
  "GEOPOLITICAL",
  "ECONOMIC",
  "ESPIONAGE",
  "DOMESTIC",
  "MILITARY",
]);

export const DilemmaUrgencySchema = z.enum([
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
]);

export const DilemmaEffectSchema = z.object({
  treasuryGdpPercent: z.number().optional(),
  treasuryDelta: z.number().optional(),
  stabilityDelta: z.number().optional(),
  globalReputationDelta: z.number().optional(),
  militaryTechDelta: z.number().optional(),
  industrialLevelDelta: z.number().optional(),
  infantryDelta: z.number().optional(),
  armorDelta: z.number().optional(),
  airForceDelta: z.number().optional(),
  airDefenseDelta: z.number().optional(),
  droneMissileDelta: z.number().optional(),
});

export const DilemmaChoiceSchema = z.object({
  id: z.string(),
  effect: DilemmaEffectSchema,
});

export const DilemmaEventSchema = z.object({
  id: z.string(),
  category: DilemmaCategorySchema,
  urgency: DilemmaUrgencySchema,
  choices: z.array(DilemmaChoiceSchema).min(2),
});

export type DilemmaCategory = z.infer<typeof DilemmaCategorySchema>;
export type DilemmaUrgency = z.infer<typeof DilemmaUrgencySchema>;
export type DilemmaEffect = z.infer<typeof DilemmaEffectSchema>;
export type DilemmaChoice = z.infer<typeof DilemmaChoiceSchema>;
export type DilemmaEvent = z.infer<typeof DilemmaEventSchema>;
