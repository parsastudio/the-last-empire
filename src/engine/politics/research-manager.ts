import { Nation } from "@/domain/nation/nation.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { COMPREHENSIVE_RESEARCH_TREE } from "@/domain/politics/research-tree.config";

export class ResearchManager {
  public static getMilitaryTechCost(nation: Nation): number {
    const level = nation.military.techLevel || 1;
    return Math.max(5000000000, Math.floor(nation.gdp * 0.1 * level));
  }

  public investInMilitaryTech(nation: Nation): Nation {
    const cost = ResearchManager.getMilitaryTechCost(nation);
    if (nation.treasury < cost) {
      throw new GameError(
        "INSUFFICIENT_FUNDS",
        "موجودی خزانه برای ارتقای فناوری نظامی کافی نیست.",
      );
    }

    return {
      ...nation,
      treasury: nation.treasury - cost,
      military: {
        ...nation.military,
        techLevel: nation.military.techLevel + 1,
      },
    };
  }

  public setResearchBudget(nation: Nation, newRate: number): Nation {
    const clampedRate = Math.min(30, Math.max(0, newRate));
    const isRateChanged = clampedRate !== nation.researchBudgetRate;

    return {
      ...nation,
      researchBudgetRate: clampedRate,
      accumulatedResearchCost: isRateChanged
        ? 0
        : nation.accumulatedResearchCost,
      researchCycleTurn: isRateChanged ? 0 : nation.researchCycleTurn,
    };
  }

  public processTurnResearch(nation: Nation): Nation {
    if (nation.researchBudgetRate <= 0) {
      return nation;
    }

    const turnCost = Math.floor(nation.gdp * (nation.researchBudgetRate / 100));
    let newTreasury = nation.treasury - turnCost;
    let newDebt = nation.nationalDebt;

    if (newTreasury < 0) {
      newDebt += Math.abs(newTreasury);
      newTreasury = 0;
    }

    const nextCycleTurn = nation.researchCycleTurn + 1;
    const nextAccumulated = nation.accumulatedResearchCost + turnCost;

    if (nextCycleTurn >= 3) {
      return {
        ...nation,
        treasury: newTreasury,
        nationalDebt: newDebt,
        researchCycleTurn: 0,
        accumulatedResearchCost: 0,
      };
    }

    return {
      ...nation,
      treasury: newTreasury,
      nationalDebt: newDebt,
      researchCycleTurn: nextCycleTurn,
      accumulatedResearchCost: nextAccumulated,
    };
  }

  public unlockDoctrine(nation: Nation, doctrineId: string): Nation {
    const node = COMPREHENSIVE_RESEARCH_TREE.find((d) => d.id === doctrineId);
    if (!node) {
      throw new GameError("INVALID_ACTION", "دکترین مورد نظر یافت نشد.");
    }

    const currentUnlocked = nation.doctrines?.unlockedDoctrines || [];
    if (currentUnlocked.includes(doctrineId)) {
      throw new GameError("INVALID_ACTION", "این دکترین قبلاً آنلاک شده است.");
    }

    const missingPrereqs = node.prerequisites.filter(
      (req) => !currentUnlocked.includes(req),
    );
    if (missingPrereqs.length > 0) {
      throw new GameError(
        "INVALID_ACTION",
        "پیش‌نیازهای این دکترین هنوز آنلاک نشده‌اند.",
      );
    }

    if (nation.treasury < node.moneyCost) {
      throw new GameError("INSUFFICIENT_FUNDS", "موجودی خزانه کافی نیست.");
    }

    if (node.oilCost > 0 && nation.resources.oil < node.oilCost) {
      throw new GameError(
        "INSUFFICIENT_RESOURCES",
        "ذخایر نفت استراتژیک کافی نیست.",
      );
    }

    return {
      ...nation,
      treasury: nation.treasury - node.moneyCost,
      resources: {
        ...nation.resources,
        oil: Math.max(0, nation.resources.oil - node.oilCost),
      },
      doctrines: {
        ...nation.doctrines,
        unlockedDoctrines: [...currentUnlocked, doctrineId],
      },
    };
  }
}
