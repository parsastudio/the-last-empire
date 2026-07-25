import { z } from "zod";
import { CoordinateSchema } from "@/domain/map/coordinate.schema";

export const ConquestLogisticsResultSchema = z.object({
  origin: CoordinateSchema,
  target: CoordinateSchema,
  distance: z.number().nonnegative(),
  finalCost: z.number().nonnegative(),
  isEnclave: z.boolean(),
  enclaveName: z.string().nullable(),
});

export type ConquestLogisticsResult = z.infer<
  typeof ConquestLogisticsResultSchema
>;
