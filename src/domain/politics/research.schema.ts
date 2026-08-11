import { z } from "zod";

export const ResearchCycleStateSchema = z.object({
  researchPoints: z.number().nonnegative().default(0),
});

export type ResearchCycleState = z.infer<typeof ResearchCycleStateSchema>;
