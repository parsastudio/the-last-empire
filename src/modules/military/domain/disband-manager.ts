import type { Nation, UnitType } from "@/core/types";
import { GameError } from "@/core/errors/game-error";
import { UnitCostCalculator } from "./unit-cost-calculator";

export class DisbandManager {
  private costCalculator: UnitCostCalculator;

  constructor() {
    this.costCalculator = new UnitCostCalculator();
  }

  public disbandUnits(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
    manpowerRefundRate = 0.8,
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
          : unitType === "NAVY"
            ? nation.military.navy
            : nation.military.droneMissile;

    if (currentAmount < quantity) {
      throw new GameError(
        "INVALID_ACTION",
        "Cannot disband more units than present in military stack",
      );
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
      case "NAVY":
        updatedMilitary.navy -= quantity;
        break;
      case "DRONE_MISSILE":
        updatedMilitary.droneMissile -= quantity;
        break;
    }

    return {
      ...nation,
      military: updatedMilitary,
      resources: {
        ...nation.resources,
        manpower: nation.resources.manpower + recoveredManpower,
      },
    };
  }
}
