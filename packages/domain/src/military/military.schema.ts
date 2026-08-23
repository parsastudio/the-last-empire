import { z } from "zod";

export const UnitTypeSchema = z.enum([
  "INFANTRY",
  "ARMOR",
  "AIR_DEFENSE",
  "AIR_FORCE",
  "DRONE_MISSILE",
  "NAVAL_FLEET",
]);

export const BranchTechRatingSchema = z.object({
  infantry: z.number().default(1),
  armor: z.number().default(1),
  airDefense: z.number().default(1),
  airForce: z.number().default(1),
  droneMissile: z.number().default(1),
  navalFleet: z.number().default(1),
});

export const MilitaryStackSchema = z.object({
  infantry: z.number().nonnegative(),
  armor: z.number().nonnegative().default(0),
  airDefense: z.number().nonnegative().default(0),
  airForce: z.number().nonnegative(),
  droneMissile: z.number().nonnegative(),
  navalFleet: z.number().nonnegative().default(0),
  experience: z.number().min(0).max(100),
  techLevel: z.number().positive(),
  branchTech: BranchTechRatingSchema.optional(),
});

export const RecruitmentOrderSchema = z.object({
  id: z.string(),
  unitType: UnitTypeSchema,
  quantity: z.number().positive(),
  turnsRemaining: z.number().nonnegative(),
  totalCost: z.number().nonnegative(),
});

export type UnitType = z.infer<typeof UnitTypeSchema>;
export type BranchTechRating = z.infer<typeof BranchTechRatingSchema>;
export type MilitaryStack = z.infer<typeof MilitaryStackSchema>;
export type RecruitmentOrder = z.infer<typeof RecruitmentOrderSchema>;
