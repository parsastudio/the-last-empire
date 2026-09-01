import {
  GameAction,
  ActionFactory,
  Nation,
  Province,
  IndustryCalculator,
  AI_DOCTRINE_PRESETS,
} from "@geopolitics/domain";
import { ResearchManager } from "@/engine/politics/research-manager";
import { AIPosture } from "@/engine/ai/ai-procurement-planner";
import { AIMachineryImportPlanner } from "@/engine/ai/procurement/ai-machinery-import-planner";

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
  ): UpgradePlanResult {
    let currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;
    const actions: GameAction[] = [];

    const weights =
      nation.doctrineWeights ??
      AI_DOCTRINE_PRESETS[nation.doctrine || "DOMESTIC_INDUSTRIALIST"];

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
      currentTreasury / IndustryCalculator.FACTORY_REBUILD_COST,
    );
    const slotsToBuild = Math.min(totalEmptySlots, affordableSlots);

    if (slotsToBuild > 0) {
      actions.push(ActionFactory.buildFactory(nation.id, slotsToBuild));
      currentTreasury -= slotsToBuild * IndustryCalculator.FACTORY_REBUILD_COST;
    }

    if (nation.equipmentTechLevel < nation.industrialLevel) {
      let totalFactories = 0;
      for (const p of myProvs) {
        totalFactories += p.factoriesCount;
      }
      const modernizeCost =
        totalFactories *
        IndustryCalculator.calculateModernizeUnitCost(
          nation.equipmentTechLevel,
          nation.industrialLevel,
        );

      if (currentTreasury >= modernizeCost && modernizeCost > 0) {
        actions.push(ActionFactory.equipDomesticMachinery(nation.id));
        currentTreasury -= modernizeCost;
      }
    }

    const indResearchCost = IndustryCalculator.calculateResearchStepCost(
      nation.industrialLevel,
    );
    if (
      currentTreasury >= indResearchCost * 1.5 &&
      weights.developmentPriority >= 0.5
    ) {
      actions.push(ActionFactory.investIndustrialResearch(nation.id));
      currentTreasury -= indResearchCost;
    }

    const importResult = AIMachineryImportPlanner.planImport(
      nation,
      allNations,
      currentTreasury,
    );
    if (importResult.actions.length > 0) {
      actions.push(...importResult.actions);
      currentTreasury = importResult.remainingTreasury;
    }

    const milTechCost = ResearchManager.getMilitaryTechCost(
      nation.military.techLevel,
    );
    if (currentTreasury >= milTechCost * 1.5) {
      actions.push(ActionFactory.investResearch(nation.id));
      currentTreasury -= milTechCost;
    }

    return {
      actions,
      remainingTreasury: currentTreasury,
    };
  }
}
