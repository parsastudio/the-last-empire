import type { Nation } from "@/core/types/nation.types";
import type {
  AIPersonalityWeights,
  AINeedEvaluation,
} from "@/core/types/ai.types";
import type { BudgetAllocation } from "../ai-budget-balancer";

export interface AIPlanningContext {
  nation: Nation;
  allNations: Record<string, Nation>;
  weights: AIPersonalityWeights;
  needs: AINeedEvaluation;
  risk: number;
  budget: BudgetAllocation;
}
