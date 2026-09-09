import {
  Nation,
  FiscalRevenueCalculator,
  MilitaryPayrollCalculator,
  DebtCalculatorUtility,
  SecurityFeeCalculatorUtility,
  NAVAL_FLEET_CONFIG,
  CountryRegistry,
  AI_DOCTRINE_PRESETS,
} from "@geopolitics/domain";
import { TurnContext } from "@/engine/pipeline/turn-context";
import { AIPosture } from "@/engine/ai/procurement/ai-posture-evaluator";
import {
  AiDomainNeedScores,
  AiNeedScoringEngine,
} from "@/engine/ai/blackboard/ai-need-scoring-engine";

export type NumericWalletDomain =
  | "militaryProcurement"
  | "infrastructure"
  | "innovation"
  | "nationalProjects"
  | "geopolitics";

export interface BlackboardAllocatedWallets {
  militaryProcurement: number;
  infrastructure: number;
  innovation: number;
  nationalProjects: number;
  geopolitics: number;
  emergencyReserve: number;
  totalDisposable: number;
  isEmbargoed: boolean;
  posture: AIPosture;
}

export class AiBudgetBlackboard {
  private wallets: BlackboardAllocatedWallets;
  private nationId: string;

  constructor(wallets: BlackboardAllocatedWallets, nationId: string) {
    this.wallets = { ...wallets };
    this.nationId = nationId;
  }

  public static createForNation(
    nation: Nation,
    context: TurnContext,
  ): AiBudgetBlackboard {
    const posture = context.getPosture(nation);
    const needScores = AiNeedScoringEngine.calculateNeedScores(
      nation,
      context,
      posture,
    );
    const wallets = this.arbitrateBudgets(nation, context, posture, needScores);

    return new AiBudgetBlackboard(wallets, nation.id);
  }

  private static arbitrateBudgets(
    nation: Nation,
    context: TurnContext,
    posture: AIPosture,
    needScores: AiDomainNeedScores,
  ): BlackboardAllocatedWallets {
    const canonicalId = CountryRegistry.resolveCanonicalId(nation.id);
    const gdp = context.getNationGdp(canonicalId);
    const treasury = nation.treasury;

    const fiscalBreakdown = FiscalRevenueCalculator.calculate(
      nation,
      context.state.nations,
      context.state.provinces,
      context.aiRevenueMultiplier,
      context.gdpMap,
      context.totalWorldGdp,
    );

    const payrollBreakdown = MilitaryPayrollCalculator.calculatePayroll(
      nation,
      context.state.provinces,
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
        militaryProcurement: 0,
        infrastructure: 0,
        innovation: 0,
        nationalProjects: 0,
        geopolitics: 0,
        emergencyReserve: 0,
        totalDisposable: 0,
        isEmbargoed,
        posture,
      };
    }

    let emergencyReserveRatio = 0.05;
    if (posture === "WAR") {
      emergencyReserveRatio = 0.15;
    } else if (posture === "THREAT") {
      emergencyReserveRatio = 0.1;
    }

    const emergencyReserve = Math.floor(
      totalDisposable * emergencyReserveRatio,
    );
    const distributablePool = Math.max(0, totalDisposable - emergencyReserve);

    const wMilitary =
      (weights.globalMarketWeight + weights.domesticInfraWeight * 0.5) *
      (needScores.militaryProcurementScore / 50);
    const wInfra =
      weights.domesticInfraWeight * 0.5 * (needScores.infrastructureScore / 50);
    const wInnovation =
      weights.innovationWeight * (needScores.innovationScore / 50);
    const wProjects =
      (weights.domesticInfraWeight * 0.4 + weights.innovationWeight * 0.2) *
      (needScores.nationalProjectsScore / 50);
    const wGeopolitics =
      weights.geopoliticsWeight * (needScores.geopoliticsScore / 50);

    const sumWeights =
      wMilitary + wInfra + wInnovation + wProjects + wGeopolitics || 1.0;

    let militaryAlloc = Math.floor(
      distributablePool * (wMilitary / sumWeights),
    );
    let infraAlloc = Math.floor(distributablePool * (wInfra / sumWeights));
    let innovationAlloc = Math.floor(
      distributablePool * (wInnovation / sumWeights),
    );
    let projectsAlloc = Math.floor(
      distributablePool * (wProjects / sumWeights),
    );
    let geopoliticsAlloc = Math.floor(
      distributablePool * (wGeopolitics / sumWeights),
    );

    if (isEmbargoed) {
      const diverted = Math.floor(geopoliticsAlloc * 0.5);
      geopoliticsAlloc -= diverted;
      infraAlloc += diverted;
    }

    return {
      militaryProcurement: militaryAlloc,
      infrastructure: infraAlloc,
      innovation: innovationAlloc,
      nationalProjects: projectsAlloc,
      geopolitics: geopoliticsAlloc,
      emergencyReserve,
      totalDisposable,
      isEmbargoed,
      posture,
    };
  }

  public getWallets(): BlackboardAllocatedWallets {
    return { ...this.wallets };
  }

  public releaseSpillover(
    domain: NumericWalletDomain,
    unusedAmount: number,
  ): void {
    if (unusedAmount <= 0) return;

    this.wallets[domain] = Math.max(0, this.wallets[domain] - unusedAmount);

    const recipient: NumericWalletDomain =
      this.wallets.posture === "WAR" ? "militaryProcurement" : "infrastructure";

    this.wallets[recipient] += unusedAmount;
  }
}
