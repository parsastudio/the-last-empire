import { GridCell } from "@/domain/map/grid-cell.schema";
import { Coordinate } from "@/domain/map/coordinate.schema";
import { ClosestBaseFinder } from "@/engine/combat/routing/closest-base-finder";
import { AttackOriginValidator } from "@/engine/combat/routing/attack-origin-validator";

export class AiGridAttackPlanner {
  private baseFinder = new ClosestBaseFinder();
  private validator = new AttackOriginValidator();

  public planBestTargetPixel(
    attackerId: string,
    defenderId: string,
    allCells: GridCell[],
  ): Coordinate | null {
    const defenderCells = allCells.filter(
      (c) => c.ownerId === defenderId && !c.isOccupied,
    );

    if (defenderCells.length === 0) {
      return null;
    }

    const attackerCells = allCells.filter(
      (c) => c.ownerId === attackerId || c.occupierId === attackerId,
    );

    for (const cell of defenderCells) {
      const target = { x: cell.x, y: cell.y };
      const closestBase = this.baseFinder.findClosestBase(
        attackerId,
        target,
        allCells,
      );

      if (
        closestBase &&
        this.validator.isValidOrigin(closestBase, attackerCells)
      ) {
        return target;
      }
    }

    return null;
  }
}
