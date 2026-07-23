import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { UnitType } from "@/modules/military/schemas/military.schema";
import { GameError } from "@/core/errors/game-error";

export class ResourceDependencyManager {
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
    const requiredOilPerTurn = Math.ceil(
      (nation.military.airForce + nation.military.droneMissile) * 0.5,
    );

    if (nation.resources.oil < requiredOilPerTurn) {
      return baseUpkeep * 3.0;
    }

    return baseUpkeep;
  }

  public consumeTurnResources(nation: Nation): Nation {
    const requiredOil = Math.ceil(
      (nation.military.airForce + nation.military.droneMissile) * 0.5,
    );

    const availableOil = nation.resources.oil;
    const newOil = Math.max(0, availableOil - requiredOil);

    return {
      ...nation,
      resources: {
        ...nation.resources,
        oil: newOil,
      },
    };
  }
}
