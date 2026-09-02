import { z } from "zod";

export const ResolveDilemmaActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("RESOLVE_DILEMMA"),
  eventId: z.string(),
  choiceId: z.string(),
});

export type ResolveDilemmaAction = z.infer<typeof ResolveDilemmaActionSchema>;
