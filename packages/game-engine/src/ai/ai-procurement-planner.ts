import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  UnitType,
  MilitaryPricingCalculator,
  MILITARY_UNIT_STATS,
  getNationGdp,
  GeopoliticalReachResolver,
  CountryRegistry,
  MilitaryPowerCalculator,
  MilitaryQuotaCalculator,
} from "@geopolitics/domain";
import {
  GeopoliticalVectorCalculator,
  GeopoliticalVector,
} from "@/engine/ai/geopolitical-vector-calculator";

export type AIPosture = "PEACE" | "THREAT" | "WAR";

export interface RecruitmentPlanResult {
  actions: GameAction[];
  remainingTreasury: number;
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

    const quotas = MilitaryQuotaCalculator.calculateQuotas(
      gdp,
      nation.military,
      nation.recruitmentQueue,
    );

    const currentTotalValuation =
      MilitaryPricingCalculator.calculateTotalArmyValuation(nation.military);
    const maxArmyValuation = Math.floor(gdp);
    const globalRemainingValuation = Math.max(
      0,
      maxArmyValuation - currentTotalValuation,
    );

    if (globalRemainingValuation <= 0) {
      return { actions, remainingTreasury: effectiveTreasury };
    }

    const deficits: {
      unitType: UnitType;
      deficitMoney: number;
      unitPrice: number;
      maxAllowedUnits: number;
    }[] = [];
    let totalDeficitMoney = 0;

    const unitTypes: UnitType[] = [
      "INFANTRY",
      "ARMOR",
      "AIR_DEFENSE",
      "AIR_FORCE",
      "DRONE_MISSILE",
    ];

    for (let i = 0; i < unitTypes.length; i++) {
      const type = unitTypes[i]!;
      const q = quotas[type];
      if (q.remainingRoom <= 0 || q.unitPrice <= 0) continue;

      const stat = MILITARY_UNIT_STATS[type];
      if (Math.floor(nation.military.techLevel) < stat.requiredTechLevel)
        continue;

      const deficitMoney = q.remainingRoom * q.unitPrice;
      deficits.push({
        unitType: type,
        deficitMoney,
        unitPrice: q.unitPrice,
        maxAllowedUnits: q.remainingRoom,
      });
      totalDeficitMoney += deficitMoney;
    }

    if (deficits.length === 0 || totalDeficitMoney <= 0) {
      return { actions, remainingTreasury: effectiveTreasury };
    }

    let remainingBudget = Math.min(spendableBudget, globalRemainingValuation);
    let totalSpent = 0;

    for (let i = 0; i < deficits.length; i++) {
      const { unitType, deficitMoney, unitPrice, maxAllowedUnits } =
        deficits[i]!;
      const shareOfDeficit = deficitMoney / totalDeficitMoney;
      const allocatedMoney = Math.min(
        remainingBudget,
        Math.floor(spendableBudget * shareOfDeficit),
      );

      const wantedQuantity = Math.floor(allocatedMoney / unitPrice);
      const quantity = Math.min(wantedQuantity, maxAllowedUnits);

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
    const infPrice = MILITARY_UNIT_STATS.INFANTRY.moneyCost;

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
    const militaryValuation =
      MilitaryPricingCalculator.calculateTotalArmyValuation(nation.military);

    let queuedValuation = 0;
    const queue = nation.recruitmentQueue || [];
    for (let i = 0; i < queue.length; i++) {
      queuedValuation += queue[i]!.totalCost;
    }

    return militaryValuation + queuedValuation;
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
}
