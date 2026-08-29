import { z } from "zod";

export const ReportSeveritySchema = z.enum([
  "CRITICAL_DEFEAT",
  "DEFEAT",
  "VICTORY",
  "INFO",
]);

export const CasualtyMetricsSchema = z.object({
  infantryEngaged: z.number().nonnegative(),
  infantryLost: z.number().nonnegative(),
  armorEngaged: z.number().nonnegative().default(0),
  armorLost: z.number().nonnegative().default(0),
  airDefenseEngaged: z.number().nonnegative().default(0),
  airDefenseLost: z.number().nonnegative().default(0),
  airForceEngaged: z.number().nonnegative(),
  airForceLost: z.number().nonnegative(),
  droneMissileEngaged: z.number().nonnegative(),
  droneMissileLost: z.number().nonnegative(),
});

export const BattlePhaseReconDetailSchema = z.object({
  dronesLaunched: z.number().nonnegative(),
  defAirDefense: z.number().nonnegative(),
  airDefenseLost: z.number().nonnegative(),
  dronesIntercepted: z.number().nonnegative(),
  phaseWinner: z.enum(["ATTACKER", "DEFENDER", "DRAW", "SKIPPED"]),
});

export const BattlePhaseAirDetailSchema = z.object({
  attAirForce: z.number().nonnegative(),
  defAirForce: z.number().nonnegative(),
  attAirLost: z.number().nonnegative(),
  defAirLost: z.number().nonnegative(),
  defArmorDestroyedByAir: z.number().nonnegative(),
  phaseWinner: z.enum(["ATTACKER", "DEFENDER", "DRAW"]),
});

export const BattlePhaseGroundDetailSchema = z.object({
  attArmor: z.number().nonnegative(),
  defArmor: z.number().nonnegative(),
  attArmorLost: z.number().nonnegative(),
  defArmorLost: z.number().nonnegative(),
  attInfantry: z.number().nonnegative(),
  defInfantry: z.number().nonnegative(),
  attInfantryLost: z.number().nonnegative(),
  defInfantryLost: z.number().nonnegative(),
  phaseWinner: z.enum(["ATTACKER", "DEFENDER", "DRAW"]),
});

export const BattleSpoilsDetailsSchema = z.object({
  conqueredPixels: z.number().nonnegative().default(0),
  conqueredProvincesCount: z.number().nonnegative().default(0),
  conqueredProvincesNames: z.array(z.string()).default([]),
  gainedPopulation: z.number().nonnegative().default(0),
  gainedGdp: z.number().nonnegative().default(0),
  lootedTreasury: z.number().nonnegative().default(0),
  capturedInfantry: z.number().nonnegative().default(0),
  capturedArmor: z.number().nonnegative().default(0),
  capturedAirDefense: z.number().nonnegative().default(0),
  capturedAirForce: z.number().nonnegative().default(0),
  capturedDrones: z.number().nonnegative().default(0),
});

export const AuxiliaryGuarantorDefenseSchema = z.object({
  guarantorId: z.string(),
  guarantorName: z.string(),
  guarantorFlagCode: z.string(),
  techLevel: z.number(),
  isEmergencyProtectorate: z.boolean().default(false),
  deployedInfantry: z.number().nonnegative(),
  deployedArmor: z.number().nonnegative(),
  deployedAirDefense: z.number().nonnegative(),
  deployedAirForce: z.number().nonnegative(),
  initialBudgetValuation: z.number().nonnegative(),
  damageCostIncurred: z.number().nonnegative().default(0),
});

export const BattleFullReportDataSchema = z.object({
  attackerId: z.string(),
  defenderId: z.string(),
  targetProvinceName: z.string().optional(),
  attackType: z.enum(["LAND", "NAVAL"]).default("LAND"),
  isAttackerVictory: z.boolean(),
  isFullCapitulation: z.boolean(),
  valuationRatio: z.number(),
  treasuryLooted: z.number().nonnegative(),
  attackerCasualties: CasualtyMetricsSchema,
  defenderCasualties: CasualtyMetricsSchema,
  phase1Missile: BattlePhaseReconDetailSchema,
  phase2Air: BattlePhaseAirDetailSchema,
  phase3Ground: BattlePhaseGroundDetailSchema,
  spoils: BattleSpoilsDetailsSchema.optional(),
  auxiliaryGuarantor: AuxiliaryGuarantorDefenseSchema.optional(),
});

export type ReportSeverity = z.infer<typeof ReportSeveritySchema>;
export type CasualtyMetrics = z.infer<typeof CasualtyMetricsSchema>;
export type BattlePhaseReconDetail = z.infer<
  typeof BattlePhaseReconDetailSchema
>;
export type BattlePhaseAirDetail = z.infer<typeof BattlePhaseAirDetailSchema>;
export type BattlePhaseGroundDetail = z.infer<
  typeof BattlePhaseGroundDetailSchema
>;
export type BattleSpoilsDetails = z.infer<typeof BattleSpoilsDetailsSchema>;
export type AuxiliaryGuarantorDefense = z.infer<
  typeof AuxiliaryGuarantorDefenseSchema
>;
export type BattleFullReportData = z.infer<typeof BattleFullReportDataSchema>;
