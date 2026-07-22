import type { Nation } from "@/core/types/nation.types";
import type { GameAction } from "@/core/types/actions.types";
import { AIPersonality } from "./ai-personality";
import { NeedEvaluator } from "./need-evaluator";
import { RiskAssessor } from "./risk-assessor";
import { AIBudgetBalancer } from "./ai-budget-balancer";
import { AIPlanner } from "./planners/ai-planner";
import { BudgetPlanningStep } from "./planners/budget-planning-step";
import { MilitaryPlanningStep } from "./planners/military-planning-step";
import { DiplomacyPlanningStep } from "./planners/diplomacy-planning-step";

export class AIActionGenerator {
  private personalityManager = new AIPersonality();
  private needEvaluator = new NeedEvaluator();
  private riskAssessor = new RiskAssessor();
  private budgetBalancer = new AIBudgetBalancer();

  private planners: AIPlanner[] = [
    new BudgetPlanningStep(),
    new MilitaryPlanningStep(),
    new DiplomacyPlanningStep(),
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
