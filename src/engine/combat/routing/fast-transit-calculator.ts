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
  private readonly width = 1024;
  private readonly height = 512;
  private readonly sqKmPerPixel = 86.3;

  public calculateTransit(
    attackerId: string,
    targetNationId: string,
    targetPixel: Coordinate,
    allCells: GridCell[],
  ): FastTransitResult {
    const scaledTargetPixel: Coordinate = {
      x: targetPixel.x > 1024 ? Math.floor(targetPixel.x / 4) : targetPixel.x,
      y: targetPixel.y > 512 ? Math.floor(targetPixel.y / 4) : targetPixel.y,
    };

    const isWaterTarget =
      targetNationId === "WATER" || targetNationId === "CLOSED_SEA";

    const closestAttackerCell = this.findClosestAttackerCell(
      attackerId,
      scaledTargetPixel,
      allCells,
    );

    const originCoord = closestAttackerCell
      ? { x: closestAttackerCell.x, y: closestAttackerCell.y }
      : scaledTargetPixel;

    const isLandNeighbor =
      !isWaterTarget && closestAttackerCell
        ? this.checkDirectBorder(closestAttackerCell, targetNationId, allCells)
        : false;

    if (isLandNeighbor) {
      const pixelDist = Math.hypot(
        originCoord.x - scaledTargetPixel.x,
        originCoord.y - scaledTargetPixel.y,
      );
      const distanceInKm = Math.round(pixelDist * Math.sqrt(this.sqKmPerPixel));

      return {
        isLandAttack: true,
        distanceInKm: Math.max(30, Math.min(300, distanceInKm)),
        originCoordinate: originCoord,
        targetCoordinate: scaledTargetPixel,
        pixelSteps: Math.ceil(pixelDist),
      };
    }

    const singlePassResult = this.runSingleSourceSeaBfs(
      attackerId,
      scaledTargetPixel,
      allCells,
    );

    const kmDist = Math.round(
      singlePassResult.pixelSteps * Math.sqrt(this.sqKmPerPixel),
    );

    return {
      isLandAttack: false,
      distanceInKm: Math.max(120, kmDist),
      originCoordinate: singlePassResult.originCoord,
      targetCoordinate: scaledTargetPixel,
      pixelSteps: singlePassResult.pixelSteps,
    };
  }

  private checkDirectBorder(
    originCell: GridCell,
    targetNationId: string,
    allCells: GridCell[],
  ): boolean {
    const neighbors = [
      { x: (originCell.x + 1) % this.width, y: originCell.y },
      { x: (originCell.x - 1 + this.width) % this.width, y: originCell.y },
      { x: originCell.x, y: Math.min(this.height - 1, originCell.y + 1) },
      { x: originCell.x, y: Math.max(0, originCell.y - 1) },
    ];

    for (const n of neighbors) {
      const match = allCells.find((c) => c.x === n.x && c.y === n.y);
      if (match && match.ownerId === targetNationId) {
        return true;
      }
    }

    return false;
  }

  private findClosestAttackerCell(
    attackerId: string,
    targetPixel: Coordinate,
    allCells: GridCell[],
  ): GridCell | undefined {
    let closest: GridCell | undefined = undefined;
    let minSquareDist = Infinity;

    for (let i = 0; i < allCells.length; i++) {
      const cell = allCells[i]!;
      if (cell.ownerId === attackerId) {
        const sqDist =
          Math.pow(cell.x - targetPixel.x, 2) +
          Math.pow(cell.y - targetPixel.y, 2);
        if (sqDist < minSquareDist) {
          minSquareDist = sqDist;
          closest = cell;
        }
      }
    }

    return closest;
  }

  private runSingleSourceSeaBfs(
    attackerId: string,
    targetPixel: Coordinate,
    allCells: GridCell[],
  ): { originCoord: Coordinate; pixelSteps: number } {
    const cellMap = new Map<number, GridCell>();
    for (let i = 0; i < allCells.length; i++) {
      const cell = allCells[i]!;
      cellMap.set(cell.y * this.width + cell.x, cell);
    }

    const queue: { x: number; y: number; steps: number }[] = [
      { x: targetPixel.x, y: targetPixel.y, steps: 0 },
    ];
    const visited = new Uint8Array(this.width * this.height);
    visited[targetPixel.y * this.width + targetPixel.x] = 1;

    let head = 0;

    while (head < queue.length) {
      const current = queue[head++]!;

      const currentCell = cellMap.get(current.y * this.width + current.x);
      if (currentCell && currentCell.ownerId === attackerId) {
        return {
          originCoord: { x: current.x, y: current.y },
          pixelSteps: current.steps,
        };
      }

      const neighbors = [
        { x: (current.x + 1) % this.width, y: current.y },
        { x: (current.x - 1 + this.width) % this.width, y: current.y },
        { x: current.x, y: Math.min(this.height - 1, current.y + 1) },
        { x: current.x, y: Math.max(0, current.y - 1) },
      ];

      for (const n of neighbors) {
        const vIdx = n.y * this.width + n.x;
        if (visited[vIdx] === 0) {
          const cell = cellMap.get(vIdx);
          if (
            cell &&
            (cell.ownerId === "WATER" ||
              cell.ownerId === "CLOSED_SEA" ||
              cell.ownerId === attackerId)
          ) {
            visited[vIdx] = 1;
            queue.push({ x: n.x, y: n.y, steps: current.steps + 1 });
          }
        }
      }
    }

    return {
      originCoord: targetPixel,
      pixelSteps: 25,
    };
  }
}
