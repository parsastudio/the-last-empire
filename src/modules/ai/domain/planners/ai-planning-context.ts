import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type {
  AIPersonalityWeights,
  AINeedEvaluation,
} from "@/modules/ai/schemas/ai.schema";
import type { BudgetAllocation } from "../ai-budget-balancer";

export interface AIPlanningContext {
  nation: Nation;
  allNations: Record<string, Nation>;
  weights: AIPersonalityWeights;
  needs: AINeedEvaluation;
  risk: number;
  budget: BudgetAllocation;
}
