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
    const isLandNeighbor = this.checkLandBorder(
      attackerId,
      targetNationId,
      allCells,
    );

    const closestAttackerCell = this.findClosestAttackerCell(
      attackerId,
      targetPixel,
      allCells,
    );

    const originCoord = closestAttackerCell
      ? { x: closestAttackerCell.x, y: closestAttackerCell.y }
      : targetPixel;

    if (isLandNeighbor) {
      const pixelDist = Math.hypot(
        originCoord.x - targetPixel.x,
        originCoord.y - targetPixel.y,
      );
      const distanceInKm = Math.round(pixelDist * Math.sqrt(this.sqKmPerPixel));

      return {
        isLandAttack: true,
        distanceInKm: Math.max(15, distanceInKm),
        originCoordinate: originCoord,
        targetCoordinate: targetPixel,
        pixelSteps: Math.ceil(pixelDist),
      };
    }

    const singlePassResult = this.runSingleSourceSeaBfs(
      attackerId,
      targetPixel,
      allCells,
    );

    const kmDist = Math.round(
      singlePassResult.pixelSteps * Math.sqrt(this.sqKmPerPixel),
    );

    return {
      isLandAttack: false,
      distanceInKm: Math.max(50, kmDist),
      originCoordinate: singlePassResult.originCoord,
      targetCoordinate: targetPixel,
      pixelSteps: singlePassResult.pixelSteps,
    };
  }

  private checkLandBorder(
    attackerId: string,
    targetNationId: string,
    allCells: GridCell[],
  ): boolean {
    const attackerCells = allCells.filter((c) => c.ownerId === attackerId);
    if (attackerCells.length === 0) return false;

    const attackerSet = new Set(attackerCells.map((c) => `${c.x},${c.y}`));

    for (const cell of allCells) {
      if (cell.ownerId === targetNationId) {
        const neighbors = [
          { x: cell.x + 1, y: cell.y },
          { x: cell.x - 1, y: cell.y },
          { x: cell.x, y: cell.y + 1 },
          { x: cell.x, y: cell.y - 1 },
        ];

        for (const n of neighbors) {
          if (attackerSet.has(`${n.x},${n.y}`)) {
            return true;
          }
        }
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

    for (const cell of allCells) {
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
    for (const cell of allCells) {
      const idx = cell.y * this.width + cell.x;
      cellMap.set(idx, cell);
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
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
      ];

      for (const n of neighbors) {
        let nx = n.x;
        if (nx < 0) nx = this.width - 1;
        else if (nx >= this.width) nx = 0;

        const ny = n.y;
        if (ny >= 0 && ny < this.height) {
          const vIdx = ny * this.width + nx;
          if (visited[vIdx] === 0) {
            const cell = cellMap.get(vIdx);
            if (
              cell &&
              (cell.ownerId === "WATER" ||
                cell.ownerId === "CLOSED_SEA" ||
                cell.ownerId === attackerId)
            ) {
              visited[vIdx] = 1;
              queue.push({ x: nx, y: ny, steps: current.steps + 1 });
            }
          }
        }
      }
    }

    return {
      originCoord: targetPixel,
      pixelSteps: 15,
    };
  }
}
