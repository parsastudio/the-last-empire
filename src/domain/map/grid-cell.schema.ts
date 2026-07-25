import { z } from "zod";

export const GridCellSchema = z.object({
  x: z.number().nonnegative(),
  y: z.number().nonnegative(),
  ownerId: z.string(),
  isOccupied: z.boolean(),
  occupierId: z.string().nullable(),
  highResPixelCount: z.number().nonnegative(),
  enclaveId: z.number().nonnegative(),
});

export type GridCell = z.infer<typeof GridCellSchema>;
