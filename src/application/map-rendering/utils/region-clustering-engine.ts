import { GridCell } from "@/domain/map/grid-cell.schema";

interface ClusterComponent {
  cells: GridCell[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  centerPixelX: number;
  centerPixelY: number;
  pixelCount: number;
}

export class RegionClusteringEngine {
  private readonly kmPerPixelEquator = 15.2;

  public clusterNationRegions(
    countryId: string,
    allCells: GridCell[],
    gridWidth = 1024,
    gridHeight = 512,
  ): Map<string, number> {
    const countryCells = allCells.filter((c) => c.ownerId === countryId);
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
      let sumX = 0,
        sumY = 0;

      let head = 0;
      while (head < queue.length) {
        const curr = queue[head++]!;
        compCells.push(curr);

        minX = Math.min(minX, curr.x);
        maxX = Math.max(maxX, curr.x);
        minY = Math.min(minY, curr.y);
        maxY = Math.max(maxY, curr.y);

        sumX += curr.x;
        sumY += curr.y;

        const neighbors = [
          { x: curr.x + 1, y: curr.y },
          { x: curr.x - 1, y: curr.y },
          { x: curr.x, y: curr.y + 1 },
          { x: curr.x, y: curr.y - 1 },
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
        centerPixelX: sumX / compCells.length,
        centerPixelY: sumY / compCells.length,
        pixelCount: compCells.length,
      });
    }

    const mergedClusters = this.mergeNearComponents(
      rawComponents,
      100,
      gridHeight,
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

  private mergeNearComponents(
    components: ClusterComponent[],
    maxDistanceKm: number,
    gridHeight: number,
  ): ClusterComponent[] {
    const parent = components.map((_, i) => i);

    const find = (i: number): number => {
      if (parent[i] === i) return i;
      parent[i] = find(parent[i]!);
      return parent[i]!;
    };

    const union = (i: number, j: number) => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        parent[rootI] = rootJ;
      }
    };

    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const c1 = components[i]!;
        const c2 = components[j]!;

        const midY = (c1.centerPixelY + c2.centerPixelY) / 2;
        const latRad = (0.5 - midY / gridHeight) * Math.PI;
        const scaleKm = this.kmPerPixelEquator * Math.cos(latRad);

        const dx = Math.abs(c1.centerPixelX - c2.centerPixelX);
        const dy = Math.abs(c1.centerPixelY - c2.centerPixelY);
        const distKm = Math.hypot(dx, dy) * scaleKm;

        if (distKm <= maxDistanceKm) {
          union(i, j);
        }
      }
    }

    const groups = new Map<number, ClusterComponent[]>();
    for (let i = 0; i < components.length; i++) {
      const root = find(i);
      if (!groups.has(root)) {
        groups.set(root, []);
      }
      groups.get(root)!.push(components[i]!);
    }

    const result: ClusterComponent[] = [];
    for (const group of groups.values()) {
      const allCells = group.flatMap((g) => g.cells);
      const totalPixels = allCells.reduce(
        (sum, c) => sum + c.highResPixelCount,
        0,
      );

      result.push({
        cells: allCells,
        minX: Math.min(...group.map((g) => g.minX)),
        maxX: Math.max(...group.map((g) => g.maxX)),
        minY: Math.min(...group.map((g) => g.minY)),
        maxY: Math.max(...group.map((g) => g.maxY)),
        centerPixelX:
          group.reduce((s, g) => s + g.centerPixelX * g.pixelCount, 0) /
          group.reduce((s, g) => s + g.pixelCount, 0),
        centerPixelY:
          group.reduce((s, g) => s + g.centerPixelY * g.pixelCount, 0) /
          group.reduce((s, g) => s + g.pixelCount, 0),
        pixelCount: totalPixels,
      });
    }

    return result;
  }
}
