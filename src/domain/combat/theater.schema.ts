import { z } from "zod";
import { CoordinateSchema } from "@/domain/map/coordinate.schema";

export const ActiveTheaterSchema = z.object({
  id: z.string(),
  targetCountryId: z.string(),
  cells: z.array(CoordinateSchema),
  totalAreaSqKm: z.number().nonnegative(),
  totalHighResPixels: z.number().nonnegative(),
});

export type ActiveTheater = z.infer<typeof ActiveTheaterSchema>;
