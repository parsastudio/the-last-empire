import { z } from "zod";

export const EspionageTierSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
]);

export const EspionageOperationTypeSchema = z.enum([
  "RECON",
  "SABOTAGE",
  "TECH_THEFT",
]);

export const EspionageOutcomeSchema = z.enum([
  "CLEAN_SUCCESS",
  "COMPROMISED_SUCCESS",
  "CRITICAL_FAILURE",
]);

export const EspionageReconDataSchema = z.object({
  infantry: z.number().nonnegative(),
  armor: z.number().nonnegative(),
  airDefense: z.number().nonnegative(),
  airForce: z.number().nonnegative(),
  droneMissile: z.number().nonnegative(),
  navalFleet: z.number().nonnegative(),
  techLevel: z.number().positive(),
  industrialLevel: z.number().positive(),
  infrastructureLevel: z.number().positive(),
  treasury: z.number(),
  gdp: z.number().positive(),
  stability: z.number().min(0).max(100),
  activeProvincesCount: z.number().nonnegative(),
});

export const EspionageSabotageDataSchema = z.object({
  infantryDestroyed: z.number().nonnegative(),
  armorDestroyed: z.number().nonnegative(),
  airDefenseDestroyed: z.number().nonnegative(),
  airForceDestroyed: z.number().nonnegative(),
  droneMissileDestroyed: z.number().nonnegative(),
  navalFleetDestroyed: z.number().nonnegative(),
  stabilityDrain: z.number().nonnegative(),
});

export const EspionageTechTheftDataSchema = z.object({
  militaryTechGained: z.number().nonnegative(),
  industrialLevelGained: z.number().nonnegative(),
  infrastructureLevelGained: z.number().nonnegative(),
  totalPointsGained: z.number().nonnegative(),
  stabilityDrain: z.number().nonnegative(),
});

export const EspionageExecutionResultSchema = z.object({
  id: z.string(),
  tier: EspionageTierSchema,
  operationType: EspionageOperationTypeSchema,
  targetNationId: z.string(),
  targetName: z.string(),
  outcome: EspionageOutcomeSchema,
  message: z.string(),
  cost: z.number().positive(),
  reconData: EspionageReconDataSchema.optional(),
  sabotageData: EspionageSabotageDataSchema.optional(),
  techTheftData: EspionageTechTheftDataSchema.optional(),
  timestamp: z.number().positive(),
});

export type EspionageTier = z.infer<typeof EspionageTierSchema>;
export type EspionageOperationType = z.infer<
  typeof EspionageOperationTypeSchema
>;
export type EspionageOutcome = z.infer<typeof EspionageOutcomeSchema>;
export type EspionageReconData = z.infer<typeof EspionageReconDataSchema>;
export type EspionageSabotageData = z.infer<typeof EspionageSabotageDataSchema>;
export type EspionageTechTheftData = z.infer<
  typeof EspionageTechTheftDataSchema
>;
export type EspionageExecutionResult = z.infer<
  typeof EspionageExecutionResultSchema
>;
