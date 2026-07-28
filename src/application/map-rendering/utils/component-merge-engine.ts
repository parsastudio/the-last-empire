import {
  ClusterComponent,
  ClusterDistanceEvaluator,
} from "./cluster-distance-evaluator";

export class ComponentMergeEngine {
  private distanceEvaluator = new ClusterDistanceEvaluator();

  public mergeNearComponents(
    components: ClusterComponent[],
    gridWidth: number,
    searchRadius: number,
  ): ClusterComponent[] {
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

        if (
          this.distanceEvaluator.areComponentsClose(
            c1,
            c2,
            gridWidth,
            searchRadius,
          )
        ) {
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
}
