import { z } from "zod";

export const ModifierEffectTypeSchema = z.enum([
  "MILITARY_POWER_MULT",
  "DEFENSE_BONUS_MULT",
  "GDP_GROWTH_MULT",
  "TAX_INCOME_MULT",
  "STABILITY_DELTA",
  "REPUTATION_DELTA",
  "MANPOWER_GROWTH_MULT",
]);

export const GameModifierSchema = z.object({
  id: z.string(),
  name: z.string(),
  effectType: ModifierEffectTypeSchema,
  magnitude: z.number(),
  duration: z.number().nonnegative(),
});

export const GameEventChoiceSchema = z.object({
  id: z.string(),
  description: z.string(),
  effects: z.object({
    treasuryDelta: z.number().optional(),
    stabilityDelta: z.number().optional(),
    manpowerDelta: z.number().optional(),
    reputationDelta: z.number().optional(),
    relationsDelta: z
      .array(
        z.object({
          targetNationId: z.string(),
          delta: z.number(),
        }),
      )
      .optional(),
    addModifier: GameModifierSchema.optional(),
  }),
});

export const GameEventSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  triggerCondition: z.object({
    minStability: z.number().optional(),
    maxStability: z.number().optional(),
    isAtWar: z.boolean().optional(),
    minTreasury: z.number().optional(),
    maxTreasury: z.number().optional(),
    specificNationId: z.string().optional(),
  }),
  choices: z.array(GameEventChoiceSchema),
});
