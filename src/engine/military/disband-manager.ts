import type { Nation } from "@/domain/nation/nation.schema";
import type { UnitType } from "@/domain/military/military.schema";
import { GameError } from "@/domain/shared/game-error";
import { UnitCostCalculator } from "@/engine/military/unit-cost-calculator";
import { ManpowerManager } from "@/engine/economy/manpower-manager";

export class DisbandManager {
  private costCalculator = new UnitCostCalculator();
  private manpowerManager = new ManpowerManager();

  public disbandUnits(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
    manpowerRefundRate = 0.4,
  ): Nation {
    if (quantity <= 0) {
      throw new GameError(
        "INVALID_ACTION",
        "Quantity to disband must be greater than zero",
      );
    }

    const currentAmount =
      unitType === "INFANTRY"
        ? nation.military.infantry
        : unitType === "AIR_FORCE"
          ? nation.military.airForce
          : nation.military.droneMissile;

    if (currentAmount < quantity) {
      throw new GameError(
        "INVALID_ACTION",
        "Cannot disband more units than present in military stack",
      );
    }

    const ratio = quantity / (currentAmount || 1);
    let stabilityPenalty = 0;
    if (ratio > 0.2) {
      stabilityPenalty = Math.floor(ratio * 30);
    }

    const unitDetails = this.costCalculator.getUnitDetails(
      unitType,
      nation.industrialLevel,
    );
    const recoveredManpower = Math.floor(
      quantity * unitDetails.manpowerCost * manpowerRefundRate,
    );

    const updatedMilitary = { ...nation.military };
    switch (unitType) {
      case "INFANTRY":
        updatedMilitary.infantry -= quantity;
        break;
      case "AIR_FORCE":
        updatedMilitary.airForce -= quantity;
        break;
      case "DRONE_MISSILE":
        updatedMilitary.droneMissile -= quantity;
        break;
    }

    const maxManpower = this.manpowerManager.getMaxManpower(nation.population);
    const finalManpower = Math.min(
      maxManpower,
      nation.resources.manpower + recoveredManpower,
    );

    const updatedStability = Math.max(
      0,
      nation.government.stability - stabilityPenalty,
    );

    return {
      ...nation,
      military: updatedMilitary,
      resources: {
        ...nation.resources,
        manpower: finalManpower,
      },
      government: {
        ...nation.government,
        stability: updatedStability,
      },
    };
  }
}
