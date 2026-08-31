import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { DebtCalculatorUtility } from "@/domain/economy/debt-calculator.utility";
import { GuarantorBudgetCalculatorUtility } from "@/domain/diplomacy/guarantor-budget-calculator.utility";
import { SecurityFeeCalculatorUtility } from "@/domain/diplomacy/security-fee-calculator.utility";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";

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

    let totalPeaceGdp = 0;
    if (nationsMap) {
      for (const other of Object.values(nationsMap)) {
        if (other.isAlive && other.id !== nation.id) {
          const isEmbargoed = NationRelationResolver.isTradeEmbargoed(
            nation,
            other,
          );
          if (!isEmbargoed) {
            totalPeaceGdp += getNationGdp(other, provincesMap);
          }
        }
      }
    }

    const hasSea = NationGettersUtility.hasSeaAccess(nation.id, provincesMap);
    const transitRevenue = Math.floor(
      totalPeaceGdp * 0.0005 * (hasSea ? 1.0 : 0.5),
    );
    const domesticRevenue = Math.floor(gdp * 0.08);
    const estimatedRevenue = domesticRevenue + transitRevenue;

    const estimatedPayroll = Math.floor(armyValuation * 0.06);
    const debtInterest = Math.floor(nation.nationalDebt * 0.07);
    const securityFee = nation.securityGuarantorId
      ? SecurityFeeCalculatorUtility.calculateSecurityFee(
          gdp,
          Boolean(nation.isEmergencyProtectorate),
        )
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

    const activeWarsCount = NationRelationResolver.countActiveWars(
      nation,
      nationsMap,
    );
    const dispersionFactor = 1 + 0.5 * Math.max(0, activeWarsCount - 1);

    return Math.max(1_000_000_000, Math.floor(totalScore / dispersionFactor));
  }
}
