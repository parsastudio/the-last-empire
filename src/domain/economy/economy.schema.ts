import { z } from "zod";

export const ResourcesSchema = z.object({
  oil: z.number().nonnegative(),
  steel: z.number().nonnegative(),
  manpower: z.number().nonnegative(),
});

export const MilitaryPayrollRatesSchema = z.object({
  infantryPayroll: z.number().nonnegative(),
  airForcePayroll: z.number().nonnegative(),
  droneMissilePayroll: z.number().nonnegative(),
});

export const ResourceMarketPriceSchema = z.object({
  oil: z.number().positive(),
  steel: z.number().positive(),
});

export type Resources = z.infer<typeof ResourcesSchema>;
export type MilitaryPayrollRates = z.infer<typeof MilitaryPayrollRatesSchema>;
export type ResourceMarketPrice = z.infer<typeof ResourceMarketPriceSchema>;
