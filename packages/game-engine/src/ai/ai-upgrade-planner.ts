import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  IndustryCalculator,
} from "@geopolitics/domain";
import { ResearchManager } from "@/engine/politics/research-manager";
import { AIPosture } from "@/engine/ai/procurement/ai-posture-evaluator";
import { AIMachineryImportPlanner } from "@/engine/ai/procurement/ai-machinery-import-planner";
import { AiStrategicWallets } from "@/engine/ai/procurement/ai-wallet-budget-allocator";

export interface UpgradePlanResult {
  actions: GameAction[];
  remainingTreasury: number;
}

export class AIUpgradePlanner {
  public static planUpgrades(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    availableTreasury?: number,
    _rankMap?: Map<string, number>,
    _precomputedPosture?: AIPosture,
    ownedProvinces?: Province[],
    wallets?: AiStrategicWallets,
  ): UpgradePlanResult {
    let currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;
    const actions: GameAction[] = [];

    if (currentTreasury <= 0) {
      return { actions, remainingTreasury: currentTreasury };
    }

    let innovationBudget = wallets
      ? Math.min(currentTreasury, wallets.innovation)
      : Math.floor(currentTreasury * 0.3);

    let machineryImportBudget = wallets
      ? Math.min(currentTreasury, wallets.globalMarket)
      : Math.floor(currentTreasury * 0.2);

    let domesticInfraBudget = wallets
      ? Math.min(currentTreasury, wallets.domesticInfra)
      : Math.floor(currentTreasury * 0.3);

    if (machineryImportBudget > 0 && !wallets?.isEmbargoed) {
      const importResult = AIMachineryImportPlanner.planImport(
        nation,
        allNations,
        machineryImportBudget,
      );

      if (importResult.actions.length > 0) {
        actions.push(...importResult.actions);
        currentTreasury -= importResult.spentMoney;
        machineryImportBudget = importResult.remainingBudget;
      } else {
        domesticInfraBudget += machineryImportBudget;
      }
    }

    const myProvs =
      ownedProvinces ??
      Object.values(provincesMap || {}).filter(
        (p) => p.ownerNationId === nation.id,
      );

    let totalEmptySlots = 0;
    for (let i = 0; i < myProvs.length; i++) {
      totalEmptySlots += Math.max(
        0,
        myProvs[i]!.maxSlots - myProvs[i]!.factoriesCount,
      );
    }

    const affordableSlots = Math.floor(
      domesticInfraBudget / IndustryCalculator.FACTORY_REBUILD_COST,
    );
    const slotsToBuild = Math.min(totalEmptySlots, affordableSlots);

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
      let totalFactories = 0;
      for (const p of myProvs) {
        totalFactories += p.factoriesCount;
      }
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

    let indStepsTaken = 0;
    while (indStepsTaken < 3) {
      const nextIndCost = IndustryCalculator.calculateResearchStepCost(
        nation.industrialLevel +
          indStepsTaken * IndustryCalculator.RESEARCH_STEP,
      );
      if (currentTreasury >= nextIndCost && innovationBudget >= nextIndCost) {
        actions.push(ActionFactory.investIndustrialResearch(nation.id));
        currentTreasury -= nextIndCost;
        innovationBudget -= nextIndCost;
        indStepsTaken++;
      } else {
        break;
      }
    }

    let milStepsTaken = 0;
    while (milStepsTaken < 3) {
      const nextMilCost = ResearchManager.getMilitaryTechCost(
        nation.military.techLevel +
          milStepsTaken * ResearchManager.RESEARCH_STEP,
      );
      if (currentTreasury >= nextMilCost && innovationBudget >= nextMilCost) {
        actions.push(ActionFactory.investResearch(nation.id));
        currentTreasury -= nextMilCost;
        innovationBudget -= nextMilCost;
        milStepsTaken++;
      } else {
        break;
      }
    }

    return {
      actions,
      remainingTreasury: currentTreasury,
    };
  }
}
