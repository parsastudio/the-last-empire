import {
  GameAction,
  ActionFactory,
  Nation,
  CountryRegistry,
  MilitaryPowerCalculator,
  MILITARY_UNIT_STATS,
  DebtCalculatorUtility,
  NationGettersUtility,
} from "@geopolitics/domain";

export class AIWartimeLoanEvaluator {
  public static evaluateWartimeLoan(
    nation: Nation,
    allNations: Record<string, Nation>,
    gdp: number,
    currentTreasury: number,
  ): { action: GameAction; amount: number } | null {
    const availableLoanHeadroom =
      DebtCalculatorUtility.getAvailableLoanHeadroom(nation.nationalDebt, gdp);

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

  public static findPrimaryWartimeEnemy(
    nation: Nation,
    allNations: Record<string, Nation>,
  ): Nation | null {
    if (nation.warFocusTargetId) {
      const canonical = CountryRegistry.resolveCanonicalId(
        nation.warFocusTargetId,
      );
      const focus = NationGettersUtility.resolveNation(canonical, allNations);
      if (focus && focus.isAlive) {
        return focus;
      }
    }

    for (const [targetId, rel] of Object.entries(nation.relations || {})) {
      if (rel.stance === "WAR") {
        const canonical = CountryRegistry.resolveCanonicalId(targetId);
        const enemy = NationGettersUtility.resolveNation(canonical, allNations);
        if (enemy && enemy.isAlive && enemy.id !== nation.id) {
          return enemy;
        }
      }
    }

    return null;
  }
}
