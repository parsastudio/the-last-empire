import {
  LandComponent,
  ArchipelagoGroup,
} from "@/infrastructure/map-preprocessing/final/province-cluster-types";

export class ArchipelagoGrouper {
  private static readonly MAX_WATER_DISTANCE = 65;

  public static groupComponents(
    components: LandComponent[],
    countryNumericId: number,
    width: number,
  ): ArchipelagoGroup[] {
    if (components.length === 0) {
      return [];
    }

    const n = components.length;
    const parent = Array.from({ length: n }, (_, i) => i);

    const find = (i: number): number => {
      let root = i;
      while (root !== parent[root]) {
        root = parent[root]!;
      }
      let curr = i;
      while (curr !== root) {
        const nxt = parent[curr]!;
        parent[curr] = root;
        curr = nxt;
      }
      return root;
    };

    const union = (i: number, j: number): void => {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        parent[rootI] = rootJ;
      }
    };

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const c1 = components[i]!;
        const c2 = components[j]!;

        const directX = Math.max(
          0,
          Math.max(c1.minX - c2.maxX, c2.minX - c1.maxX),
        );
        const wrapX1 = Math.max(0, width - c1.maxX + c2.minX);
        const wrapX2 = Math.max(0, width - c2.maxX + c1.minX);
        const distX = Math.min(directX, wrapX1, wrapX2);

        const distY = Math.max(
          0,
          Math.max(c1.minY - c2.maxY, c2.minY - c1.maxY),
        );
        const dist = Math.hypot(distX, distY);

        if (dist <= this.MAX_WATER_DISTANCE) {
          union(i, j);
        }
      }
    }

    const map = new Map<number, LandComponent[]>();
    for (let i = 0; i < n; i++) {
      const root = find(i);
      let list = map.get(root);
      if (!list) {
        list = [];
        map.set(root, list);
      }
      list.push(components[i]!);
    }

    const groups: ArchipelagoGroup[] = [];
    let groupId = 1;

    for (const comps of map.values()) {
      let totalPixels = 0;
      let sumX = 0;
      let sumY = 0;

      for (const c of comps) {
        totalPixels += c.size;
        sumX += c.centerX * c.size;
        sumY += c.centerY * c.size;
      }

      const centerX = Math.floor(sumX / (totalPixels || 1));
      const centerY = Math.floor(sumY / (totalPixels || 1));

      groups.push({
        id: groupId++,
        countryNumericId,
        components: comps,
        totalPixels,
        centerX,
        centerY,
      });
    }

    groups.sort((a, b) => b.totalPixels - a.totalPixels);
    return groups;
  }
}
