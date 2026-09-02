import { z } from "zod";

export const InvestResearchActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  type: z.literal("INVEST_RESEARCH"),
});

export type InvestResearchAction = z.infer<typeof InvestResearchActionSchema>;
