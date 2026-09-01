import {
  Nation,
  Province,
  AI_DOCTRINE_PRESETS,
  FiscalRevenueCalculator,
  MilitaryPayrollCalculator,
  DebtCalculatorUtility,
  SecurityFeeCalculatorUtility,
  NAVAL_FLEET_CONFIG,
  getNationGdp,
} from "@geopolitics/domain";
import { AIPosture } from "@/engine/ai/procurement/ai-posture-evaluator";

export interface AiStrategicWallets {
  innovation: number;
  globalMarket: number;
  domesticInfra: number;
  geopolitics: number;
  totalDisposable: number;
  isEmbargoed: boolean;
  posture: AIPosture;
}

export class AiWalletBudgetAllocator {
  public static calculateWallets(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    posture: AIPosture = "PEACE",
    availableTreasury?: number,
  ): AiStrategicWallets {
    const gdp = getNationGdp(nation, provincesMap);
    const treasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    const fiscalBreakdown = FiscalRevenueCalculator.calculate(
      nation,
      allNations,
      provincesMap,
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
    const weights =
      nation.doctrineWeights ??
      AI_DOCTRINE_PRESETS[nation.doctrine || "DOMESTIC_INDUSTRIALIST"];

    if (totalDisposable <= 0) {
      return {
        innovation: 0,
        globalMarket: 0,
        domesticInfra: 0,
        geopolitics: 0,
        totalDisposable: 0,
        isEmbargoed,
        posture,
      };
    }

    if (posture === "WAR") {
      const globalShare = isEmbargoed ? 0.0 : 0.6;
      const domesticShare = isEmbargoed ? 0.95 : 0.35;
      const geoShare = 0.05;

      return {
        innovation: 0,
        globalMarket: Math.floor(totalDisposable * globalShare),
        domesticInfra: Math.floor(totalDisposable * domesticShare),
        geopolitics: Math.floor(totalDisposable * geoShare),
        totalDisposable,
        isEmbargoed,
        posture,
      };
    }

    let rawInnovation = Math.floor(totalDisposable * weights.innovationWeight);
    let rawGlobalMarket = Math.floor(
      totalDisposable * weights.globalMarketWeight,
    );
    let rawDomesticInfra = Math.floor(
      totalDisposable * weights.domesticInfraWeight,
    );
    const rawGeopolitics = Math.floor(
      totalDisposable * weights.geopoliticsWeight,
    );

    if (isEmbargoed && rawGlobalMarket > 0) {
      rawDomesticInfra += Math.floor(rawGlobalMarket * 0.6);
      rawInnovation += Math.floor(rawGlobalMarket * 0.4);
      rawGlobalMarket = 0;
    }

    return {
      innovation: rawInnovation,
      globalMarket: rawGlobalMarket,
      domesticInfra: rawDomesticInfra,
      geopolitics: rawGeopolitics,
      totalDisposable,
      isEmbargoed,
      posture,
    };
  }
}
