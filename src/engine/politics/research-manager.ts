import { Nation } from "@/domain/nation/nation.schema";
import { GovernmentSystem } from "@/engine/politics/government-system";

export class ResearchManager {
  public setResearchBudget(nation: Nation, newRate: number): Nation {
    const clampedRate = Math.max(0, Math.min(30, newRate));
    const isRateChanged = clampedRate !== (nation.researchBudgetRate ?? 0);
    const hasActiveCycleProgress = (nation.researchCycleTurn ?? 0) > 0;

    const resetCost =
      isRateChanged && hasActiveCycleProgress
        ? 0
        : (nation.accumulatedResearchCost ?? 0);
    const resetTurn =
      isRateChanged && hasActiveCycleProgress
        ? 0
        : (nation.researchCycleTurn ?? 0);

    return {
      ...nation,
      researchBudgetRate: clampedRate,
      accumulatedResearchCost: resetCost,
      researchCycleTurn: resetTurn,
    };
  }

  public processTurnResearch(nation: Nation): Nation {
    const budgetRate = nation.researchBudgetRate ?? 0;
    if (budgetRate <= 0) {
      return nation;
    }

    const turnCost = Math.floor(nation.gdp * (budgetRate / 100));
    let newTreasury = nation.treasury - turnCost;
    let newNationalDebt = nation.nationalDebt;

    if (newTreasury < 0) {
      newNationalDebt += Math.abs(newTreasury);
      newTreasury = 0;
    }

    const currentAccumulated = (nation.accumulatedResearchCost ?? 0) + turnCost;
    const currentTurn = (nation.researchCycleTurn ?? 0) + 1;

    let pointsEarned = 0;
    let finalAccumulated = currentAccumulated;
    let finalTurn = currentTurn;

    if (currentTurn >= 3) {
      const govTraits = GovernmentSystem.getTraits(nation.government.type);
      const industrialBonus = 1 + (nation.industrialLevel - 1) * 0.1;
      const basePoints = currentAccumulated / 10000000000;

      pointsEarned =
        basePoints * industrialBonus * (1 + govTraits.economicGrowthBonus);
      finalAccumulated = 0;
      finalTurn = 0;
    }

    const currentDoctrines = nation.doctrines || {
      doctrinePoints: 0,
      unlockedDoctrines: [],
    };

    const newPoints = Number(
      (currentDoctrines.doctrinePoints + pointsEarned).toFixed(2),
    );

    return {
      ...nation,
      treasury: newTreasury,
      nationalDebt: newNationalDebt,
      accumulatedResearchCost: finalAccumulated,
      researchCycleTurn: finalTurn,
      doctrines: {
        ...currentDoctrines,
        doctrinePoints: newPoints,
      },
    };
  }
}
