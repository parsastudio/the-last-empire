import { z } from "zod";
import { GameStateSchema } from "@/domain/game/game-state.schema";
import { DomainEventSchema } from "@/domain/events/domain-event.schema";

export const CheckpointSnapshotSchema = z.object({
  id: z.string(),
  gameId: z.string(),
  turn: z.number().nonnegative(),
  sequence: z.number().nonnegative(),
  timestamp: z.number().positive(),
  state: GameStateSchema,
});

export const EventStreamSchema = z.object({
  gameId: z.string(),
  startSequence: z.number().nonnegative(),
  endSequence: z.number().nonnegative(),
  events: z.array(DomainEventSchema),
});

export const ReplayRangeQuerySchema = z.object({
  gameId: z.string(),
  fromTurn: z.number().nonnegative().optional(),
  toTurn: z.number().nonnegative().optional(),
});

export type CheckpointSnapshot = z.infer<typeof CheckpointSnapshotSchema>;
export type EventStream = z.infer<typeof EventStreamSchema>;
export type ReplayRangeQuery = z.infer<typeof ReplayRangeQuerySchema>;
