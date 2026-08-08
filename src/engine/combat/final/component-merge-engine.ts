export interface LandClusterComponent {
  pixelIndices: number[];
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  size: number;
}

export class ComponentMergeEngine {
  public mergeNearComponents(
    components: LandClusterComponent[],
    width = 4096,
    searchRadius = 300,
  ): LandClusterComponent[] {
    if (components.length <= 1) return components;

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

        const directXDist = Math.max(
          0,
          Math.max(c1.minX - c2.maxX, c2.minX - c1.maxX),
        );
        const wrappedXDist1 = Math.max(0, width - c1.maxX + c2.minX);
        const wrappedXDist2 = Math.max(0, width - c2.maxX + c1.minX);
        const xDist = Math.min(directXDist, wrappedXDist1, wrappedXDist2);

        const yDist = Math.max(
          0,
          Math.max(c1.minY - c2.maxY, c2.minY - c1.maxY),
        );

        const distance = Math.hypot(xDist, yDist);

        if (distance <= searchRadius) {
          union(i, j);
        }
      }
    }

    const groups = new Map<number, LandClusterComponent[]>();
    for (let i = 0; i < components.length; i++) {
      const root = find(i);
      let list = groups.get(root);
      if (!list) {
        list = [];
        groups.set(root, list);
      }
      list.push(components[i]!);
    }

    const mergedResult: LandClusterComponent[] = [];
    for (const group of groups.values()) {
      const allIndices = group.flatMap((g) => g.pixelIndices);
      mergedResult.push({
        pixelIndices: allIndices,
        minX: Math.min(...group.map((g) => g.minX)),
        maxX: Math.max(...group.map((g) => g.maxX)),
        minY: Math.min(...group.map((g) => g.minY)),
        maxY: Math.max(...group.map((g) => g.maxY)),
        size: allIndices.length,
      });
    }

    return mergedResult;
  }
}
