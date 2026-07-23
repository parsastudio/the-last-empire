import { z } from "zod";

export const GridCellSchema = z.object({
  x: z.number(),
  y: z.number(),
  ownerId: z.string().nullable(),
  type: z.enum(["LAND", "SEA"]),
});

export type GridCell = z.infer<typeof GridCellSchema>;
