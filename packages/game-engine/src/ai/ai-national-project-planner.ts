import {
  GameAction,
  ActionFactory,
  Nation,
  NATIONAL_PROJECTS_CATALOG,
  PROJECT_STEP_FLAT_COST,
  NationalProjectEffectApplierUtility,
} from "@geopolitics/domain";
import { TurnContext } from "@/engine/pipeline/turn-context";

export interface NationalProjectPlanResult {
  actions: GameAction[];
  spentMoney: number;
}

export class AINationalProjectPlanner {
  public static readonly MIN_PEACE_TREASURY = 15_000_000_000;
  public static readonly MIN_WAR_TREASURY = 30_000_000_000;

  public static planProjects(
    nation: Nation,
    context: TurnContext,
    availableTreasury?: number,
  ): NationalProjectPlanResult {
    let currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;
    const actions: GameAction[] = [];

    if (!nation.isAlive || !nation.isAi) {
      return { actions, spentMoney: 0 };
    }

    const posture = context.getPosture(nation);
    const minTreasuryNeeded =
      posture === "WAR" ? this.MIN_WAR_TREASURY : this.MIN_PEACE_TREASURY;

    if (currentTreasury < minTreasuryNeeded) {
      return { actions, spentMoney: 0 };
    }

    const boostedProjectIds =
      context.state.turnActivity?.[nation.id]?.boostedProjectIds ?? [];

    const completedIds = nation.completedProjectIds || [];
    const maxBoosts = NationalProjectEffectApplierUtility.MAX_BOOSTS_PER_TURN;
    let quotaRemaining = Math.max(0, maxBoosts - boostedProjectIds.length);

    if (quotaRemaining <= 0) {
      return { actions, spentMoney: 0 };
    }

    const progressSteps = nation.projectProgressSteps || {};
    const candidateProjects = NATIONAL_PROJECTS_CATALOG.filter(
      (p) => !completedIds.includes(p.id) && !boostedProjectIds.includes(p.id),
    );

    if (candidateProjects.length === 0) {
      return { actions, spentMoney: 0 };
    }

    const scoredProjects = candidateProjects.map((project) => {
      const currentStep = progressSteps[project.id] || 0;
      let score = 0;

      if (currentStep > 0) {
        score += (currentStep / project.totalStepsRequired) * 120;
      }

      if (project.tier === "SHORT_TERM") {
        score += 35;
      } else if (project.tier === "MID_TERM") {
        score += 20;
      } else {
        score += 10;
      }

      switch (nation.doctrine) {
        case "MILITARIST_HAWK":
          if (project.category === "MILITARY") score += 50;
          break;
        case "MERCANTILE_ECONOMIC":
          if (project.category === "ECONOMIC") score += 50;
          break;
        case "DOMESTIC_INDUSTRIALIST":
          if (project.category === "INDUSTRY_TECH") score += 50;
          break;
        case "GLOBAL_HEGEMON":
          if (project.category === "GEOPOLITICAL") score += 40;
          if (project.tier === "LONG_TERM") score += 30;
          break;
      }

      if (posture === "WAR" && project.category === "MILITARY") {
        score += 45;
      }

      if (
        nation.government.stability < 40 &&
        project.effect.permanentStabilityBonus
      ) {
        score += 60;
      }

      return { project, score };
    });

    scoredProjects.sort((a, b) => b.score - a.score);

    let totalSpent = 0;
    for (let i = 0; i < scoredProjects.length && quotaRemaining > 0; i++) {
      const { project } = scoredProjects[i]!;
      if (currentTreasury >= PROJECT_STEP_FLAT_COST) {
        actions.push(ActionFactory.boostProject(nation.id, project.id));
        currentTreasury -= PROJECT_STEP_FLAT_COST;
        totalSpent += PROJECT_STEP_FLAT_COST;
        quotaRemaining -= 1;
      }
    }

    return {
      actions,
      spentMoney: totalSpent,
    };
  }
}
