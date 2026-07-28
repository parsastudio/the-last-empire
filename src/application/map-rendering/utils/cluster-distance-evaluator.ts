import { GridCell } from "@/domain/map/grid-cell.schema";

export interface ClusterComponent {
  cells: GridCell[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  pixelCount: number;
}

export class ClusterDistanceEvaluator {
  public areComponentsClose(
    c1: ClusterComponent,
    c2: ClusterComponent,
    gridWidth: number,
    searchRadius: number,
  ): boolean {
    const bboxXDist = Math.max(
      0,
      Math.max(c1.minX - c2.maxX, c2.minX - c1.maxX),
    );
    const bboxYDist = Math.max(
      0,
      Math.max(c1.minY - c2.maxY, c2.minY - c1.maxY),
    );

    let effectiveXDist = bboxXDist;
    if (gridWidth - bboxXDist < effectiveXDist) {
      effectiveXDist = gridWidth - bboxXDist;
    }

    if (effectiveXDist > searchRadius || bboxYDist > searchRadius) {
      return false;
    }

    for (const cell1 of c1.cells) {
      for (const cell2 of c2.cells) {
        let dx = Math.abs(cell1.x - cell2.x);
        if (dx > gridWidth / 2) {
          dx = gridWidth - dx;
        }
        const dy = Math.abs(cell1.y - cell2.y);

        if (dx <= searchRadius && dy <= searchRadius) {
          return true;
        }
      }
    }

    return false;
  }
}
