import { Nation, Province, AI_DOCTRINE_PRESETS } from "@geopolitics/domain";
import { AIPosture } from "@/engine/ai/procurement/ai-posture-evaluator";
import { AiDisposableBudgetCalculator } from "@/engine/ai/blackboard/ai-disposable-budget-calculator";

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
    precomputedGdpMap?: Map<string, number>,
    precomputedTotalWorldGdp?: number,
  ): AiStrategicWallets {
    const budget = AiDisposableBudgetCalculator.calculate(
      nation,
      allNations,
      provincesMap,
      availableTreasury,
      precomputedGdpMap,
      precomputedTotalWorldGdp,
    );

    const weights =
      nation.doctrineWeights ??
      AI_DOCTRINE_PRESETS[nation.doctrine || "DOMESTIC_INDUSTRIALIST"];

    if (budget.totalDisposable <= 0) {
      return {
        innovation: 0,
        globalMarket: 0,
        domesticInfra: 0,
        geopolitics: 0,
        totalDisposable: 0,
        isEmbargoed: budget.isEmbargoed,
        posture,
      };
    }

    if (posture === "WAR") {
      const globalShare = budget.isEmbargoed ? 0.0 : 0.6;
      const domesticShare = budget.isEmbargoed ? 0.95 : 0.35;
      const geoShare = 0.05;

      return {
        innovation: 0,
        globalMarket: Math.floor(budget.totalDisposable * globalShare),
        domesticInfra: Math.floor(budget.totalDisposable * domesticShare),
        geopolitics: Math.floor(budget.totalDisposable * geoShare),
        totalDisposable: budget.totalDisposable,
        isEmbargoed: budget.isEmbargoed,
        posture,
      };
    }

    let rawInnovation = Math.floor(
      budget.totalDisposable * weights.innovationWeight,
    );
    let rawGlobalMarket = Math.floor(
      budget.totalDisposable * weights.globalMarketWeight,
    );
    let rawDomesticInfra = Math.floor(
      budget.totalDisposable * weights.domesticInfraWeight,
    );
    const rawGeopolitics = Math.floor(
      budget.totalDisposable * weights.geopoliticsWeight,
    );

    if (budget.isEmbargoed && rawGlobalMarket > 0) {
      rawDomesticInfra += Math.floor(rawGlobalMarket * 0.6);
      rawInnovation += Math.floor(rawGlobalMarket * 0.4);
      rawGlobalMarket = 0;
    }

    return {
      innovation: rawInnovation,
      globalMarket: rawGlobalMarket,
      domesticInfra: rawDomesticInfra,
      geopolitics: rawGeopolitics,
      totalDisposable: budget.totalDisposable,
      isEmbargoed: budget.isEmbargoed,
      posture,
    };
  }
}
