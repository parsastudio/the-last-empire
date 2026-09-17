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
  public static planProjects(
    nation: Nation,
    context: TurnContext,
    allocatedBudget: number,
  ): NationalProjectPlanResult {
    let currentTreasury = Math.min(nation.treasury, allocatedBudget);
    const actions: GameAction[] = [];

    if (
      !nation.isAlive ||
      !nation.isAi ||
      currentTreasury < PROJECT_STEP_FLAT_COST
    ) {
      return { actions, spentMoney: 0 };
    }

    const posture = context.getPosture(nation);
    const boostedProjectIds =
      context.state.turnActivity?.[nation.id]?.boostedProjectIds ?? [];

    const maxBoosts = NationalProjectEffectApplierUtility.MAX_BOOSTS_PER_TURN;
    let quotaRemaining = Math.max(0, maxBoosts - boostedProjectIds.length);

    if (quotaRemaining <= 0) {
      return { actions, spentMoney: 0 };
    }

    const progressSteps = nation.projectProgressSteps || {};
    const candidateProjects = NATIONAL_PROJECTS_CATALOG.filter((p) => {
      const current = progressSteps[p.id] || 0;
      return (
        current < p.totalStepsRequired && !boostedProjectIds.includes(p.id)
      );
    });

    if (candidateProjects.length === 0) {
      return { actions, spentMoney: 0 };
    }

    const scoredProjects = candidateProjects.map((project) => {
      const currentStep = progressSteps[project.id] || 0;
      const currentLevel =
        NationalProjectEffectApplierUtility.getProjectLevel(currentStep);
      let score = 20;

      const nextMilestone =
        NationalProjectEffectApplierUtility.getNextMilestoneStep(currentStep);
      if (nextMilestone) {
        const remainingToMilestone = nextMilestone - currentStep;
        score += Math.max(0, (10 - remainingToMilestone) * 8);
      }

      if (posture === "WAR") {
        if (project.category === "MILITARY") score += 50;
        if (project.category === "LOGISTICS") score += 40;
      } else {
        if (project.category === "INDUSTRY") score += 45;
        if (project.category === "RESEARCH") score += 35;
      }

      switch (nation.doctrine) {
        case "MILITARIST_HAWK":
          if (
            project.category === "MILITARY" ||
            project.category === "LOGISTICS"
          )
            score += 35;
          break;
        case "DOMESTIC_INDUSTRIALIST":
          if (
            project.category === "INDUSTRY" ||
            project.category === "RESEARCH"
          )
            score += 35;
          break;
        case "MERCANTILE_ECONOMIC":
          if (project.category === "INDUSTRY") score += 30;
          break;
        case "GLOBAL_HEGEMON":
          score += (currentLevel + 1) * 15;
          break;
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
