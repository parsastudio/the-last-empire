import { Nation } from "@/domain/nation/nation.schema";
import { UnitType } from "@/domain/military/military.schema";
import { GameError } from "@/domain/shared/game-error";

export class DisbandValidator {
  public validateDisband(
    nation: Nation,
    unitType: UnitType,
    quantity: number,
  ): void {
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
  }
}
