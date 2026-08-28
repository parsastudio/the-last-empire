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
  AI_DOCTRINE_PRESETS,
  NationGettersUtility,
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
    const weights =
      nation.doctrineWeights ??
      AI_DOCTRINE_PRESETS[nation.doctrine || "DOMESTIC_INDUSTRIALIST"];

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
      const eligibleSellers = this.findEligibleArmsSellers(nation, allNations);

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
    const currentCapacity = currentFleet * 60;
    const targetCapacity = Math.floor(totalInfantry * 0.5);
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

  private static findEligibleArmsSellers(
    buyer: Nation,
    allNations: Record<string, Nation>,
  ): Nation[] {
    const sellers: Nation[] = [];
    const canonicalBuyer = CountryRegistry.resolveCanonicalId(buyer.id);

    for (const seller of Object.values(allNations)) {
      if (!seller.isAlive || seller.id === buyer.id) continue;
      const canonicalSeller = CountryRegistry.resolveCanonicalId(seller.id);
      if (canonicalSeller === canonicalBuyer) continue;

      const rel =
        seller.relations[canonicalBuyer] || seller.relations[buyer.id];
      const stance = rel ? rel.stance : "NORMAL_DIPLOMACY";
      const tension = rel ? (rel.tension ?? 10) : 10;

      if (stance !== "WAR" && tension < 50) {
        sellers.push(seller);
      }
    }

    sellers.sort((a, b) => b.military.techLevel - a.military.techLevel);
    return sellers;
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
        MilitaryPowerCalculator.calculateTechMultiplier(
          nation.military.techLevel,
        ),
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
    peacetimeCap = 0.5,
  ): number {
    const disposable = Math.max(0, effectiveTreasury);
    if (disposable <= 0) return 0;

    let postureMultiplier = peacetimeCap * 0.7;
    if (posture === "THREAT") postureMultiplier = Math.max(0.65, peacetimeCap);
    else if (posture === "WAR") postureMultiplier = 0.9;

    return Math.floor(disposable * postureMultiplier);
  }
}
