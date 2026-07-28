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
    const countryCells = allCells.filter((c) => c.ownerId === countryId);
    if (countryCells.length === 0) {
      return new Map();
    }

    const cellMap = new Map<string, GridCell>();
    countryCells.forEach((c) => cellMap.set(`${c.x},${c.y}`, c));

    const visited = new Set<string>();
    const rawComponents: ClusterComponent[] = [];

    for (const cell of countryCells) {
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

        for (const n of neighbors) {
          let nx = n.x;
          if (nx < 0) nx = gridWidth - 1;
          else if (nx >= gridWidth) nx = 0;

          const nKey = `${nx},${n.y}`;
          if (!visited.has(nKey) && cellMap.has(nKey)) {
            visited.add(nKey);
            queue.push(cellMap.get(nKey)!);
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

    mergedClusters.forEach((cluster, index) => {
      const regionId = Math.min(index, 10);
      cluster.cells.forEach((c) => {
        c.enclaveId = regionId;
        regionAssignmentMap.set(`${c.x},${c.y}`, regionId);
      });
    });

    return regionAssignmentMap;
  }
}
