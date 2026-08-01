import { z } from "zod";

export const ResearchCycleStateSchema = z.object({
  budgetRate: z.number().min(0).max(30).default(0),
  accumulatedCost: z.number().nonnegative().default(0),
  cycleTurn: z.number().min(0).max(3).default(0),
  researchPoints: z.number().nonnegative().default(0),
});

export const SetResearchBudgetActionSchema = z.object({
  id: z.string(),
  nationId: z.string(),
  signature: z.string().optional(),
  type: z.literal("SET_RESEARCH_BUDGET"),
  newRate: z.number().min(0).max(30),
});

export type ResearchCycleState = z.infer<typeof ResearchCycleStateSchema>;
export type SetResearchBudgetAction = z.infer<
  typeof SetResearchBudgetActionSchema
>;
