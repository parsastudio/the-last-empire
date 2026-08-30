import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { DebtCalculatorUtility } from "@/domain/economy/debt-calculator.utility";
import { GuarantorBudgetCalculatorUtility } from "@/domain/diplomacy/guarantor-budget-calculator.utility";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";

export class TwmiCalculatorUtility {
  public static calculateTwmi(
    nation: Nation,
    nationsMap?: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
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

    const estimatedRevenue = Math.floor(gdp * 0.05);
    const estimatedPayroll = Math.min(
      Math.floor(gdp * 0.06),
      Math.floor(armyValuation * 0.06),
    );
    const debtInterest = Math.floor(nation.nationalDebt * 0.07);
    const securityFeeRatio = nation.isEmergencyProtectorate ? 0.3 : 0.1;
    const securityFee = nation.securityGuarantorId
      ? Math.floor(gdp * securityFeeRatio)
      : 0;

    const netTurnIncome =
      estimatedRevenue - (estimatedPayroll + debtInterest + securityFee);

    let guarantorValuation = 0;
    if (nation.securityGuarantorId && nationsMap) {
      const guarantor = NationGettersUtility.resolveNation(
        nation.securityGuarantorId,
        nationsMap,
      );
      if (guarantor && guarantor.isAlive) {
        const guarantorGdp = getNationGdp(guarantor, provincesMap);
        guarantorValuation = GuarantorBudgetCalculatorUtility.calculateBudget(
          gdp,
          guarantorGdp,
          Boolean(nation.isEmergencyProtectorate),
        );
      }
    }

    const totalScore =
      treasury +
      loanHeadroom +
      Math.max(0, netTurnIncome) +
      armyValuation +
      guarantorValuation;

    let activeWarsCount = 0;
    if (nationsMap && nation.relations) {
      const sourceCanonical = CountryRegistry.resolveCanonicalId(nation.id);
      for (const [targetId, rel] of Object.entries(nation.relations)) {
        if (rel.stance === "WAR") {
          const canonicalTarget = CountryRegistry.resolveCanonicalId(targetId);
          if (canonicalTarget !== sourceCanonical) {
            const enemy = NationGettersUtility.resolveNation(
              canonicalTarget,
              nationsMap,
            );
            if (enemy && enemy.isAlive) {
              activeWarsCount++;
            }
          }
        }
      }
    }

    const dispersionFactor = 1 + 0.5 * Math.max(0, activeWarsCount - 1);
    return Math.max(1_000_000_000, Math.floor(totalScore / dispersionFactor));
  }
}
