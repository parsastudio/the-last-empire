import {
  GameAction,
  Nation,
  Province,
  UnitType,
  MilitaryPricingCalculator,
  getNationGdp,
  MilitaryQuotaCalculator,
  AI_DOCTRINE_PRESETS,
} from "@geopolitics/domain";
import {
  AIPosture,
  AIPostureEvaluator,
} from "@/engine/ai/procurement/ai-posture-evaluator";
import { AIWartimeLoanEvaluator } from "@/engine/ai/procurement/ai-wartime-loan-evaluator";
import { AIArmsImportPlanner } from "@/engine/ai/procurement/ai-arms-import-planner";
import { AIDomesticRecruitmentPlanner } from "@/engine/ai/procurement/ai-domestic-recruitment-planner";
import { AINavalProcurementPlanner } from "@/engine/ai/procurement/ai-naval-procurement-planner";
import {
  AiWalletBudgetAllocator,
  AiStrategicWallets,
} from "@/engine/ai/procurement/ai-wallet-budget-allocator";

export type { AIPosture };

export interface RecruitmentPlanResult {
  actions: GameAction[];
  remainingTreasury: number;
  strategicWallets: AiStrategicWallets;
}

export class AIProcurementPlanner {
  public static readonly MAX_VALUATION_GDP_RATIO = 0.2;

  public static evaluatePosture =
    AIPostureEvaluator.evaluatePosture.bind(AIPostureEvaluator);

  public static planRecruitment(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    availableTreasury?: number,
    rankMap?: Map<string, number>,
    precomputedPosture?: AIPosture,
    precomputedWallets?: AiStrategicWallets,
  ): RecruitmentPlanResult {
    let effectiveTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;

    const gdp = getNationGdp(nation, provincesMap);
    const posture =
      precomputedPosture ??
      AIPostureEvaluator.evaluatePosture(
        nation,
        allNations,
        provincesMap,
        rankMap,
      );

    const actions: GameAction[] = [];
    const weights =
      nation.doctrineWeights ??
      AI_DOCTRINE_PRESETS[nation.doctrine || "DOMESTIC_INDUSTRIALIST"];

    if (posture === "WAR") {
      const loanAction = AIWartimeLoanEvaluator.evaluateWartimeLoan(
        nation,
        allNations,
        gdp,
        effectiveTreasury,
      );
      if (loanAction) {
        actions.push(loanAction.action);
        effectiveTreasury += loanAction.amount;
      }
    }

    const wallets =
      precomputedWallets ??
      AiWalletBudgetAllocator.calculateWallets(
        nation,
        allNations,
        provincesMap,
        posture,
        effectiveTreasury,
      );

    const quotas = MilitaryQuotaCalculator.calculateQuotas(
      gdp,
      nation.military,
    );

    const currentTotalValuation =
      MilitaryPricingCalculator.calculateTotalArmyValuation(nation.military);
    const maxArmyValuation =
      posture === "WAR"
        ? Math.floor(gdp * this.MAX_VALUATION_GDP_RATIO)
        : posture === "THREAT"
          ? Math.floor(
              gdp *
                this.MAX_VALUATION_GDP_RATIO *
                Math.max(weights.peacetimeArmyCap, 0.8),
            )
          : Math.floor(
              gdp * this.MAX_VALUATION_GDP_RATIO * weights.peacetimeArmyCap,
            );

    let globalRemainingValuation = Math.max(
      0,
      maxArmyValuation - currentTotalValuation,
    );

    if (globalRemainingValuation <= 0) {
      return {
        actions,
        remainingTreasury: effectiveTreasury,
        strategicWallets: wallets,
      };
    }

    const unitTypes: UnitType[] = [
      "AIR_FORCE",
      "AIR_DEFENSE",
      "ARMOR",
      "DRONE_MISSILE",
      "INFANTRY",
    ];

    let importBudget = wallets.globalMarket;
    let domesticBudget = wallets.domesticInfra;
    let totalSpent = 0;

    if (!wallets.isEmbargoed && importBudget > 0) {
      const importResult = AIArmsImportPlanner.planImports(
        nation,
        allNations,
        quotas,
        importBudget,
        globalRemainingValuation,
        unitTypes,
      );

      actions.push(...importResult.actions);
      totalSpent += importResult.spentMoney;
      globalRemainingValuation = importResult.remainingGlobalValuation;
      importBudget = importResult.remainingImportBudget;

      if (importResult.actions.length === 0) {
        domesticBudget += importBudget;
      }
    } else if (wallets.isEmbargoed) {
      domesticBudget += importBudget;
      importBudget = 0;
    }

    if (domesticBudget > 0 && globalRemainingValuation > 0) {
      const domesticResult = AIDomesticRecruitmentPlanner.planDomestic(
        nation,
        quotas,
        domesticBudget,
        globalRemainingValuation,
        unitTypes,
      );

      actions.push(...domesticResult.actions);
      totalSpent += domesticResult.spentMoney;
      domesticBudget = domesticResult.remainingBudget;
    }

    effectiveTreasury = Math.max(0, effectiveTreasury - totalSpent);

    const navalResult = AINavalProcurementPlanner.planNaval(
      nation,
      effectiveTreasury,
      provincesMap,
    );

    if (navalResult.action) {
      actions.push(navalResult.action);
      effectiveTreasury -= navalResult.cost;
    }

    return {
      actions,
      remainingTreasury: effectiveTreasury,
      strategicWallets: {
        ...wallets,
        globalMarket: importBudget,
        domesticInfra: domesticBudget,
      },
    };
  }
}
