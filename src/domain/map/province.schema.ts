import { z } from "zod";

export const ProvinceSchema = z.object({
  id: z.string(),
  name: z.string(),
  ownerNationId: z.string(),
  gdp: z.number().nonnegative(),
  population: z.number().nonnegative(),
  isCapital: z.boolean(),
  territorySize: z.number().positive(),
});

export type Province = z.infer<typeof ProvinceSchema>;
