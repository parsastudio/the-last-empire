import { z } from "zod";
import { CoordinateSchema } from "@/domain/map/coordinate.schema";

export const BattleValidationResultSchema = z.object({
  isValid: z.boolean(),
  isLandAttack: z.boolean(),
  errorMessage: z.string().nullable(),
  closestBaseCoordinate: CoordinateSchema.nullable(),
  distance: z.number().nonnegative(),
  logisticsCost: z.number().nonnegative(),
  surchargeMultiplier: z.number().nonnegative(),
  enclaveOriginalName: z.string().nullable(),
});

export type BattleValidationResult = z.infer<
  typeof BattleValidationResultSchema
>;
