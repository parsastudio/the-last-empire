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
import { NationGettersUtility, getNationGdp } from "@geopolitics/domain";

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
    const isUnderHousingPressure = capacityPercentage >= 90;
    const hasDevelopmentSurplus = currentTreasury >= Math.floor(devCost * 1.25);

    if (
      (isUnderHousingPressure || hasDevelopmentSurplus) &&
      currentTreasury >= devCost
    ) {
      actions.push(ActionFactory.upgradeDevelopment(nation.id));
      currentTreasury -= devCost;
    }

    const techCost = ResearchManager.getMilitaryTechCost(
      nation,
      provincesMap,
      gdp,
    );
    const isWar = posture === "WAR";
    const isOutTeched = this.hasSuperiorTechNeighbor(
      nation,
      allNations,
      provincesMap,
      ownedProvinces,
    );
    const hasTechSurplus = currentTreasury >= Math.floor(techCost * 1.5);

    if (
      (isWar || isOutTeched || hasTechSurplus) &&
      currentTreasury >= techCost
    ) {
      actions.push(ActionFactory.investResearch(nation.id));
      currentTreasury -= techCost;
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
