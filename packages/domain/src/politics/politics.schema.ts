import { z } from "zod";

export const GovernmentTypeSchema = z.enum([
  "PLURALIST_PARLIAMENTARY",
  "CENTRALIZED_PRESIDENTIAL",
  "IDEOLOGICAL_REGIME",
  "HEREDITARY_MONARCHY",
  "TECHNOCRATIC_ONE_PARTY",
]);

export const GovernmentStateSchema = z.object({
  type: GovernmentTypeSchema,
  stability: z.number().min(0).max(100),
  turnsInPower: z.number().nonnegative(),
});

export type GovernmentType = z.infer<typeof GovernmentTypeSchema>;
export type GovernmentState = z.infer<typeof GovernmentStateSchema>;
