import type { Nation } from "@/domain/nation/nation.schema";
import type { GameAction } from "@/domain/game/action.schema";
import { AIPersonality } from "./ai-personality";
import { NeedEvaluator } from "./need-evaluator";
import { RiskAssessor } from "./risk-assessor";
import { AIBudgetBalancer } from "./ai-budget-balancer";
import { AIPlanner } from "./planners/ai-planner";
import { BudgetPlanningStep } from "./planners/budget-planning-step";
import { MilitaryPlanningStep } from "./planners/military-planning-step";
import { DiplomacyPlanningStep } from "./planners/diplomacy-planning-step";
import { TradePlanningStep } from "./planners/trade-planning-step";

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
    };

    const actions: GameAction[] = [];

    for (const planner of this.planners) {
      actions.push(...planner.plan(context));
    }

    return actions;
  }
}
