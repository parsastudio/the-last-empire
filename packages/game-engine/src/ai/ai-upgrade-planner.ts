import {
  GameAction,
  ActionFactory,
  Nation,
  IndustryCalculator,
  AI_DOCTRINE_PRESETS,
  NationGettersUtility,
  NationalProjectEffectApplierUtility,
} from "@geopolitics/domain";
import { ResearchManager } from "@/engine/politics/research-manager";
import { AIMachineryImportPlanner } from "@/engine/ai/procurement/ai-machinery-import-planner";
import { AiStrategicWallets } from "@/engine/ai/procurement/ai-wallet-budget-allocator";
import { TurnContext } from "@/engine/pipeline/turn-context";

export interface UpgradePlanResult {
  actions: GameAction[];
  remainingTreasury: number;
}

export class AIUpgradePlanner {
  public static planUpgrades(
    nation: Nation,
    context: TurnContext,
    availableTreasury?: number,
    wallets?: AiStrategicWallets,
  ): UpgradePlanResult {
    let currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;
    const actions: GameAction[] = [];

    if (currentTreasury <= 0) {
      return { actions, remainingTreasury: currentTreasury };
    }

    const myProvs = context.getOwnedProvinces(nation.id);

    let innovationBudget = wallets
      ? Math.min(currentTreasury, wallets.innovation)
      : Math.floor(currentTreasury * 0.3);

    let machineryImportBudget = wallets
      ? Math.min(
          currentTreasury,
          Math.max(
            wallets.globalMarket,
            Math.floor(wallets.domesticInfra * 0.4),
          ),
        )
      : Math.floor(currentTreasury * 0.25);

    let domesticInfraBudget = wallets
      ? Math.min(currentTreasury, wallets.domesticInfra)
      : Math.floor(currentTreasury * 0.3);

    if (machineryImportBudget > 0 && !wallets?.isEmbargoed) {
      const importResult = AIMachineryImportPlanner.planImport(
        nation,
        context.state.nations,
        machineryImportBudget,
        context.state.provinces,
        myProvs,
      );

      if (importResult.actions.length > 0) {
        actions.push(...importResult.actions);
        currentTreasury -= importResult.spentMoney;
        machineryImportBudget = importResult.remainingBudget;
      } else {
        domesticInfraBudget += machineryImportBudget;
      }
    }

    const industrialCapacity =
      NationGettersUtility.getTerritoryIndustrialCapacity(
        nation.id,
        context.state.provinces,
        myProvs,
      );

    const affordableSlots = Math.floor(
      domesticInfraBudget / IndustryCalculator.FACTORY_REBUILD_COST,
    );
    const slotsToBuild = Math.min(
      industrialCapacity.totalEmptySlots,
      affordableSlots,
    );

    if (slotsToBuild > 0) {
      actions.push(ActionFactory.buildFactory(nation.id, slotsToBuild));
      const buildCost = slotsToBuild * IndustryCalculator.FACTORY_REBUILD_COST;
      currentTreasury -= buildCost;
      domesticInfraBudget -= buildCost;
    }

    if (
      nation.equipmentTechLevel < nation.industrialLevel &&
      domesticInfraBudget > 0
    ) {
      const totalFactories = industrialCapacity.totalActiveFactories;
      const unitCost = IndustryCalculator.calculateModernizeUnitCost(
        nation.equipmentTechLevel,
        nation.industrialLevel,
      );
      const affordableModUnits =
        unitCost > 0 ? Math.floor(domesticInfraBudget / unitCost) : 0;
      const unitsToModernize = Math.min(totalFactories, affordableModUnits);

      if (unitsToModernize > 0) {
        actions.push(
          ActionFactory.equipDomesticMachinery(nation.id, unitsToModernize),
        );
        const modCost = unitsToModernize * unitCost;
        currentTreasury -= modCost;
        domesticInfraBudget -= modCost;
      }
    }

    const weights =
      nation.doctrineWeights ??
      AI_DOCTRINE_PRESETS[nation.doctrine || "DOMESTIC_INDUSTRIALIST"];

    const threshold = weights.researchDisparityThreshold ?? 1.0;
    const researchDiscount =
      NationalProjectEffectApplierUtility.getResearchDiscountMultiplier(nation);
    let simulatedMilTech = nation.military.techLevel;
    let simulatedIndTech = nation.industrialLevel;
    let stepsTaken = 0;

    while (stepsTaken < 4 && innovationBudget > 0 && currentTreasury > 0) {
      const nextMilCost = ResearchManager.getMilitaryTechCost(
        simulatedMilTech,
        nation.government?.type,
        researchDiscount,
      );
      const nextIndCost = IndustryCalculator.calculateResearchStepCost(
        simulatedIndTech,
        nation.government?.type,
        researchDiscount,
      );

      const costRatio = nextMilCost / Math.max(1, nextIndCost);

      const isMilPriority = costRatio <= threshold;
      const primaryType: "MIL" | "IND" = isMilPriority ? "MIL" : "IND";
      const secondaryType: "MIL" | "IND" = isMilPriority ? "IND" : "MIL";

      const tryStep = (type: "MIL" | "IND"): boolean => {
        if (type === "MIL") {
          if (
            currentTreasury >= nextMilCost &&
            innovationBudget >= nextMilCost
          ) {
            actions.push(ActionFactory.investResearch(nation.id));
            currentTreasury -= nextMilCost;
            innovationBudget -= nextMilCost;
            simulatedMilTech = Number(
              (simulatedMilTech + ResearchManager.RESEARCH_STEP).toFixed(1),
            );
            stepsTaken++;
            return true;
          }
          return false;
        }

        if (currentTreasury >= nextIndCost && innovationBudget >= nextIndCost) {
          actions.push(ActionFactory.investIndustrialResearch(nation.id));
          currentTreasury -= nextIndCost;
          innovationBudget -= nextIndCost;
          simulatedIndTech = Number(
            (simulatedIndTech + IndustryCalculator.RESEARCH_STEP).toFixed(2),
          );
          stepsTaken++;
          return true;
        }
        return false;
      };

      if (!tryStep(primaryType) && !tryStep(secondaryType)) {
        break;
      }
    }

    return {
      actions,
      remainingTreasury: currentTreasury,
    };
  }
}
