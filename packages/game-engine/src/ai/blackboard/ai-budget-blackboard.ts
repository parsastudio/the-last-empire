import { Nation, AI_DOCTRINE_PRESETS } from "@geopolitics/domain";
import { TurnContext } from "@/engine/pipeline/turn-context";
import { AIPosture } from "@/engine/ai/procurement/ai-posture-evaluator";
import {
  AiDomainNeedScores,
  AiNeedScoringEngine,
} from "@/engine/ai/blackboard/ai-need-scoring-engine";
import { AiDisposableBudgetCalculator } from "@/engine/ai/blackboard/ai-disposable-budget-calculator";

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

  constructor(wallets: BlackboardAllocatedWallets) {
    this.wallets = { ...wallets };
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

    return new AiBudgetBlackboard(wallets);
  }

  private static arbitrateBudgets(
    nation: Nation,
    context: TurnContext,
    posture: AIPosture,
    needScores: AiDomainNeedScores,
  ): BlackboardAllocatedWallets {
    const budget = AiDisposableBudgetCalculator.calculate(
      nation,
      context.state.nations,
      context.state.provinces,
      nation.treasury,
      context.gdpMap,
      context.totalWorldGdp,
    );

    const weights =
      nation.doctrineWeights ??
      AI_DOCTRINE_PRESETS[nation.doctrine || "DOMESTIC_INDUSTRIALIST"];

    if (budget.totalDisposable <= 0) {
      return {
        militaryProcurement: 0,
        infrastructure: 0,
        innovation: 0,
        nationalProjects: 0,
        geopolitics: 0,
        emergencyReserve: 0,
        totalDisposable: 0,
        isEmbargoed: budget.isEmbargoed,
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
      budget.totalDisposable * emergencyReserveRatio,
    );
    const distributablePool = Math.max(
      0,
      budget.totalDisposable - emergencyReserve,
    );

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

    if (budget.isEmbargoed) {
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
      totalDisposable: budget.totalDisposable,
      isEmbargoed: budget.isEmbargoed,
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

    let recipient: NumericWalletDomain =
      this.wallets.posture === "WAR" ? "militaryProcurement" : "infrastructure";

    if (recipient === domain) {
      recipient =
        domain === "militaryProcurement"
          ? "infrastructure"
          : "militaryProcurement";
    }

    this.wallets[recipient] += unusedAmount;
  }
}
