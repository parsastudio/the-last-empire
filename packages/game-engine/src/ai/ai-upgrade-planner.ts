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

    const posture = AIProcurementPlanner.evaluatePosture(
      nation,
      allNations,
      provincesMap,
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
      return false;
    }

    for (const otherNation of Object.values(allNations)) {
      if (!otherNation.isAlive || otherNation.id === nation.id) continue;
      if (otherNation.military.techLevel <= currentTech) continue;

      const otherProvs = NationGettersUtility.getOwnedProvinces(
        otherNation.id,
        provincesMap,
      );

      for (const prov of otherProvs) {
        if (
          LandNeighborResolver.hasProvinceLandBorder(
            prov.provinceId,
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
