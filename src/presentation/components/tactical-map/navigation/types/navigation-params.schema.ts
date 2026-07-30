import { z } from "zod";

export const NavigationParamsSchema = z.object({
  tab: z.string().optional(),
  subTab: z.string().optional(),
  target: z.string().optional(),
  modal: z.string().optional(),
});

export type NavigationParams = z.infer<typeof NavigationParamsSchema>;
