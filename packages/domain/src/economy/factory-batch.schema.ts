import { z } from "zod";

export const FactoryBatchSchema = z.object({
  techLevel: z.number().positive(),
  count: z.number().int().nonnegative(),
});

export type FactoryBatch = z.infer<typeof FactoryBatchSchema>;
