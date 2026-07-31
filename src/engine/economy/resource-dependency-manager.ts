import type { Nation } from "@/domain/nation/nation.schema";
import type { UnitType } from "@/domain/military/military.schema";
import { GameError } from "@/domain/shared/game-error";
import { PopulationWelfareCalculator } from "@/engine/economy/population-welfare-calculator";

export class ResourceDependencyManager {
  private popWelfareCalc = new PopulationWelfareCalculator();

  public validateUnitRecruitmentResources(
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

  public applyOilScarcityPenalty(nation: Nation, baseUpkeep: number): number {
    return baseUpkeep;
  }

  public consumeTurnResources(nation: Nation): Nation {
    const metrics = this.popWelfareCalc.evaluateWelfare(
      nation.population,
      nation.resources.oil,
      nation.resources.steel,
    );

    const newOil = Math.max(0, nation.resources.oil - metrics.oilDemand);
    const newSteel = Math.max(0, nation.resources.steel - metrics.steelDemand);

    return {
      ...nation,
      resources: {
        ...nation.resources,
        oil: newOil,
        steel: newSteel,
      },
    };
  }
}
