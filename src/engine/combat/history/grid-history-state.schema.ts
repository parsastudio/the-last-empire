import { z } from "zod";

export const GridHistoryStateSchema = z.object({
  turn: z.number().nonnegative(),
  compressedData: z.string(),
  hash: z.string(),
});

export type GridHistoryState = z.infer<typeof GridHistoryStateSchema>;
