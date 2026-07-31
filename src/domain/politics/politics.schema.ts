import { z } from "zod";

export const GovernmentTypeSchema = z.enum([
  "DEMOCRACY",
  "DICTATORSHIP",
  "MONARCHY",
  "COMMUNISM",
  "FASCISM",
]);

export const GovernmentStateSchema = z.object({
  type: GovernmentTypeSchema,
  stability: z.number().min(0).max(100),
  corruption: z.number().min(0).max(100),
  turnsInPower: z.number().nonnegative(),
});

export type GovernmentType = z.infer<typeof GovernmentTypeSchema>;
export type GovernmentState = z.infer<typeof GovernmentStateSchema>;
