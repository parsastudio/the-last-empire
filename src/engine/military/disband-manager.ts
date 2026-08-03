import { Nation } from "@/domain/nation/nation.schema";
import { UnitType } from "@/domain/military/military.schema";
import { GameError } from "@/domain/shared/domain-utilities";

export class DisbandManager {
  public disbandUnits(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
    manpowerRefundRate = 0.4,
  ): Nation {
    if (quantity <= 0) {
      throw new GameError("INVALID_ACTION", "Quantity must be positive");
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
        "Cannot disband more than available",
      );
    }

    const unitCostManpower =
      unitType === "INFANTRY" ? 10 : unitType === "AIR_FORCE" ? 5 : 1;
    const recoveredManpower = Math.floor(
      quantity * unitCostManpower * manpowerRefundRate,
    );

    const updatedMilitary = { ...nation.military };
    if (unitType === "INFANTRY") updatedMilitary.infantry -= quantity;
    else if (unitType === "AIR_FORCE") updatedMilitary.airForce -= quantity;
    else if (unitType === "DRONE_MISSILE")
      updatedMilitary.droneMissile -= quantity;

    const maxManpower = Math.floor(nation.population * 0.15);
    const finalManpower = Math.min(
      maxManpower,
      nation.resources.manpower + recoveredManpower,
    );

    return {
      ...nation,
      military: updatedMilitary,
      resources: {
        ...nation.resources,
        manpower: finalManpower,
      },
    };
  }
}
