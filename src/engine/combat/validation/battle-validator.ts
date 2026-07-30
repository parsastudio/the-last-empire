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
    const attackerCells: GridCell[] = [];
    for (let i = 0; i < allCells.length; i++) {
      const c = allCells[i]!;
      if (c.ownerId === attackerId) {
        attackerCells.push(c);
      }
    }

    if (attackerCells.length === 0) {
      return false;
    }

    const closestBase = this.baseFinder.findClosestBaseInList(
      targetPixel,
      attackerCells,
    );

    if (!closestBase) {
      return false;
    }

    return this.originValidator.isValidOrigin(closestBase, attackerCells);
  }
}
