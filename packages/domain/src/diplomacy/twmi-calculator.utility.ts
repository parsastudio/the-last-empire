import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import { MilitaryPricingCalculator } from "@/domain/military/military-pricing-calculator.utility";
import { DebtCalculatorUtility } from "@/domain/economy/debt-calculator.utility";
import { GuarantorBudgetCalculatorUtility } from "@/domain/diplomacy/guarantor-budget-calculator.utility";
import { SecurityFeeCalculatorUtility } from "@/domain/diplomacy/security-fee-calculator.utility";
import { NationGettersUtility } from "@/domain/nation/nation-getters.utility";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { FiscalRevenueCalculator } from "@/domain/economy/fiscal-revenue-calculator";
import { MilitaryPayrollCalculator } from "@/domain/economy/payroll-calculator";
import { NAVAL_FLEET_CONFIG } from "@/domain/military/naval-fleet.config";

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

    const fiscalBreakdown = FiscalRevenueCalculator.calculate(
      nation,
      nationsMap,
      provincesMap,
    );
    const payrollBreakdown = MilitaryPayrollCalculator.calculatePayroll(
      nation,
      provincesMap,
    );

    const navalSecurityIncome = Math.floor(
      (nation.navalFleet || 0) *
        NAVAL_FLEET_CONFIG.FLEET_UNIT_COST *
        NAVAL_FLEET_CONFIG.TURN_REVENUE_RATE,
    );

    let warSubsidiesIncome = 0;
    const isAtWar = Object.values(nation.relations || {}).some(
      (r) => r.stance === "WAR",
    );

    if (isAtWar && nationsMap) {
      for (const rel of Object.values(nation.relations || {})) {
        if (rel.stance === "STRATEGIC_PARTNERSHIP") {
          const partner = NationGettersUtility.resolveNation(
            rel.targetNationId,
            nationsMap,
          );
          if (partner && partner.isAlive) {
            const partnerGdp = getNationGdp(partner, provincesMap);
            const subsidy = Math.floor(partnerGdp * 0.005);
            if (partner.treasury >= subsidy && subsidy > 0) {
              warSubsidiesIncome += subsidy;
            }
          }
        }
      }
    }

    const totalGrossRevenue =
      fiscalBreakdown.totalRevenue + navalSecurityIncome + warSubsidiesIncome;

    const maintenanceCost = payrollBreakdown.total;
    const debtInterest = DebtCalculatorUtility.calculateInterest(
      nation.nationalDebt,
    );
    const securityFee =
      nation.securityGuarantorId && nation.isEmergencyProtectorate
        ? SecurityFeeCalculatorUtility.calculateSecurityFee(gdp, true)
        : 0;

    const totalExpenses = maintenanceCost + debtInterest + securityFee;
    const netTurnIncome = totalGrossRevenue - totalExpenses;

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
