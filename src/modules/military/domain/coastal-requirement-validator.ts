import type { Nation } from "@/core/types/nation.types";
import type { UnitType } from "@/core/types/military.types";
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
