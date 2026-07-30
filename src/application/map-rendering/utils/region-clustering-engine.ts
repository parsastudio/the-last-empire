import { GridCell } from "@/domain/map/grid-cell.schema";
import { ClusterComponent } from "./cluster-distance-evaluator";
import { ComponentMergeEngine } from "./component-merge-engine";

export class RegionClusteringEngine {
  private readonly bufferSearchPixelRadius = 38;
  private mergeEngine = new ComponentMergeEngine();

  public clusterNationRegions(
    countryId: string,
    allCells: GridCell[],
    gridWidth = 1024,
  ): Map<string, number> {
    const countryCells: GridCell[] = [];
    for (let i = 0; i < allCells.length; i++) {
      if (allCells[i]!.ownerId === countryId) {
        countryCells.push(allCells[i]!);
      }
    }

    if (countryCells.length === 0) {
      return new Map();
    }

    const cellMap = new Map<string, GridCell>();
    for (let i = 0; i < countryCells.length; i++) {
      const c = countryCells[i]!;
      cellMap.set(`${c.x},${c.y}`, c);
    }

    const visited = new Set<string>();
    const rawComponents: ClusterComponent[] = [];

    for (let i = 0; i < countryCells.length; i++) {
      const cell = countryCells[i]!;
      const key = `${cell.x},${cell.y}`;
      if (visited.has(key)) continue;

      const queue: GridCell[] = [cell];
      visited.add(key);

      const compCells: GridCell[] = [];
      let minX = cell.x,
        maxX = cell.x;
      let minY = cell.y,
        maxY = cell.y;

      let head = 0;
      while (head < queue.length) {
        const curr = queue[head++]!;
        compCells.push(curr);

        minX = Math.min(minX, curr.x);
        maxX = Math.max(maxX, curr.x);
        minY = Math.min(minY, curr.y);
        maxY = Math.max(maxY, curr.y);

        const neighbors = [
          { x: curr.x + 1, y: curr.y },
          { x: curr.x - 1, y: curr.y },
          { x: curr.x, y: curr.y + 1 },
          { x: curr.x, y: curr.y - 1 },
          { x: curr.x + 1, y: curr.y + 1 },
          { x: curr.x - 1, y: curr.y - 1 },
          { x: curr.x + 1, y: curr.y - 1 },
          { x: curr.x - 1, y: curr.y + 1 },
        ];

        for (let j = 0; j < 8; j++) {
          let nx = neighbors[j]!.x;
          if (nx < 0) nx = gridWidth - 1;
          else if (nx >= gridWidth) nx = 0;

          const nKey = `${nx},${neighbors[j]!.y}`;
          if (!visited.has(nKey)) {
            const match = cellMap.get(nKey);
            if (match) {
              visited.add(nKey);
              queue.push(match);
            }
          }
        }
      }

      rawComponents.push({
        cells: compCells,
        minX,
        maxX,
        minY,
        maxY,
        pixelCount: compCells.length,
      });
    }

    const mergedClusters = this.mergeEngine.mergeNearComponents(
      rawComponents,
      gridWidth,
      this.bufferSearchPixelRadius,
    );

    mergedClusters.sort((a, b) => b.pixelCount - a.pixelCount);

    const regionAssignmentMap = new Map<string, number>();

    for (let i = 0; i < mergedClusters.length; i++) {
      const cluster = mergedClusters[i]!;
      const regionId = Math.min(i, 10);
      for (let j = 0; j < cluster.cells.length; j++) {
        const c = cluster.cells[j]!;
        c.enclaveId = regionId;
        regionAssignmentMap.set(`${c.x},${c.y}`, regionId);
      }
    }

    return regionAssignmentMap;
  }
}
