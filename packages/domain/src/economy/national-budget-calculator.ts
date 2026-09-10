import { Nation } from "@/domain/nation/nation.schema";
import { ProvinceDynamicState } from "@/domain/province/province.schema";
import { getNationGdp } from "@/domain/nation/gdp-calculator.utility";
import {
  FiscalRevenueCalculator,
  FiscalRevenueBreakdown,
} from "@/domain/economy/fiscal-revenue-calculator";
import {
  MilitaryPayrollCalculator,
  BreakdownMilitaryPayroll,
} from "@/domain/economy/payroll-calculator";
import { NAVAL_FLEET_CONFIG } from "@/domain/military/naval-fleet.config";
import { DebtCalculatorUtility } from "@/domain/economy/debt-calculator.utility";
import { SecurityFeeCalculatorUtility } from "@/domain/diplomacy/security-fee-calculator.utility";
import { StrategicPartnershipCalculatorUtility } from "@/domain/diplomacy/strategic-partnership-calculator.utility";
import { NationalProjectEffectApplierUtility } from "@/domain/projects/national-project-effect-applier.utility";
import { NationRelationResolver } from "@/domain/diplomacy/nation-relation-resolver.utility";
import { CountryRegistry } from "@/domain/data/countries";

export interface NationalBudgetBreakdown {
  gdp: number;
  fiscalRevenue: FiscalRevenueBreakdown;
  navalSecurityIncome: number;
  partnershipIncome: number;
  petroTributeIncome: number;
  grossRevenue: number;
  payrollBreakdown: BreakdownMilitaryPayroll;
  debtInterest: number;
  securityFee: number;
  fixedExpenses: number;
  turnSurplus: number;
  netIncome: number;
  totalDisposable: number;
  isEmbargoed: boolean;
}

export class NationalBudgetCalculator {
  public static calculate(
    nation: Nation,
    allNations?: Record<string, Nation>,
    provincesMap?: Record<string, ProvinceDynamicState>,
    availableTreasury?: number,
    aiRevenueMultiplier: number = FiscalRevenueCalculator.DEFAULT_AI_REVENUE_MULTIPLIER,
    precomputedGdpMap?: Map<string, number>,
    precomputedTotalWorldGdp?: number,
  ): NationalBudgetBreakdown {
    const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
    const gdp =
      precomputedGdpMap?.get(canonicalId) ?? getNationGdp(nation, provincesMap);
    const treasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    const fiscalRevenue = FiscalRevenueCalculator.calculate(
      nation,
      allNations,
      provincesMap,
      aiRevenueMultiplier,
      precomputedGdpMap,
      precomputedTotalWorldGdp,
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

    let partnershipIncome = 0;
    if (allNations) {
      for (const rel of Object.values(nation.relations || {})) {
        if (rel.stance === "STRATEGIC_PARTNERSHIP") {
          const partnerCanonical = CountryRegistry.resolveCanonicalId(
            rel.targetNationId,
          );
          const partner =
            allNations[partnerCanonical] || allNations[rel.targetNationId];
          if (partner && partner.isAlive) {
            const partnerGdp =
              precomputedGdpMap?.get(partnerCanonical) ??
              getNationGdp(partner, provincesMap);
            partnershipIncome +=
              StrategicPartnershipCalculatorUtility.calculateTurnDividend(
                partnerGdp,
              );
          }
        }
      }
    }

    const petroTributeRate =
      NationalProjectEffectApplierUtility.getCombinedBonus(
        nation.completedProjectIds,
        "petroTributeShare",
      );

    let petroTributeIncome = 0;
    if (petroTributeRate > 0 && allNations) {
      for (const other of Object.values(allNations)) {
        if (!other.isAlive || other.id === nation.id) continue;
        const isAtWar = NationRelationResolver.isWar(
          nation.relations,
          other.id,
        );
        if (!isAtWar) {
          const otherCanonical = CountryRegistry.resolveCanonicalId(other.id);
          const otherGdp =
            precomputedGdpMap?.get(otherCanonical) ??
            getNationGdp(other, provincesMap);
          petroTributeIncome += Math.floor(otherGdp * petroTributeRate);
        }
      }
    }

    const grossRevenue =
      fiscalRevenue.totalRevenue +
      navalSecurityIncome +
      partnershipIncome +
      petroTributeIncome;

    const debtInterest = DebtCalculatorUtility.calculateInterest(
      nation.nationalDebt,
    );

    const securityFee =
      nation.securityGuarantorId && nation.isEmergencyProtectorate
        ? SecurityFeeCalculatorUtility.calculateSecurityFee(gdp, true)
        : 0;

    const fixedExpenses = payrollBreakdown.total + debtInterest + securityFee;
    const netIncome = grossRevenue - fixedExpenses;
    const turnSurplus = Math.max(0, netIncome);
    const totalDisposable = Math.max(0, treasury + turnSurplus);
    const isEmbargoed = (nation.globalReputation ?? 50) <= -30;

    return {
      gdp,
      fiscalRevenue,
      navalSecurityIncome,
      partnershipIncome,
      petroTributeIncome,
      grossRevenue,
      payrollBreakdown,
      debtInterest,
      securityFee,
      fixedExpenses,
      turnSurplus,
      netIncome,
      totalDisposable,
      isEmbargoed,
    };
  }
}
