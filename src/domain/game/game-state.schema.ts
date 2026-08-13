import { z } from "zod";
import { NationSchema } from "@/domain/nation/nation.schema";
import { ProvinceSchema } from "@/domain/province/province.schema";

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
  provinces: z.record(z.string(), ProvinceSchema).default({}),
  nations: z.record(z.string(), NationSchema),
  turnLogs: z.array(TurnLogEntrySchema),
});

export type TurnLogLevel = z.infer<typeof TurnLogLevelSchema>;
export type TurnLogEntry = z.infer<typeof TurnLogEntrySchema>;
export type GameState = z.infer<typeof GameStateSchema>;
