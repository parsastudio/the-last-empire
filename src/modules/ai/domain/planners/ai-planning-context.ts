import type {
  Nation,
  AIPersonalityWeights,
  AINeedEvaluation,
} from "@/core/types";
import type { BudgetAllocation } from "../ai-budget-balancer";

export interface AIPlanningContext {
  nation: Nation;
  allNations: Record<string, Nation>;
  weights: AIPersonalityWeights;
  needs: AINeedEvaluation;
  risk: number;
  budget: BudgetAllocation;
}
