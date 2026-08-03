import { z } from "zod";

export const DeltaPatchOperationSchema = z.enum(["add", "remove", "replace"]);

export const DeltaPatchSchema = z.object({
  op: DeltaPatchOperationSchema,
  path: z.string(),
  value: z.unknown().optional(),
});

export const EventMetadataSchema = z.object({
  gameId: z.string(),
  sequence: z.number().nonnegative(),
  turn: z.number().nonnegative(),
  timestamp: z.number().positive(),
  actorNationId: z.string(),
  clientVersion: z.string().default("1.0.0"),
});

export const DomainEventSchema = z.object({
  id: z.string(),
  type: z.string(),
  metadata: EventMetadataSchema,
  actionPayload: z.record(z.string(), z.unknown()),
  deltaPatches: z.array(DeltaPatchSchema),
});

export type DeltaPatchOperation = z.infer<typeof DeltaPatchOperationSchema>;
export type DeltaPatch = z.infer<typeof DeltaPatchSchema>;
export type EventMetadata = z.infer<typeof EventMetadataSchema>;
export type DomainEvent = z.infer<typeof DomainEventSchema>;
