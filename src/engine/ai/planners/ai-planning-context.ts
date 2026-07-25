import type { Nation } from "@/domain/nation/nation.schema";
import type {
  AIPersonalityWeights,
  AINeedEvaluation,
} from "@/domain/ai/ai.schema";
import type { BudgetAllocation } from "@/engine/ai/ai-budget-balancer";

export interface AIPlanningContext {
  nation: Nation;
  allNations: Record<string, Nation>;
  weights: AIPersonalityWeights;
  needs: AINeedEvaluation;
  risk: number;
  budget: BudgetAllocation;
}
