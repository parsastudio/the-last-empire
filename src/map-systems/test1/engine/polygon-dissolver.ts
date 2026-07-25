import { snapCoord } from "./polygon-geometry";

export class PolygonDissolver {
  public dissolve(polygons: [number, number][][]): [number, number][][] {
    const segmentCounts = new Map<string, number>();
    const segmentMap = new Map<string, [[number, number], [number, number]]>();

    polygons.forEach((poly) => {
      for (let i = 0; i < poly.length; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % poly.length];
        if (!p1 || !p2) continue;

        const k1 = `${snapCoord(p1[0])},${snapCoord(p1[1])}_${snapCoord(p2[0])},${snapCoord(p2[1])}`;
        const k2 = `${snapCoord(p2[0])},${snapCoord(p2[1])}_${snapCoord(p1[0])},${snapCoord(p1[1])}`;
        const sortedKey = k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;

        segmentCounts.set(sortedKey, (segmentCounts.get(sortedKey) || 0) + 1);
        segmentMap.set(sortedKey, [p1, p2]);
      }
    });

    const adj = new Map<string, string[]>();
    const points = new Map<string, [number, number]>();

    segmentCounts.forEach((count, key) => {
      if (count === 1) {
        const seg = segmentMap.get(key);
        if (seg) {
          const [p1, p2] = seg;
          const k1 = `${snapCoord(p1[0])},${snapCoord(p1[1])}`;
          const k2 = `${snapCoord(p2[0])},${snapCoord(p2[1])}`;

          points.set(k1, p1);
          points.set(k2, p2);

          if (!adj.has(k1)) adj.set(k1, []);
          adj.get(k1)!.push(k2);
        }
      }
    });

    const visited = new Set<string>();
    const loops: [number, number][][] = [];

    for (const startKey of adj.keys()) {
      if (visited.has(startKey)) continue;

      const loop: [number, number][] = [];
      let currentKey: string | undefined = startKey;

      while (currentKey && !visited.has(currentKey)) {
        visited.add(currentKey);
        const pt = points.get(currentKey);
        if (pt) loop.push(pt);

        const neighbors: string[] = adj.get(currentKey) || [];
        let nextKey: string | undefined = neighbors.find(
          (n: string) => !visited.has(n),
        );
        if (!nextKey && neighbors.includes(startKey)) {
          nextKey = startKey;
        }
        currentKey = nextKey;
        if (nextKey === startKey) {
          const ptStart = points.get(startKey);
          if (ptStart) loop.push(ptStart);
          break;
        }
      }

      if (loop.length >= 3) {
        loops.push(loop);
      }
    }

    return loops.length > 0 ? loops : polygons;
  }

  public buildPath(polygons: [number, number][][]): string {
    let path = "";
    polygons.forEach((poly) => {
      if (poly.length === 0) return;
      let ringPath = "";
      poly.forEach((coord, idx) => {
        if (coord[0] !== undefined && coord[1] !== undefined) {
          if (idx === 0) {
            ringPath += `M ${coord[0].toFixed(1)},${coord[1].toFixed(1)}`;
          } else {
            ringPath += ` L ${coord[0].toFixed(1)},${coord[1].toFixed(1)}`;
          }
        }
      });
      ringPath += " Z";
      path += ringPath + " ";
    });
    return path.trim();
  }
}
