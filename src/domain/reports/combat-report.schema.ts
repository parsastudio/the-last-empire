import { z } from "zod";

export const ReportSeveritySchema = z.enum([
  "CRITICAL_DEFEAT",
  "DEFEAT",
  "PYRRHIC_VICTORY",
  "VICTORY",
  "CRUSHING_VICTORY",
  "INFO",
]);

export const CasualtyMetricsSchema = z.object({
  infantryEngaged: z.number().nonnegative(),
  infantryLost: z.number().nonnegative(),
  infantryRetreated: z.number().nonnegative().optional(),
  airForceEngaged: z.number().nonnegative(),
  airForceLost: z.number().nonnegative(),
  droneMissileEngaged: z.number().nonnegative(),
  droneMissileLost: z.number().nonnegative(),
});

export const CombatReportSchema = z.object({
  id: z.string(),
  turn: z.number().nonnegative(),
  timestamp: z.number().positive(),
  severity: ReportSeveritySchema,
  title: z.string(),
  summary: z.string(),
  attackerNationId: z.string(),
  attackerName: z.string(),
  defenderNationId: z.string(),
  defenderName: z.string(),
  attackerCasualties: CasualtyMetricsSchema,
  defenderCasualties: CasualtyMetricsSchema,
  conqueredPixelsCount: z.number().nonnegative(),
  capitulatedPixelsCount: z.number().nonnegative(),
  strategicAssessment: z.string(),
  isVictory: z.boolean(),
  supplyShortagePenaltyApplied: z.boolean().optional(),
});

export type ReportSeverity = z.infer<typeof ReportSeveritySchema>;
export type CasualtyMetrics = z.infer<typeof CasualtyMetricsSchema>;
export type CombatReport = z.infer<typeof CombatReportSchema>;
