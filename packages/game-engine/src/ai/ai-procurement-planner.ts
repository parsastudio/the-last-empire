import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  UnitType,
  MilitaryPricingCalculator,
  getNationGdp,
  NationGettersUtility,
  GeopoliticalReachResolver,
  CountryRegistry,
} from "@geopolitics/domain";
import { AiEconomyCalculator } from "@/engine/ai/ai-economy-calculator";
import {
  GeopoliticalVectorCalculator,
  GeopoliticalVector,
} from "@/engine/ai/geopolitical-vector-calculator";

export type AIPosture = "PEACE" | "THREAT" | "WAR";

export interface RecruitmentPlanResult {
  actions: GameAction[];
  remainingTreasury: number;
}

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
    rankMap?: Map<string, number>,
    precomputedPosture?: AIPosture,
  ): RecruitmentPlanResult {
    const effectiveTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    const gdp = getNationGdp(nation, provincesMap);
    const aliveCount = Object.values(allNations).filter(
      (n) => n.isAlive,
    ).length;
    const nationRank = NationGettersUtility.getRank(
      nation.id,
      allNations,
      provincesMap,
      rankMap,
    );

    const maxArmyValuation = AiEconomyCalculator.calculateMaxArmyValuation(
      gdp,
      nationRank,
      aliveCount,
    );

    const currentArmyValuation = this.calculateTotalArmyValuation(nation);
    const remainingValuationCapacity = Math.max(
      0,
      maxArmyValuation - currentArmyValuation,
    );

    if (remainingValuationCapacity <= 0) {
      return { actions: [], remainingTreasury: effectiveTreasury };
    }

    const posture =
      precomputedPosture ??
      this.evaluatePosture(nation, allNations, provincesMap, rankMap);

    const spendableBudget = Math.min(
      this.calculateSpendableBudget(posture, effectiveTreasury),
      remainingValuationCapacity,
    );

    if (spendableBudget <= 0) {
      return { actions: [], remainingTreasury: effectiveTreasury };
    }

    const hasSea = NationGettersUtility.hasSeaAccess(nation.id, provincesMap);

    const ratios = this.getUnitRatios(
      nation.military.techLevel,
      hasSea,
      posture,
      nation.military.infantry,
    );

    const actions: GameAction[] = [];
    let remainingBudget = spendableBudget;
    let totalSpent = 0;

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
        const cost = quantity * unitPrice;
        actions.push(ActionFactory.recruitUnit(nation.id, unitType, quantity));
        remainingBudget -= cost;
        totalSpent += cost;
      }
    }

    return {
      actions,
      remainingTreasury: Math.max(0, effectiveTreasury - totalSpent),
    };
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

    let queuedValuation = 0;
    const queue = nation.recruitmentQueue || [];
    for (let i = 0; i < queue.length; i++) {
      queuedValuation += queue[i]!.totalCost;
    }

    return landAndAirValuation + navalValuation + queuedValuation;
  }

  public static evaluatePosture(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    rankMap?: Map<string, number>,
    vectorsByTarget?: Map<string, GeopoliticalVector>,
    reachableTargets?: Nation[],
  ): AIPosture {
    if (nation.warFocusTargetId) {
      return "WAR";
    }

    let maxTension = 0;

    const targets =
      reachableTargets ??
      GeopoliticalReachResolver.getReachableTargets(
        nation,
        allNations,
        provincesMap,
        rankMap,
      );

    for (const target of targets) {
      const canonicalTarget = CountryRegistry.resolveCanonicalId(target.id);
      const rel =
        nation.relations[canonicalTarget] || nation.relations[target.id];

      if (rel && rel.stance === "WAR") {
        return "WAR";
      }

      const vector =
        vectorsByTarget?.get(canonicalTarget) ??
        GeopoliticalVectorCalculator.calculate(
          nation,
          target,
          allNations,
          provincesMap,
        );

      if (vector.isNeighbor && vector.tension > maxTension) {
        maxTension = vector.tension;
      }
    }

    if (maxTension >= 55) return "THREAT";
    return "PEACE";
  }

  public static calculateSpendableBudget(
    posture: AIPosture,
    effectiveTreasury: number,
  ): number {
    const disposable = Math.max(0, effectiveTreasury);
    if (disposable <= 0) return 0;

    let postureMultiplier = 0.35;
    if (posture === "THREAT") postureMultiplier = 0.65;
    else if (posture === "WAR") postureMultiplier = 0.9;

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
