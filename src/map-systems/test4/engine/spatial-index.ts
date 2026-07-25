import type { RegionPhase3 } from "./types";

export function buildSpatialNeighbors(
  regions: RegionPhase3[],
  gridCellSize = 10,
): void {
  const spatialGrid = new Map<string, RegionPhase3[]>();

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

    const startGx = Math.floor((minX + 180) / gridCellSize);
    const endGx = Math.floor((maxX + 180) / gridCellSize);
    const startGy = Math.floor((minY + 90) / gridCellSize);
    const endGy = Math.floor((maxY + 90) / gridCellSize);

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

    const startGx = Math.floor((minX + 180) / gridCellSize);
    const endGx = Math.floor((maxX + 180) / gridCellSize);
    const startGy = Math.floor((minY + 90) / gridCellSize);
    const endGy = Math.floor((maxY + 90) / gridCellSize);

    const candidateSet = new Set<string>();
    const neighborSet = new Set<string>();

    for (let gx = startGx; gx <= endGx; gx++) {
      for (let gy = startGy; gy <= endGy; gy++) {
        const key = `${gx},${gy}`;
        const list = spatialGrid.get(key);
        if (list) {
          list.forEach((reg2) => {
            if (reg2.id !== reg1.id) {
              candidateSet.add(reg2.id);
            }
          });
        }
      }
    }

    candidateSet.forEach((cId) => {
      const reg2 = regions.find((r) => r.id === cId);
      if (!reg2) return;

      let bminX = Infinity,
        bmaxX = -Infinity,
        bminY = Infinity,
        bmaxY = -Infinity;
      reg2.coordinates.forEach((pt) => {
        if (pt[0] < bminX) bminX = pt[0];
        if (pt[0] > bmaxX) bmaxX = pt[0];
        if (pt[1] < bminY) bminY = pt[1];
        if (pt[1] > bmaxY) bmaxY = pt[1];
      });

      if (
        minX - 0.35 > bmaxX ||
        bminX - 0.35 > maxX ||
        minY - 0.35 > bmaxY ||
        bminY - 0.35 > maxY
      ) {
        return;
      }

      let isAdj = false;
      for (let i = 0; i < reg1.coordinates.length; i++) {
        const p1 = reg1.coordinates[i];
        if (!p1) continue;
        for (let j = 0; j < reg2.coordinates.length; j++) {
          const p2 = reg2.coordinates[j];
          if (!p2) continue;
          const dist = Math.hypot(p1[0] - p2[0], p1[1] - p2[1]);
          if (dist < 0.35) {
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
