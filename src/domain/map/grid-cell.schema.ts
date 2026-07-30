import { z } from "zod";

export const GridCellSchema = z.object({
  x: z.number().nonnegative(),
  y: z.number().nonnegative(),
  ownerId: z.string(),
  highResPixelCount: z.number().nonnegative(),
  enclaveId: z.number().nonnegative(),
  seaAccess: z.number().min(0).max(2).default(0),
});

export type GridCell = z.infer<typeof GridCellSchema>;
