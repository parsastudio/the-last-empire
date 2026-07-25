import { z } from "zod";
import { CoordinateSchema } from "@/domain/map/coordinate.schema";

export const CombatLogisticsSchema = z.object({
  origin: CoordinateSchema,
  target: CoordinateSchema,
  distance: z.number().nonnegative(),
  baseCost: z.number().nonnegative(),
  surchargeMultiplier: z.number().nonnegative(),
  finalCost: z.number().nonnegative(),
  enclaveId: z.number().nullable(),
  enclaveOriginalName: z.string().nullable(),
});

export type CombatLogistics = z.infer<typeof CombatLogisticsSchema>;
