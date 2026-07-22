import type { Nation } from "@/modules/nation/schemas/nation.schema";
import type { UnitType } from "@/modules/military/schemas/military.schema";
import { GameError } from "@/core/errors/game-error";

export class CoastalRequirementValidator {
  public validateSeaAccess(nation: Nation, unitType: UnitType): void {
    if (unitType === "NAVY" && !nation.geography.hasSeaAccess) {
      throw new GameError(
        "INVALID_ACTION",
        `Nation ${nation.name} does not have sea access to build navy units`,
      );
    }
  }
}
