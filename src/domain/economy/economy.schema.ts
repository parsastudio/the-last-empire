import { z } from "zod";
import { ResourcesSchema } from "@/domain/nation/nation.schema";

export const MilitaryPayrollRatesSchema = z.object({
  infantryPayroll: z.number().nonnegative(),
  airForcePayroll: z.number().nonnegative(),
  droneMissilePayroll: z.number().nonnegative(),
});

export type MilitaryPayrollRates = z.infer<typeof MilitaryPayrollRatesSchema>;

export { ResourcesSchema };
