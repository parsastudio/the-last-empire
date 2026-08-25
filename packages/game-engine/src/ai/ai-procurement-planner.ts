import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  UnitType,
  MilitaryPricingCalculator,
  MILITARY_UNIT_STATS,
  getNationGdp,
  NationGettersUtility,
  GeopoliticalReachResolver,
  CountryRegistry,
  MilitaryPowerCalculator,
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
    let effectiveTreasury =
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
      nation.government.type,
    );

    const posture =
      precomputedPosture ??
      this.evaluatePosture(nation, allNations, provincesMap, rankMap);

    const actions: GameAction[] = [];

    if (posture === "WAR") {
      const loanAction = this.evaluateWartimeLoan(
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

    const spendableBudget = this.calculateSpendableBudget(
      posture,
      effectiveTreasury,
    );

    if (spendableBudget <= 0) {
      return { actions, remainingTreasury: effectiveTreasury };
    }

    const hasSea = NationGettersUtility.hasSeaAccess(nation.id, provincesMap);

    const ratios = this.getUnitRatios(
      nation.military.techLevel,
      hasSea,
      posture,
      nation.military.infantry,
    );

    const deficits: {
      unitType: UnitType;
      deficit: number;
      unitPrice: number;
    }[] = [];
    let totalDeficit = 0;

    for (let i = 0; i < ratios.length; i++) {
      const { unitType, ratio } = ratios[i]!;
      const unitPrice = MilitaryPricingCalculator.calculateUnitTypePrice(
        unitType,
        nation.military.techLevel,
        nation.industrialLevel,
      );

      if (unitPrice <= 0) continue;

      const targetValuation = Math.floor(maxArmyValuation * ratio);
      const currentCount = this.getUnitCount(nation, unitType);
      const currentValuation = currentCount * unitPrice;

      const categoryDeficit = Math.max(0, targetValuation - currentValuation);

      if (posture === "WAR" && unitType === "INFANTRY" && currentCount <= 3) {
        const emergencyInfantryDeficit = Math.max(
          categoryDeficit,
          unitPrice * 5,
        );
        deficits.push({
          unitType,
          deficit: emergencyInfantryDeficit,
          unitPrice,
        });
        totalDeficit += emergencyInfantryDeficit;
      } else if (categoryDeficit > 0) {
        deficits.push({
          unitType,
          deficit: categoryDeficit,
          unitPrice,
        });
        totalDeficit += categoryDeficit;
      }
    }

    if (deficits.length === 0 || totalDeficit <= 0) {
      return { actions, remainingTreasury: effectiveTreasury };
    }

    let remainingBudget = spendableBudget;
    let totalSpent = 0;

    for (let i = 0; i < deficits.length; i++) {
      const { unitType, deficit, unitPrice } = deficits[i]!;
      const shareOfDeficit = deficit / totalDeficit;
      const allocatedMoney = Math.min(
        remainingBudget,
        Math.floor(spendableBudget * shareOfDeficit),
      );

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

  private static getUnitCount(nation: Nation, unitType: UnitType): number {
    switch (unitType) {
      case "INFANTRY":
        return nation.military.infantry || 0;
      case "ARMOR":
        return nation.military.armor || 0;
      case "AIR_DEFENSE":
        return nation.military.airDefense || 0;
      case "AIR_FORCE":
        return nation.military.airForce || 0;
      case "DRONE_MISSILE":
        return nation.military.droneMissile || 0;
      case "NAVAL_FLEET":
        return nation.military.navalFleet || 0;
    }
  }

  private static evaluateWartimeLoan(
    nation: Nation,
    allNations: Record<string, Nation>,
    gdp: number,
    currentTreasury: number,
  ): { action: GameAction; amount: number } | null {
    const maxDebtLimit = Math.floor(gdp * 0.8);
    const availableLoanHeadroom = Math.max(
      0,
      maxDebtLimit - nation.nationalDebt,
    );

    if (availableLoanHeadroom <= 0) {
      return null;
    }

    const activeEnemy = this.findPrimaryWartimeEnemy(nation, allNations);
    if (!activeEnemy) {
      return null;
    }

    const myPower = MilitaryPowerCalculator.calculateLandAndAirPower(nation);
    const enemyPower =
      MilitaryPowerCalculator.calculateLandAndAirPower(activeEnemy);
    const targetPower = Math.floor(enemyPower * 1.1);

    if (myPower >= targetPower) {
      return null;
    }

    const deficitPower = targetPower - myPower;
    const singleInfantryPower = Math.max(
      0.5,
      MILITARY_UNIT_STATS.INFANTRY.weightPower *
        (1 + (nation.military.techLevel - 1) * 0.5),
    );
    const infPrice = MilitaryPricingCalculator.calculateUnitTypePrice(
      "INFANTRY",
      nation.military.techLevel,
      nation.industrialLevel,
    );

    const neededInfantry = Math.ceil(deficitPower / singleInfantryPower);
    const budgetNeeded = neededInfantry * infPrice;

    if (currentTreasury >= budgetNeeded) {
      return null;
    }

    const loanAmount = Math.min(
      availableLoanHeadroom,
      budgetNeeded - currentTreasury,
    );

    if (loanAmount <= 0) {
      return null;
    }

    return {
      action: ActionFactory.requestLoan(nation.id, loanAmount),
      amount: loanAmount,
    };
  }

  private static findPrimaryWartimeEnemy(
    nation: Nation,
    allNations: Record<string, Nation>,
  ): Nation | null {
    if (nation.warFocusTargetId) {
      const canonical = CountryRegistry.resolveCanonicalId(
        nation.warFocusTargetId,
      );
      const focus =
        allNations[canonical] || allNations[nation.warFocusTargetId];
      if (focus && focus.isAlive) {
        return focus;
      }
    }

    for (const [targetId, rel] of Object.entries(nation.relations || {})) {
      if (rel.stance === "WAR") {
        const canonical = CountryRegistry.resolveCanonicalId(targetId);
        const enemy = allNations[canonical] || allNations[targetId];
        if (enemy && enemy.isAlive && enemy.id !== nation.id) {
          return enemy;
        }
      }
    }

    return null;
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
          { unitType: "INFANTRY", ratio: 0.8 },
          { unitType: "DRONE_MISSILE", ratio: 0.2 },
        ];
      case 2:
        return [
          { unitType: "INFANTRY", ratio: 0.45 },
          { unitType: "ARMOR", ratio: 0.45 },
          { unitType: "DRONE_MISSILE", ratio: 0.1 },
        ];
      case 3:
        return [
          { unitType: "ARMOR", ratio: 0.35 },
          { unitType: "INFANTRY", ratio: 0.3 },
          { unitType: "AIR_DEFENSE", ratio: 0.25 },
          { unitType: "DRONE_MISSILE", ratio: 0.1 },
        ];
      case 4:
        return [
          { unitType: "ARMOR", ratio: 0.3 },
          { unitType: "AIR_FORCE", ratio: 0.25 },
          { unitType: "INFANTRY", ratio: 0.2 },
          { unitType: "AIR_DEFENSE", ratio: 0.15 },
          { unitType: "DRONE_MISSILE", ratio: 0.1 },
        ];
      case 5:
      default:
        if (hasSeaAccess) {
          return [
            { unitType: "ARMOR", ratio: 0.25 },
            { unitType: "AIR_FORCE", ratio: 0.2 },
            { unitType: "INFANTRY", ratio: 0.15 },
            { unitType: "AIR_DEFENSE", ratio: 0.15 },
            { unitType: "NAVAL_FLEET", ratio: 0.15 },
            { unitType: "DRONE_MISSILE", ratio: 0.1 },
          ];
        }
        return [
          { unitType: "ARMOR", ratio: 0.3 },
          { unitType: "AIR_FORCE", ratio: 0.3 },
          { unitType: "INFANTRY", ratio: 0.15 },
          { unitType: "AIR_DEFENSE", ratio: 0.15 },
          { unitType: "DRONE_MISSILE", ratio: 0.1 },
        ];
    }
  }
}
