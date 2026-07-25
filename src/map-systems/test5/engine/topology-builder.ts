import type { ConsolidatedRegion } from "./annexation-processor";

export function buildTest5Topology(regions: ConsolidatedRegion[]): void {
  const gridCellSize = 25;
  const spatialGrid = new Map<string, ConsolidatedRegion[]>();

  regions.forEach((reg) => {
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    reg.coordinates.forEach((pt) => {
      if (pt[0] < minX) minX = pt[0];
      if (pt[0] > maxX) maxX = pt[0];
      if (pt[1] < minY) minY = pt[1];
      if (pt[1] > maxY) maxY = pt[1];
    });

    const startGx = Math.floor(minX / gridCellSize);
    const endGx = Math.floor(maxX / gridCellSize);
    const startGy = Math.floor(minY / gridCellSize);
    const endGy = Math.floor(maxY / gridCellSize);

    for (let gx = startGx; gx <= endGx; gx++) {
      for (let gy = startGy; gy <= endGy; gy++) {
        const key = `${gx},${gy}`;
        if (!spatialGrid.has(key)) {
          spatialGrid.set(key, []);
        }
        spatialGrid.get(key)!.push(reg);
      }
    }
  });

  regions.forEach((reg1) => {
    const neighborSet = new Set<string>();
    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity;
    reg1.coordinates.forEach((pt) => {
      if (pt[0] < minX) minX = pt[0];
      if (pt[0] > maxX) maxX = pt[0];
      if (pt[1] < minY) minY = pt[1];
      if (pt[1] > maxY) maxY = pt[1];
    });

    const startGx = Math.floor(minX / gridCellSize);
    const endGx = Math.floor(maxX / gridCellSize);
    const startGy = Math.floor(minY / gridCellSize);
    const endGy = Math.floor(maxY / gridCellSize);

    const candidates = new Set<ConsolidatedRegion>();

    for (let gx = startGx; gx <= endGx; gx++) {
      for (let gy = startGy; gy <= endGy; gy++) {
        const key = `${gx},${gy}`;
        const list = spatialGrid.get(key);
        if (list) {
          list.forEach((c) => {
            if (c.id !== reg1.id) {
              candidates.add(c);
            }
          });
        }
      }
    }

    candidates.forEach((reg2) => {
      let isAdj = false;
      for (const p1 of reg1.coordinates) {
        for (const p2 of reg2.coordinates) {
          if (Math.hypot(p1[0] - p2[0], p1[1] - p2[1]) < 2.0) {
            isAdj = true;
            break;
          }
        }
        if (isAdj) break;
      }
      if (isAdj) {
        neighborSet.add(reg2.id);
      }
    });

    reg1.neighbors = Array.from(neighborSet);
  });
}
