import { z } from "zod";

export const AIPersonalityTypeSchema = z.enum([
  "AGGRESSIVE",
  "PACIFIST",
  "ECONOMIC",
  "ISOLATIONIST",
]);

export type AIPersonalityType = z.infer<typeof AIPersonalityTypeSchema>;
