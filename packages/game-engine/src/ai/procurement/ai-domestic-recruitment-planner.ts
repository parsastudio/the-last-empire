import {
  GameAction,
  ActionFactory,
  Nation,
  UnitType,
} from "@geopolitics/domain";
import { UnitBudgetQuota } from "@geopolitics/domain";

export interface DomesticRecruitmentPlanResult {
  actions: GameAction[];
  spentMoney: number;
  remainingGlobalValuation: number;
}

export class AIDomesticRecruitmentPlanner {
  public static planDomestic(
    nation: Nation,
    quotas: Record<UnitType, UnitBudgetQuota>,
    targetDomesticBudget: number,
    globalRemainingValuation: number,
    unitTypes: UnitType[],
  ): DomesticRecruitmentPlanResult {
    const actions: GameAction[] = [];
    let spentMoney = 0;

    const domesticDeficits: {
      unitType: UnitType;
      deficitMoney: number;
      unitPrice: number;
      maxAllowedUnits: number;
    }[] = [];
    let totalDomesticDeficitMoney = 0;

    for (let i = 0; i < unitTypes.length; i++) {
      const type = unitTypes[i]!;
      const q = quotas[type];
      if (!q || q.remainingRoom <= 0 || q.unitPrice <= 0) continue;

      const deficitMoney = q.remainingRoom * q.unitPrice;
      domesticDeficits.push({
        unitType: type,
        deficitMoney,
        unitPrice: q.unitPrice,
        maxAllowedUnits: q.remainingRoom,
      });
      totalDomesticDeficitMoney += deficitMoney;
    }

    if (domesticDeficits.length === 0 || totalDomesticDeficitMoney <= 0) {
      return {
        actions,
        spentMoney: 0,
        remainingGlobalValuation,
      };
    }

    let remainingDomBudget = Math.min(
      targetDomesticBudget,
      globalRemainingValuation,
    );

    for (let i = 0; i < domesticDeficits.length; i++) {
      const { unitType, deficitMoney, unitPrice, maxAllowedUnits } =
        domesticDeficits[i]!;
      const shareOfDeficit = deficitMoney / totalDomesticDeficitMoney;
      const allocatedMoney = Math.min(
        remainingDomBudget,
        Math.floor(targetDomesticBudget * shareOfDeficit),
      );

      const wantedQuantity = Math.floor(allocatedMoney / unitPrice);
      const quantity = Math.min(wantedQuantity, maxAllowedUnits);

      if (quantity > 0) {
        const cost = quantity * unitPrice;
        actions.push(ActionFactory.recruitUnit(nation.id, unitType, quantity));
        remainingDomBudget -= cost;
        spentMoney += cost;
      }
    }

    return {
      actions,
      spentMoney,
      remainingGlobalValuation: Math.max(
        0,
        globalRemainingValuation - spentMoney,
      ),
    };
  }
}
