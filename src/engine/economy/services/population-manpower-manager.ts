import { Nation } from "@/domain/nation/nation.schema";
import { UnitType } from "@/domain/military/military.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { PopulationWelfareCalculator } from "@/engine/economy/population-welfare-calculator";

export class PopulationGrowthEngine {
  public calculatePopulationChange(nation: Nation): number {
    const stability = Math.max(0, Math.min(100, nation.government.stability));
    const growthRate = stability / 5000 - 0.01;

    return Math.trunc(nation.population * growthRate);
  }

  public updatePopulation(nation: Nation): number {
    const change = this.calculatePopulationChange(nation);
    return Math.max(1, nation.population + change);
  }
}

export class ManpowerManager {
  private static readonly MANPOWER_POPULATION_RATIO = 0.15;

  public getMaxManpower(population: number): number {
    return Math.floor(population * ManpowerManager.MANPOWER_POPULATION_RATIO);
  }

  public calculateGrowth(nation: Nation): number {
    const maxManpower = this.getMaxManpower(nation.population);
    if (nation.resources.manpower >= maxManpower) {
      return 0;
    }

    const baseGrowth = Math.floor(nation.population * 0.002);
    const stabilityFactor = nation.government.stability / 100;
    return Math.floor(baseGrowth * stabilityFactor);
  }

  public deductManpower(nation: Nation, amount: number): Nation {
    return {
      ...nation,
      resources: {
        ...nation.resources,
        manpower: Math.max(0, nation.resources.manpower - amount),
      },
    };
  }

  public restoreManpower(nation: Nation, amount: number): Nation {
    const maxManpower = this.getMaxManpower(nation.population);
    const newManpower = Math.min(
      maxManpower,
      nation.resources.manpower + amount,
    );
    return {
      ...nation,
      resources: {
        ...nation.resources,
        manpower: newManpower,
      },
    };
  }
}

export class ResourceDependencyManager {
  public static validateUnitRecruitmentResources(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
  ): void {
    if (unitType === "AIR_FORCE" || unitType === "DRONE_MISSILE") {
      const requiredSteel = quantity * 2;
      if (nation.resources.steel < requiredSteel) {
        throw new GameError(
          "INSUFFICIENT_RESOURCES",
          `Recruiting advanced unit ${unitType} requires at least ${requiredSteel} steel`,
        );
      }
    }
  }

  public static consumeTurnResources(nation: Nation): Nation {
    const { updatedNation } =
      PopulationWelfareCalculator.consumeTurnResources(nation);
    return updatedNation;
  }
}
