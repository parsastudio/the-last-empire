import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { BattleValidator } from "@/engine/combat/validation/battle-validator";

export class CombatValidationHelper {
  private validator = new BattleValidator();

  public isAttackValid(
    attackerId: string,
    targetPixel: Coordinate,
    allCells: GridCell[],
    forceBypass = false,
  ): boolean {
    if (forceBypass) {
      return true;
    }
    return this.validator.validateAttackOpportunity(
      attackerId,
      targetPixel,
      allCells,
    );
  }
}
