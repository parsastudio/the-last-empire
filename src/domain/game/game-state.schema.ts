import { z } from "zod";
import { NationSchema } from "@/domain/nation/nation.schema";
import { ResourceMarketPriceSchema } from "@/domain/economy/economy.schema";

export const TurnLogLevelSchema = z.enum([
  "INFO",
  "WARNING",
  "CRITICAL",
  "COMBAT",
]);

export const TurnLogEntrySchema = z.object({
  id: z.string(),
  turn: z.number().nonnegative(),
  timestamp: z.number().positive(),
  sourceNationId: z.string(),
  targetNationId: z.string().optional(),
  level: TurnLogLevelSchema,
  message: z.string(),
  metadata: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .optional(),
});

export const TurnTradeVolumeSchema = z.object({
  oilBought: z.number().nonnegative(),
  oilSold: z.number().nonnegative(),
  steelBought: z.number().nonnegative(),
  steelSold: z.number().nonnegative(),
});

export const GameStateSchema = z.object({
  gameId: z.string(),
  currentTurn: z.number().nonnegative(),
  seed: z.number(),
  isGameOver: z.boolean(),
  winnerNationId: z.string().optional(),
  humanNationId: z.string(),
  globalThreatLevel: z.number().min(0).max(100),
  marketPrices: ResourceMarketPriceSchema,
  nations: z.record(z.string(), NationSchema),
  provinces: z.record(z.string(), z.any()),
  turnLogs: z.array(TurnLogEntrySchema),
  eventFlags: z.record(z.string(), z.boolean()),
  peacefulTurnsCount: z.number().nonnegative().optional(),
  turnTradeVolume: TurnTradeVolumeSchema.optional(),
});

export type TurnLogLevel = z.infer<typeof TurnLogLevelSchema>;
export type TurnLogEntry = z.infer<typeof TurnLogEntrySchema>;
export type GameState = z.infer<typeof GameStateSchema>;
export type TurnTradeVolume = z.infer<typeof TurnTradeVolumeSchema>;
