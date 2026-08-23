import { z } from "zod";

export const RegionDemographicsSchema = z.object({
  regionId: z.number().nonnegative(),
  name: z.string(),
  pixelCount: z.number().nonnegative(),
  population: z.number().nonnegative(),
  perCapitaProductivity: z.number().nonnegative().optional(),
  maxPopulationCapacity: z.number().nonnegative().optional(),
});

export type RegionDemographics = z.infer<typeof RegionDemographicsSchema>;
