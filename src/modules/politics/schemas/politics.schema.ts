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
