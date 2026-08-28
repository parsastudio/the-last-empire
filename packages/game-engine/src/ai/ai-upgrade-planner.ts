import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { DemographicsCalculator } from "@/domain/nation/demographics-calculator.utility";
import { DevelopmentManager } from "@/engine/economy/calculators/infrastructure-manager";
import { ResearchManager } from "@/engine/politics/research-manager";
import {
  AIProcurementPlanner,
  AIPosture,
} from "@/engine/ai/ai-procurement-planner";
import {
  NationGettersUtility,
  getNationGdp,
  AI_DOCTRINE_PRESETS,
} from "@geopolitics/domain";

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
    rankMap?: Map<string, number>,
    precomputedPosture?: AIPosture,
    ownedProvinces?: Province[],
  ): UpgradePlanResult {
    let currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;
    const actions: GameAction[] = [];

    const weights =
      nation.doctrineWeights ??
      AI_DOCTRINE_PRESETS[nation.doctrine || "DOMESTIC_INDUSTRIALIST"];

    const pop = NationGettersUtility.getPopulation(nation.id, provincesMap);
    const maxCap = NationGettersUtility.getMaxPopulationCapacity(
      nation.id,
      provincesMap,
    );

    const capacityPercentage =
      DemographicsCalculator.calculateCapacityPercentage(pop, maxCap);

    const posture =
      precomputedPosture ??
      AIProcurementPlanner.evaluatePosture(
        nation,
        allNations,
        provincesMap,
        rankMap,
      );

    const gdp = getNationGdp(nation, provincesMap);
    const devCost = DevelopmentManager.getUpgradeCost(gdp);
    const techCost = ResearchManager.getMilitaryTechCost(
      nation,
      provincesMap,
      gdp,
    );

    const devPriority = weights.developmentPriority;
    const techPriority = weights.researchFocusWeight;

    const isUnderHousingPressure = capacityPercentage >= 85;
    const devThresholdMultiplier = Math.max(1.0, 2.0 - devPriority);
    const isDevCandidate =
      currentTreasury >= devCost &&
      (isUnderHousingPressure ||
        currentTreasury >= Math.floor(devCost * devThresholdMultiplier));

    const isWar = posture === "WAR";
    const isOutTeched = this.hasSuperiorTechNeighbor(
      nation,
      allNations,
      provincesMap,
      ownedProvinces,
    );
    const techThresholdMultiplier = Math.max(1.0, 2.2 - techPriority);
    const isTechCandidate =
      currentTreasury >= techCost &&
      (isWar ||
        isOutTeched ||
        currentTreasury >= Math.floor(techCost * techThresholdMultiplier));

    if (devPriority >= techPriority) {
      if (isDevCandidate && currentTreasury >= devCost) {
        actions.push(ActionFactory.upgradeDevelopment(nation.id));
        currentTreasury -= devCost;
      }
      if (isTechCandidate && currentTreasury >= techCost) {
        actions.push(ActionFactory.investResearch(nation.id));
        currentTreasury -= techCost;
      }
    } else {
      if (isTechCandidate && currentTreasury >= techCost) {
        actions.push(ActionFactory.investResearch(nation.id));
        currentTreasury -= techCost;
      }
      if (isDevCandidate && currentTreasury >= devCost) {
        actions.push(ActionFactory.upgradeDevelopment(nation.id));
        currentTreasury -= devCost;
      }
    }

    return {
      actions,
      remainingTreasury: currentTreasury,
    };
  }

  private static hasSuperiorTechNeighbor(
    nation: Nation,
    allNations: Record<string, Nation>,
    provincesMap?: Record<string, Province>,
    ownedProvinces?: Province[],
  ): boolean {
    if (!provincesMap) {
      return false;
    }

    const currentTech = nation.military.techLevel;
    const canonicalNation = CountryRegistry.resolveCanonicalId(nation.id);

    const provsToCheck =
      ownedProvinces ??
      NationGettersUtility.getOwnedProvinces(nation.id, provincesMap);

    for (let p = 0; p < provsToCheck.length; p++) {
      const prov = provsToCheck[p]!;
      const neighbors = prov.landNeighbors || [];
      for (let i = 0; i < neighbors.length; i++) {
        const neighborProv = provincesMap[neighbors[i]!.toString()];
        if (neighborProv) {
          const neighborOwnerId = CountryRegistry.resolveCanonicalId(
            neighborProv.ownerNationId,
          );
          if (neighborOwnerId !== canonicalNation) {
            const neighborNation =
              allNations[neighborOwnerId] ||
              allNations[neighborProv.ownerNationId];
            if (
              neighborNation &&
              neighborNation.isAlive &&
              neighborNation.military.techLevel > currentTech
            ) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }
}
