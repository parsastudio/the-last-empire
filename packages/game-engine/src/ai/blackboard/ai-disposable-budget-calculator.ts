import {
  Nation,
  ProvinceDynamicState,
  FiscalRevenueCalculator,
  MilitaryPayrollCalculator,
  DebtCalculatorUtility,
  SecurityFeeCalculatorUtility,
  NAVAL_FLEET_CONFIG,
  CountryRegistry,
  getNationGdp,
} from "@geopolitics/domain";

export interface AiDisposableBudgetBreakdown {
  gdp: number;
  grossRevenue: number;
  fixedExpenses: number;
  turnSurplus: number;
  totalDisposable: number;
  isEmbargoed: boolean;
}

export class AiDisposableBudgetCalculator {
  public static calculate(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, ProvinceDynamicState>,
    availableTreasury?: number,
    precomputedGdpMap?: Map<string, number>,
    precomputedTotalWorldGdp?: number,
  ): AiDisposableBudgetBreakdown {
    const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
    const gdp =
      precomputedGdpMap?.get(canonicalId) ?? getNationGdp(nation, provincesMap);
    const treasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    const fiscalBreakdown = FiscalRevenueCalculator.calculate(
      nation,
      allNations,
      provincesMap,
      FiscalRevenueCalculator.DEFAULT_AI_REVENUE_MULTIPLIER,
      precomputedGdpMap,
      precomputedTotalWorldGdp,
    );

    const payrollBreakdown = MilitaryPayrollCalculator.calculatePayroll(
      nation,
      provincesMap,
    );

    const navalIncome = Math.floor(
      (nation.navalFleet || 0) *
        NAVAL_FLEET_CONFIG.FLEET_UNIT_COST *
        NAVAL_FLEET_CONFIG.TURN_REVENUE_RATE,
    );

    const grossRevenue = fiscalBreakdown.totalRevenue + navalIncome;
    const debtInterest = DebtCalculatorUtility.calculateInterest(
      nation.nationalDebt,
    );
    const securityFee = nation.securityGuarantorId
      ? SecurityFeeCalculatorUtility.calculateSecurityFee(
          gdp,
          Boolean(nation.isEmergencyProtectorate),
        )
      : 0;

    const fixedExpenses = payrollBreakdown.total + debtInterest + securityFee;
    const turnSurplus = Math.max(0, grossRevenue - fixedExpenses);
    const totalDisposable = Math.max(0, treasury + turnSurplus);
    const isEmbargoed = nation.globalReputation <= -30;

    return {
      gdp,
      grossRevenue,
      fixedExpenses,
      turnSurplus,
      totalDisposable,
      isEmbargoed,
    };
  }
}
