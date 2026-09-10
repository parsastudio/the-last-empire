import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { DebtCalculatorUtility } from "@/domain/economy/debt-calculator.utility";
import { GuarantorBudgetCalculatorUtility } from "@/domain/diplomacy/guarantor-budget-calculator.utility";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { NationalBudgetCalculator } from "@/domain/economy/national-budget-calculator";

export class TwmiCalculatorUtility {
  public static calculateTwmi(
    nation: Nation,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, ProvinceDynamicState>,
  ): number {
    const gdp = getNationGdp(nation, provincesMap);
    const treasury = Math.max(0, nation.treasury);
    const loanHeadroom = DebtCalculatorUtility.getAvailableLoanHeadroom(
      nation.nationalDebt,
      gdp,
    );

    const armyValuation = MilitaryPricingCalculator.calculateTotalArmyValuation(
      nation.military,
    );

    const budget = NationalBudgetCalculator.calculate(
      nation,
      nationsMap,
      provincesMap,
      nation.treasury,
      1.0,
    );

    let guarantorValuation = 0;
    if (
      nation.securityGuarantorId &&
      nation.isEmergencyProtectorate &&
      nationsMap
    ) {
      const guarantor = NationGettersUtility.resolveNation(
        nation.securityGuarantorId,
        nationsMap,
      );
      if (guarantor && guarantor.isAlive) {
        const guarantorGdp = getNationGdp(guarantor, provincesMap);
        guarantorValuation = GuarantorBudgetCalculatorUtility.calculateBudget(
          gdp,
          guarantorGdp,
          true,
        );
      }
    }

    const totalScore =
      treasury +
      loanHeadroom +
      Math.max(0, budget.netIncome) +
      armyValuation +
      guarantorValuation;

    const activeWarsCount = NationRelationResolver.countActiveWars(
      nation,
      nationsMap,
    );
    const dispersionFactor = 1 + 0.5 * Math.max(0, activeWarsCount - 1);

    return Math.max(1_000_000_000, Math.floor(totalScore / dispersionFactor));
  }
}
