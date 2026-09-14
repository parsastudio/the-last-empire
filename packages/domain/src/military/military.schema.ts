import { z } from "zod";

export const UnitTypeSchema = z.enum([
  "INFANTRY",
  "ARMOR",
  "AIR_DEFENSE",
  "AIR_FORCE",
  "DRONE_MISSILE",
]);

export const ALL_MILITARY_UNIT_TYPES: readonly UnitType[] =
  UnitTypeSchema.options;

export const BranchTechRatingSchema = z.object({
  infantry: z.number().default(1),
  armor: z.number().default(1),
  airDefense: z.number().default(1),
  airForce: z.number().default(1),
  droneMissile: z.number().default(1),
});

export const MilitaryStackSchema = z.object({
  infantry: z.number().nonnegative(),
  armor: z.number().nonnegative().default(0),
  airDefense: z.number().nonnegative().default(0),
  airForce: z.number().nonnegative(),
  droneMissile: z.number().nonnegative(),
  techLevel: z.number().positive(),
  branchTech: BranchTechRatingSchema.optional(),
});

export type UnitType = z.infer<typeof UnitTypeSchema>;
export type BranchTechRating = z.infer<typeof BranchTechRatingSchema>;
export type MilitaryStack = z.infer<typeof MilitaryStackSchema>;
