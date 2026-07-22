import { z } from "zod";

export const CombatCasualtiesSchema = z.object({
  attackerKilledInfantry: z.number().nonnegative(),
  attackerKilledAirForce: z.number().nonnegative(),
  defenderKilledInfantry: z.number().nonnegative(),
  defenderKilledAirForce: z.number().nonnegative(),
});

export const BattleReportSchema = z.object({
  battleId: z.string(),
  turn: z.number().positive(),
  attackerId: z.string(),
  defenderId: z.string(),
  attackerWon: z.boolean(),
  attackerScore: z.number().nonnegative(),
  defenderScore: z.number().nonnegative(),
  casualties: CombatCasualtiesSchema,
});

export const WarStateSchema = z.object({
  attackerId: z.string(),
  defenderId: z.string(),
  turnsActive: z.number().nonnegative(),
  warExhaustionAttacker: z.number().min(0).max(100),
  warExhaustionDefender: z.number().min(0).max(100),
});
