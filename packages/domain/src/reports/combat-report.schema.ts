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
  armorEngaged: z.number().nonnegative().default(0),
  armorLost: z.number().nonnegative().default(0),
  airDefenseEngaged: z.number().nonnegative().default(0),
  airDefenseLost: z.number().nonnegative().default(0),
  airForceEngaged: z.number().nonnegative(),
  airForceLost: z.number().nonnegative(),
  droneMissileEngaged: z.number().nonnegative(),
  droneMissileLost: z.number().nonnegative(),
  navalFleetEngaged: z.number().nonnegative().default(0),
  navalFleetLost: z.number().nonnegative().default(0),
});

export type ReportSeverity = z.infer<typeof ReportSeveritySchema>;
export type CasualtyMetrics = z.infer<typeof CasualtyMetricsSchema>;
