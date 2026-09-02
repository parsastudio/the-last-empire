import { z } from "zod";

export const BoostNationalProjectActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("BOOST_NATIONAL_PROJECT"),
  projectId: z.string(),
});

export type BoostNationalProjectAction = z.infer<
  typeof BoostNationalProjectActionSchema
>;
