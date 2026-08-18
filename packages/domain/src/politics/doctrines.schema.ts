import { z } from "zod";

export const DoctrinesStateSchema = z.object({
  unlockedDoctrines: z.array(z.string()).default([]),
});

export type DoctrinesState = z.infer<typeof DoctrinesStateSchema>;
