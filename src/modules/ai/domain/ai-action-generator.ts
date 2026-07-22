import type { Nation } from "@/core/types/nation.types";
import type { GameAction } from "@/core/types/actions.types";
import { AIPersonality } from "./ai-personality";
import { NeedEvaluator } from "./need-evaluator";
import { RiskAssessor } from "./risk-assessor";
import { AIBudgetBalancer } from "./ai-budget-balancer";
import { AIRecruitmentPlanner } from "./ai-recruitment-planner";
import { AIDiplomacyLogic } from "./ai-diplomacy-logic";

export class AIActionGenerator {
  private personalityManager = new AIPersonality();
  private needEvaluator = new NeedEvaluator();
  private riskAssessor = new RiskAssessor();
  private budgetBalancer = new AIBudgetBalancer();
  private recruitmentPlanner = new AIRecruitmentPlanner();
  private diplomacyLogic = new AIDiplomacyLogic();

  public generateActions(
    nation: Nation,
    allNations: Record<string, Nation>,
    personalityType: "AGGRESSIVE" | "PACIFIST" | "ECONOMIC" | "ISOLATIONIST",
  ): GameAction[] {
    const actions: GameAction[] = [];

    const weights =
      this.personalityManager.getPersonalityWeights(personalityType);
    const needs = this.needEvaluator.evaluateNeeds(nation);
    const risk = this.riskAssessor.assessRisk(nation, allNations);

    const allocation = this.budgetBalancer.balanceBudget(
      nation,
      weights.personality,
    );

    if (
      allocation.recruitmentBudget > 0 &&
      (needs.needMilitary > 0.4 || risk > 30)
    ) {
      const recruitment = this.recruitmentPlanner.planRecruitment(
        nation,
        allocation.recruitmentBudget,
      );
      actions.push(...recruitment);
    }

    if (needs.needDiplomacy > 0.3) {
      const diplomacy = this.diplomacyLogic.planDiplomacy(
        nation,
        allNations,
        weights.personality,
      );
      actions.push(...diplomacy);
    }

    if (
      nation.government.corruption > 35 &&
      allocation.antiCorruptionBudget > 10000
    ) {
      actions.push({
        id: `ai-anti-corruption-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        nationId: nation.id,
        type: "SET_TAX_RATE",
        newRate: Math.max(10, nation.taxRate - 2),
      });
    }

    return actions;
  }
}
