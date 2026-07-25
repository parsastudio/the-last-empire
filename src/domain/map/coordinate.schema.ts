import { z } from "zod";

export const CoordinateSchema = z.object({
  x: z.number(),
  y: z.number(),
});

export type Coordinate = z.infer<typeof CoordinateSchema>;
