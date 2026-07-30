import { z } from "zod";

export const ResourcesSchema = z.object({
  oil: z.number().nonnegative(),
  steel: z.number().nonnegative(),
  manpower: z.number().nonnegative(),
});

export const UpkeepRatesSchema = z.object({
  infantryUpkeep: z.number().nonnegative(),
  airForceUpkeep: z.number().nonnegative(),
  droneMissileUpkeep: z.number().nonnegative(),
  infrastructureUpkeep: z.number().nonnegative(),
});

export const ResourceMarketPriceSchema = z.object({
  oil: z.number().positive(),
  steel: z.number().positive(),
});

export type Resources = z.infer<typeof ResourcesSchema>;
export type UpkeepRates = z.infer<typeof UpkeepRatesSchema>;
export type ResourceMarketPrice = z.infer<typeof ResourceMarketPriceSchema>;
