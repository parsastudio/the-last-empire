import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { ClosestBaseFinder } from "@/engine/combat/routing/closest-base-finder";
import { AttackOriginValidator } from "@/engine/combat/routing/attack-origin-validator";

export class BattleValidator {
  private baseFinder = new ClosestBaseFinder();
  private originValidator = new AttackOriginValidator();

  public validateAttackOpportunity(
    attackerId: string,
    targetPixel: Coordinate,
    allCells: GridCell[],
  ): boolean {
    const closestBase = this.baseFinder.findClosestBase(
      attackerId,
      targetPixel,
      allCells,
    );

    if (!closestBase) {
      return false;
    }

    const attackerCells = allCells.filter(
      (c) => c.ownerId === attackerId || c.occupierId === attackerId,
    );

    return this.originValidator.isValidOrigin(closestBase, attackerCells);
  }
}
