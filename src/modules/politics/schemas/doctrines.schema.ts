import { z } from "zod";

export const DoctrinesStateSchema = z.object({
  doctrinePoints: z.number().nonnegative(),
  unlockedDoctrines: z.array(z.string()),
});

export type DoctrinesState = z.infer<typeof DoctrinesStateSchema>;
