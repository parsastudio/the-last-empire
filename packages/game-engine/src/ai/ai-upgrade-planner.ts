import { GameAction } from "@/domain/game/action.schema";
import { ActionFactory } from "@/domain/game/action-factory";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CountryRegistry } from "@/domain/data/countries";
import { DemographicsCalculator } from "@/domain/nation/demographics-calculator.utility";
import { DevelopmentManager } from "@/engine/economy/calculators/infrastructure-manager";
import { ResearchManager } from "@/engine/politics/research-manager";
import { AIProcurementPlanner } from "@/engine/ai/ai-procurement-planner";
import { LandNeighborResolver } from "@/domain/map/land-neighbor-resolver";

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
  ): UpgradePlanResult {
    let currentTreasury =
      availableTreasury !== undefined ? availableTreasury : nation.treasury;
    const actions: GameAction[] = [];

    const capacityPercentage =
      DemographicsCalculator.calculateCapacityPercentage(
        nation.population,
        nation.maxPopulationCapacity,
      );

    const posture = AIProcurementPlanner.evaluatePosture(
      nation,
      allNations,
      provincesMap,
    );

    const devCost = DevelopmentManager.getUpgradeCost(nation);
    const isUnderHousingPressure = capacityPercentage >= 90;
    const hasDevelopmentSurplus = currentTreasury >= Math.floor(devCost * 1.25);

    if (
      (isUnderHousingPressure || hasDevelopmentSurplus) &&
      currentTreasury >= devCost
    ) {
      actions.push(ActionFactory.upgradeDevelopment(nation.id));
      currentTreasury -= devCost;
    }

    const techCost = ResearchManager.getMilitaryTechCost(nation);
    const isWar = posture === "WAR";
    const isOutTeched = this.hasSuperiorTechNeighbor(
      nation,
      allNations,
      provincesMap,
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
  ): boolean {
    const currentTech = nation.military.techLevel;

    if (!provincesMap) {
      for (const neighborId of nation.geography.landNeighbors || []) {
        const canonical = CountryRegistry.resolveCanonicalId(neighborId);
        const neighbor = allNations[canonical] || allNations[neighborId];
        if (
          neighbor &&
          neighbor.isAlive &&
          neighbor.military.techLevel > currentTech
        ) {
          return true;
        }
      }
      return false;
    }

    for (const otherNation of Object.values(allNations)) {
      if (!otherNation.isAlive || otherNation.id === nation.id) continue;
      if (otherNation.military.techLevel <= currentTech) continue;

      for (const pid of otherNation.provinceIds || []) {
        if (
          LandNeighborResolver.hasProvinceLandBorder(
            pid,
            nation.id,
            provincesMap,
          )
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
