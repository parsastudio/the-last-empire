import type { Nation } from "@/domain/nation/nation.schema";
import type { GameAction } from "@/domain/game/action.schema";
import { AIPersonality } from "@/engine/ai/ai-personality";
import { NeedEvaluator } from "@/engine/ai/need-evaluator";
import { RiskAssessor } from "@/engine/ai/risk-assessor";
import { AIBudgetBalancer } from "@/engine/ai/ai-budget-balancer";
import { AIPlanner } from "@/engine/ai/planners/ai-planner";
import { BudgetPlanningStep } from "@/engine/ai/planners/budget-planning-step";
import { MilitaryPlanningStep } from "@/engine/ai/planners/military-planning-step";
import { DiplomacyPlanningStep } from "@/engine/ai/planners/diplomacy-planning-step";
import { TradePlanningStep } from "@/engine/ai/planners/trade-planning-step";

export class AIActionGenerator {
  private personalityManager = new AIPersonality();
  private needEvaluator = new NeedEvaluator();
  private riskAssessor = new RiskAssessor();
  private budgetBalancer = new AIBudgetBalancer();

  private planners: AIPlanner[] = [
    new BudgetPlanningStep(),
    new MilitaryPlanningStep(),
    new DiplomacyPlanningStep(),
    new TradePlanningStep(),
  ];

  public generateActions(
    nation: Nation,
    allNations: Record<string, Nation>,
    personalityType: "AGGRESSIVE" | "PACIFIST" | "ECONOMIC" | "ISOLATIONIST",
    currentTurn = 1,
  ): GameAction[] {
    const weights =
      this.personalityManager.getPersonalityWeights(personalityType);
    const needs = this.needEvaluator.evaluateNeeds(nation);
    const risk = this.riskAssessor.assessRisk(nation, allNations);
    const allocation = this.budgetBalancer.balanceBudget(
      nation,
      weights.personality,
    );

    const context = {
      nation,
      allNations,
      weights,
      needs,
      risk,
      budget: allocation,
      currentTurn,
    };

    const actions: GameAction[] = [];

    for (const planner of this.planners) {
      actions.push(...planner.plan(context));
    }

    return actions;
  }
}
