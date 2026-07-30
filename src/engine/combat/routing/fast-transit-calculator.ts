import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export interface FastTransitResult {
  isLandAttack: boolean;
  distanceInKm: number;
  originCoordinate: Coordinate;
  targetCoordinate: Coordinate;
  pixelSteps: number;
}

export class FastTransitCalculator {
  private readonly sqKmPerPixel = 86.3;

  public calculateTransit(
    attackerId: string,
    targetNationId: string,
    targetPixel: Coordinate,
    allCells: GridCell[],
  ): FastTransitResult {
    const scaledTargetPixel: Coordinate = {
      x: targetPixel.x >= 1024 ? Math.floor(targetPixel.x / 4) : targetPixel.x,
      y: targetPixel.y >= 512 ? Math.floor(targetPixel.y / 4) : targetPixel.y,
    };

    const isWaterTarget =
      !targetNationId ||
      targetNationId === "WATER" ||
      targetNationId === "CLOSED_SEA";

    const attackerCells: GridCell[] = [];
    const targetCells: GridCell[] = [];

    for (let i = 0; i < allCells.length; i++) {
      const c = allCells[i]!;
      if (c.ownerId === attackerId) {
        attackerCells.push(c);
      } else if (c.ownerId === targetNationId) {
        targetCells.push(c);
      }
    }

    let isLandNeighbor = false;
    if (!isWaterTarget && attackerCells.length > 0 && targetCells.length > 0) {
      isLandNeighbor = this.checkLandBorderAdjacency(
        attackerCells,
        targetCells,
      );
    }

    const closestAttackerCell = this.findClosestCell(
      attackerCells,
      scaledTargetPixel,
    );

    const originCoord = closestAttackerCell
      ? { x: closestAttackerCell.x, y: closestAttackerCell.y }
      : scaledTargetPixel;

    const pixelDist = Math.hypot(
      originCoord.x - scaledTargetPixel.x,
      originCoord.y - scaledTargetPixel.y,
    );

    const kmFactor = Math.sqrt(this.sqKmPerPixel);

    if (isLandNeighbor) {
      const distanceInKm = Math.round(pixelDist * kmFactor);

      return {
        isLandAttack: true,
        distanceInKm: Math.max(30, Math.min(350, distanceInKm)),
        originCoordinate: originCoord,
        targetCoordinate: scaledTargetPixel,
        pixelSteps: Math.ceil(pixelDist),
      };
    }

    const distanceInKm = Math.round(pixelDist * kmFactor * 1.8);

    return {
      isLandAttack: false,
      distanceInKm: Math.max(200, Math.min(3000, distanceInKm)),
      originCoordinate: originCoord,
      targetCoordinate: scaledTargetPixel,
      pixelSteps: Math.ceil(pixelDist),
    };
  }

  private checkLandBorderAdjacency(
    attackerCells: GridCell[],
    targetCells: GridCell[],
  ): boolean {
    const targetSet = new Set<string>();
    for (let i = 0; i < targetCells.length; i++) {
      const c = targetCells[i]!;
      targetSet.add(`${c.x},${c.y}`);
    }

    for (let i = 0; i < attackerCells.length; i++) {
      const c = attackerCells[i]!;
      if (
        targetSet.has(`${c.x + 1},${c.y}`) ||
        targetSet.has(`${c.x - 1},${c.y}`) ||
        targetSet.has(`${c.x},${c.y + 1}`) ||
        targetSet.has(`${c.x},${c.y - 1}`) ||
        targetSet.has(`${c.x + 1},${c.y + 1}`) ||
        targetSet.has(`${c.x - 1},${c.y - 1}`)
      ) {
        return true;
      }
    }

    return false;
  }

  private findClosestCell(
    cells: GridCell[],
    targetPixel: Coordinate,
  ): GridCell | undefined {
    let closest: GridCell | undefined = undefined;
    let minSquareDist = Infinity;

    for (let i = 0; i < cells.length; i++) {
      const cell = cells[i]!;
      const sqDist =
        Math.pow(cell.x - targetPixel.x, 2) +
        Math.pow(cell.y - targetPixel.y, 2);
      if (sqDist < minSquareDist) {
        minSquareDist = sqDist;
        closest = cell;
      }
    }

    return closest;
  }
}
