import { z } from "zod";

export const ProvinceSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerNationId: z.string(),
  gdp: z.number().nonnegative(),
  population: z.number().nonnegative(),
  isCapital: z.boolean(),
  territorySize: z.number().positive(),
  x: z.number(),
  y: z.number(),
  isCoastal: z.boolean(),
  isOccupied: z.boolean(),
  neighbors: z.array(z.string()),
});

export type Province = z.infer<typeof ProvinceSchema>;
