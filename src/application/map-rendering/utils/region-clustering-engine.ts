import { GridCell } from "@/domain/map/grid-cell.schema";

interface ClusterComponent {
  cells: GridCell[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  pixelCount: number;
}

export class RegionClusteringEngine {
  private readonly bufferSearchPixelRadius = 38;

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

    const mergedClusters = this.mergeNearComponents(rawComponents, gridWidth);

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
    gridWidth: number,
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

        if (this.areComponentsClose(c1, c2, gridWidth)) {
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
        pixelCount: totalPixels,
      });
    }

    return result;
  }

  private areComponentsClose(
    c1: ClusterComponent,
    c2: ClusterComponent,
    gridWidth: number,
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

    if (
      effectiveXDist > this.bufferSearchPixelRadius ||
      bboxYDist > this.bufferSearchPixelRadius
    ) {
      return false;
    }

    for (const cell1 of c1.cells) {
      for (const cell2 of c2.cells) {
        let dx = Math.abs(cell1.x - cell2.x);
        if (dx > gridWidth / 2) {
          dx = gridWidth - dx;
        }
        const dy = Math.abs(cell1.y - cell2.y);

        if (
          dx <= this.bufferSearchPixelRadius &&
          dy <= this.bufferSearchPixelRadius
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
