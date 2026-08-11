import { z } from "zod";

export const UnitTypeSchema = z.enum([
  "INFANTRY",
  "AIR_FORCE",
  "DRONE_MISSILE",
]);

export const MilitaryStackSchema = z.object({
  infantry: z.number().nonnegative(),
  airForce: z.number().nonnegative(),
  droneMissile: z.number().nonnegative(),
  experience: z.number().min(0).max(100),
  techLevel: z.number().positive(),
});

export const RecruitmentOrderSchema = z.object({
  id: z.string(),
  unitType: UnitTypeSchema,
  quantity: z.number().positive(),
  turnsRemaining: z.number().nonnegative(),
  totalCost: z.number().nonnegative(),
});

export type UnitType = z.infer<typeof UnitTypeSchema>;
export type MilitaryStack = z.infer<typeof MilitaryStackSchema>;
export type RecruitmentOrder = z.infer<typeof RecruitmentOrderSchema>;
