import { z } from "zod";

export const GovernmentTypeSchema = z.enum([
  "DEMOCRACY",
  "DICTATORSHIP",
  "MONARCHY",
  "COMMUNISM",
  "FASCISM",
]);

export const GovernmentStateSchema = z.object({
  type: GovernmentTypeSchema,
  stability: z.number().min(0).max(100),
  corruption: z.number().min(0).max(100),
  socialFreedom: z.number().min(0).max(100),
  turnsInPower: z.number().nonnegative(),
  lastElectionTurn: z.number().optional(),
});

export const ElectionProfileSchema = z.object({
  lastElectionTurn: z.number().nonnegative(),
  electionInterval: z.number().positive(),
  incumbentWinChance: z.number().min(0).max(1),
});

export const CorruptionProfileSchema = z.object({
  level: z.number().min(0).max(100),
  taxWastageRate: z.number().min(0).max(1),
});

export const SocialFreedomProfileSchema = z.object({
  index: z.number().min(0).max(100),
  brainDrainRate: z.number().min(0).max(1),
});

export const RebellionStatusSchema = z.object({
  hasRebellionTriggered: z.boolean(),
  rebelInfantryCount: z.number().nonnegative(),
});

export type GovernmentType = z.infer<typeof GovernmentTypeSchema>;
export type GovernmentState = z.infer<typeof GovernmentStateSchema>;
export type ElectionProfile = z.infer<typeof ElectionProfileSchema>;
export type CorruptionProfile = z.infer<typeof CorruptionProfileSchema>;
export type SocialFreedomProfile = z.infer<typeof SocialFreedomProfileSchema>;
export type RebellionStatus = z.infer<typeof RebellionStatusSchema>;
