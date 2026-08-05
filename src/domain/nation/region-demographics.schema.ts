import { z } from "zod";

export const RegionDemographicsSchema = z.object({
  regionId: z.number().nonnegative(),
  name: z.string(),
  pixelCount: z.number().nonnegative(),
  population: z.number().nonnegative(),
  gdp: z.number().nonnegative(),
});

export type RegionDemographics = z.infer<typeof RegionDemographicsSchema>;
