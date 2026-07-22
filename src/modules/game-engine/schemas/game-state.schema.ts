import { z } from "zod";
import { NationSchema } from "@/modules/nation/schemas/nation.schema";

export const ResourceMarketPriceSchema = z.object({
  oil: z.number().positive(),
  steel: z.number().positive(),
});

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
  turnLogs: z.array(TurnLogEntrySchema),
});
