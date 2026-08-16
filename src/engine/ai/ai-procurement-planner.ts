import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { UnitType } from "@/domain/military/military.schema";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { AIThreatCalculator } from "@/engine/ai/ai-threat-calculator";
import { CountryRegistry } from "@/domain/data/countries";
import { AiEconomyCalculator } from "@/engine/ai/ai-economy-calculator";

export type AIPosture = "PEACE" | "THREAT" | "WAR";

interface UnitBudgetRatio {
  unitType: UnitType;
  ratio: number;
}

export class AIProcurementPlanner {
  public static planRecruitment(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    availableTreasury?: number,
  ): GameAction[] {
    const gdp = getNationGdp(nation);
    const aliveCount = Object.values(allNations).filter(
      (n) => n.isAlive,
    ).length;
    const maxArmyValuation = AiEconomyCalculator.calculateMaxArmyValuation(
      gdp,
      nation.rank,
      aliveCount,
    );

    const currentArmyValuation = this.calculateTotalArmyValuation(nation);
    const remainingValuationCapacity = Math.max(
      0,
      maxArmyValuation - currentArmyValuation,
    );

    if (remainingValuationCapacity <= 0) {
      return [];
    }

    const posture = this.evaluatePosture(nation, allNations, provincesMap);
    const effectiveTreasury = availableTreasury ?? nation.treasury;
    const spendableBudget = Math.min(
      this.calculateSpendableBudget(nation, posture, effectiveTreasury),
      remainingValuationCapacity,
    );

    if (spendableBudget <= 0) {
      return [];
    }

    const ratios = this.getUnitRatios(
      nation.military.techLevel,
      nation.geography.hasSeaAccess,
      posture,
      nation.military.infantry,
    );

    const actions: GameAction[] = [];
    let remainingBudget = spendableBudget;

    for (let i = 0; i < ratios.length; i++) {
      const { unitType, ratio } = ratios[i]!;
      const unitBudget = Math.floor(spendableBudget * ratio);
      const allocatedMoney = Math.min(remainingBudget, unitBudget);

      const unitPrice = MilitaryPricingCalculator.calculateUnitTypePrice(
        unitType,
        nation.military.techLevel,
        nation.industrialLevel,
      );

      if (unitPrice <= 0) continue;

      const quantity = Math.floor(allocatedMoney / unitPrice);

      if (quantity > 0) {
        actions.push(ActionFactory.recruitUnit(nation.id, unitType, quantity));
        remainingBudget -= quantity * unitPrice;
      }
    }

    return actions;
  }

  public static calculateTotalArmyValuation(nation: Nation): number {
    const landAndAirValuation =
      MilitaryPricingCalculator.calculateLandAndAirValuation(
        nation.military,
        nation.industrialLevel,
      );

    const navalUnitPrice = MilitaryPricingCalculator.calculateUnitTypePrice(
      "NAVAL_FLEET",
      nation.military.techLevel,
      nation.industrialLevel,
    );
    const navalValuation = (nation.military.navalFleet || 0) * navalUnitPrice;

    return landAndAirValuation + navalValuation;
  }

  public static evaluatePosture(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
  ): AIPosture {
    if (nation.warFocusTargetId) {
      return "WAR";
    }

    for (const [targetId, rel] of Object.entries(nation.relations || {})) {
      if (rel.stance === "WAR") {
        return "WAR";
      }

      const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
      const target = allNations[targetId] || allNations[canonicalTarget];

      if (target && target.isAlive && target.id !== nation.id) {
        const evalResult = AIThreatCalculator.evaluate(
          nation,
          target,
          provincesMap,
        );

        if (
          evalResult.isNeighbor &&
          (evalResult.threatScore >= 50 || rel.opinion <= -30)
        ) {
          return "THREAT";
        }
      }
    }

    return "PEACE";
  }

  public static calculateSpendableBudget(
    nation: Nation,
    posture: AIPosture,
    effectiveTreasury?: number,
  ): number {
    const gdp = getNationGdp(nation);
    const reserveFloor = Math.floor(gdp * 0.05);
    const currentMoney = effectiveTreasury ?? nation.treasury;
    const disposable = Math.max(0, currentMoney - reserveFloor);

    if (disposable <= 0) {
      return 0;
    }

    let postureMultiplier = 0.35;
    if (posture === "THREAT") {
      postureMultiplier = 0.65;
    } else if (posture === "WAR") {
      postureMultiplier = 0.9;
    }

    return Math.floor(disposable * postureMultiplier);
  }

  private static getUnitRatios(
    techLevel: number,
    hasSeaAccess: boolean,
    posture: AIPosture,
    currentInfantry: number,
  ): UnitBudgetRatio[] {
    if (posture === "WAR" && currentInfantry <= 3) {
      return [
        { unitType: "INFANTRY", ratio: 0.7 },
        { unitType: "ARMOR", ratio: techLevel >= 2 ? 0.2 : 0.0 },
        { unitType: "DRONE_MISSILE", ratio: 0.1 },
      ];
    }

    switch (techLevel) {
      case 1:
        return [
          { unitType: "INFANTRY", ratio: 0.85 },
          { unitType: "DRONE_MISSILE", ratio: 0.15 },
        ];

      case 2:
        return [
          { unitType: "INFANTRY", ratio: 0.5 },
          { unitType: "ARMOR", ratio: 0.4 },
          { unitType: "DRONE_MISSILE", ratio: 0.1 },
        ];

      case 3:
        return [
          { unitType: "INFANTRY", ratio: 0.35 },
          { unitType: "ARMOR", ratio: 0.35 },
          { unitType: "AIR_DEFENSE", ratio: 0.2 },
          { unitType: "DRONE_MISSILE", ratio: 0.1 },
        ];

      case 4:
        return [
          { unitType: "AIR_FORCE", ratio: 0.3 },
          { unitType: "ARMOR", ratio: 0.3 },
          { unitType: "INFANTRY", ratio: 0.25 },
          { unitType: "AIR_DEFENSE", ratio: 0.15 },
        ];

      case 5:
      default:
        if (hasSeaAccess) {
          return [
            { unitType: "NAVAL_FLEET", ratio: 0.3 },
            { unitType: "AIR_FORCE", ratio: 0.25 },
            { unitType: "ARMOR", ratio: 0.25 },
            { unitType: "INFANTRY", ratio: 0.1 },
            { unitType: "AIR_DEFENSE", ratio: 0.1 },
          ];
        }
        return [
          { unitType: "AIR_FORCE", ratio: 0.35 },
          { unitType: "ARMOR", ratio: 0.35 },
          { unitType: "INFANTRY", ratio: 0.15 },
          { unitType: "AIR_DEFENSE", ratio: 0.15 },
        ];
    }
  }
}
