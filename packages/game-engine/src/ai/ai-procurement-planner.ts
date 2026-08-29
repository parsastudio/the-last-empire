import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  UnitType,
  MilitaryPricingCalculator,
  getNationGdp,
  MilitaryQuotaCalculator,
  AI_DOCTRINE_PRESETS,
  NationGettersUtility,
} from "@geopolitics/domain";
import {
  AIPosture,
  AIPostureEvaluator,
} from "@/engine/ai/procurement/ai-posture-evaluator";
import { AIWartimeLoanEvaluator } from "@/engine/ai/procurement/ai-wartime-loan-evaluator";
import { AIArmsSellerMatcher } from "@/engine/ai/procurement/ai-arms-seller-matcher";

export type { AIPosture };

export interface RecruitmentPlanResult {
  actions: GameAction[];
  remainingTreasury: number;
}

export class AIProcurementPlanner {
  public static evaluatePosture =
    AIPostureEvaluator.evaluatePosture.bind(AIPostureEvaluator);
  public static calculateSpendableBudget =
    AIPostureEvaluator.calculateSpendableBudget.bind(AIPostureEvaluator);

  public static planRecruitment(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    availableTreasury?: number,
    rankMap?: Map<string, number>,
    precomputedPosture?: AIPosture,
  ): RecruitmentPlanResult {
    let effectiveTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    const gdp = getNationGdp(nation, provincesMap);
    const posture =
      precomputedPosture ??
      AIPostureEvaluator.evaluatePosture(
        nation,
        allNations,
        provincesMap,
        rankMap,
      );

    const actions: GameAction[] = [];
    const weights =
      nation.doctrineWeights ??
      AI_DOCTRINE_PRESETS[nation.doctrine || "DOMESTIC_INDUSTRIALIST"];

    if (posture === "WAR") {
      const loanAction = AIWartimeLoanEvaluator.evaluateWartimeLoan(
        nation,
        allNations,
        gdp,
        effectiveTreasury,
      );
      if (loanAction) {
        actions.push(loanAction.action);
        effectiveTreasury += loanAction.amount;
      }
    }

    const spendableBudget = AIPostureEvaluator.calculateSpendableBudget(
      posture,
      effectiveTreasury,
      weights.peacetimeArmyCap,
    );

    if (spendableBudget <= 0) {
      return { actions, remainingTreasury: effectiveTreasury };
    }

    const quotas = MilitaryQuotaCalculator.calculateQuotas(
      gdp,
      nation.military,
      nation.recruitmentQueue,
    );

    const currentTotalValuation =
      MilitaryPricingCalculator.calculateTotalArmyValuation(nation.military);
    const maxArmyValuation =
      posture === "WAR"
        ? Math.floor(gdp)
        : posture === "THREAT"
          ? Math.floor(gdp * Math.max(weights.peacetimeArmyCap, 0.8))
          : Math.floor(gdp * weights.peacetimeArmyCap);

    let globalRemainingValuation = Math.max(
      0,
      maxArmyValuation - currentTotalValuation,
    );

    if (globalRemainingValuation <= 0) {
      return { actions, remainingTreasury: effectiveTreasury };
    }

    const importRatio = weights.armsImportRatio;
    let targetImportBudget = Math.floor(spendableBudget * importRatio);
    let targetDomesticBudget = spendableBudget - targetImportBudget;

    let totalSpent = 0;
    const unitTypes: UnitType[] = [
      "AIR_FORCE",
      "AIR_DEFENSE",
      "ARMOR",
      "DRONE_MISSILE",
      "INFANTRY",
    ];

    if (targetImportBudget > 0) {
      const eligibleSellers = AIArmsSellerMatcher.findEligibleArmsSellers(
        nation,
        allNations,
      );

      if (eligibleSellers.length > 0) {
        for (let i = 0; i < unitTypes.length; i++) {
          const type = unitTypes[i]!;
          const q = quotas[type];
          if (q.remainingRoom <= 0 || targetImportBudget <= 0) continue;

          const bestSeller = eligibleSellers[0]!;
          const unitPrice =
            MilitaryPricingCalculator.calculateArmsImportUnitPrice(
              type,
              nation.military.techLevel,
              bestSeller.military.techLevel,
            );

          const maxUnitsByMoney = Math.floor(targetImportBudget / unitPrice);
          const maxUnitsByValuation = Math.floor(
            globalRemainingValuation /
              MilitaryPricingCalculator.calculateUnitTypePrice(type),
          );
          const allowedUnits = Math.min(
            q.remainingRoom,
            maxUnitsByMoney,
            maxUnitsByValuation,
          );

          if (allowedUnits > 0) {
            const cost = allowedUnits * unitPrice;
            actions.push(
              ActionFactory.buyArmsMarket(
                nation.id,
                bestSeller.id,
                type,
                allowedUnits,
              ),
            );
            targetImportBudget -= cost;
            totalSpent += cost;
            globalRemainingValuation -=
              allowedUnits *
              MilitaryPricingCalculator.calculateUnitTypePrice(type);
            q.remainingRoom -= allowedUnits;
          }
        }
      } else {
        targetDomesticBudget += targetImportBudget;
        targetImportBudget = 0;
      }
    }

    if (targetDomesticBudget > 0 && globalRemainingValuation > 0) {
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
        if (q.remainingRoom <= 0 || q.unitPrice <= 0) continue;

        const deficitMoney = q.remainingRoom * q.unitPrice;
        domesticDeficits.push({
          unitType: type,
          deficitMoney,
          unitPrice: q.unitPrice,
          maxAllowedUnits: q.remainingRoom,
        });
        totalDomesticDeficitMoney += deficitMoney;
      }

      if (domesticDeficits.length > 0 && totalDomesticDeficitMoney > 0) {
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
            actions.push(
              ActionFactory.recruitUnit(nation.id, unitType, quantity),
            );
            remainingDomBudget -= cost;
            totalSpent += cost;
          }
        }
      }
    }

    effectiveTreasury = Math.max(0, effectiveTreasury - totalSpent);

    const hasSea = NationGettersUtility.hasSeaAccess(nation.id, provincesMap);
    const currentFleet = nation.navalFleet || 0;
    const totalInfantry = nation.military.infantry || 0;
    const totalArmor = nation.military.armor || 0;
    const currentCapacity = currentFleet * 60;
    const targetCapacity = totalInfantry * 1 + totalArmor * 4;
    const fleetCost = 50_000_000_000;

    if (
      hasSea &&
      effectiveTreasury >= 80_000_000_000 &&
      currentCapacity < targetCapacity
    ) {
      actions.push(ActionFactory.buyNavalFleet(nation.id, 1));
      effectiveTreasury -= fleetCost;
    }

    return {
      actions,
      remainingTreasury: effectiveTreasury,
    };
  }
}
