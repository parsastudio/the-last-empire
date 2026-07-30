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
    const defenderCells: GridCell[] = [];
    const attackerCells: GridCell[] = [];

    for (let i = 0; i < allCells.length; i++) {
      const cell = allCells[i]!;
      if (cell.ownerId === defenderId) {
        defenderCells.push(cell);
      } else if (cell.ownerId === attackerId) {
        attackerCells.push(cell);
      }
    }

    if (defenderCells.length === 0 || attackerCells.length === 0) {
      return null;
    }

    let attackerCentroidX = 0;
    let attackerCentroidY = 0;
    for (let i = 0; i < attackerCells.length; i++) {
      attackerCentroidX += attackerCells[i]!.x;
      attackerCentroidY += attackerCells[i]!.y;
    }
    attackerCentroidX = Math.floor(attackerCentroidX / attackerCells.length);
    attackerCentroidY = Math.floor(attackerCentroidY / attackerCells.length);

    let bestTargetCell: GridCell | null = null;
    let minDistToAttacker = Infinity;

    const step = Math.max(1, Math.floor(defenderCells.length / 10));

    for (let i = 0; i < defenderCells.length; i += step) {
      const cell = defenderCells[i]!;
      const dist = Math.hypot(
        cell.x - attackerCentroidX,
        cell.y - attackerCentroidY,
      );

      if (dist < minDistToAttacker) {
        minDistToAttacker = dist;
        bestTargetCell = cell;
      }
    }

    if (!bestTargetCell) {
      bestTargetCell = defenderCells[0] || null;
    }

    if (!bestTargetCell) {
      return null;
    }

    const target = { x: bestTargetCell.x, y: bestTargetCell.y };
    const closestBase = this.baseFinder.findClosestBaseInList(
      target,
      attackerCells,
    );

    if (
      closestBase &&
      this.validator.isValidOrigin(closestBase, attackerCells)
    ) {
      return target;
    }

    return null;
  }
}
