import type { Nation } from "@/domain/nation/nation.schema";
import type { UnitType } from "@/domain/military/military.schema";
import { GameError } from "@/domain/shared/domain-utilities";
import { PopulationWelfareCalculator } from "@/engine/economy/population-welfare-calculator";

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
    const metrics = PopulationWelfareCalculator.evaluateWelfare(
      nation.population,
      nation.resources.oil,
      nation.resources.steel,
      nation.gdp,
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
