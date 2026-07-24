import { Province } from "@/domain/map/province.schema";
import { COUNTRY_POLYGONS_CACHE } from "@/engine/map/grid-generator";
import {
  getBoundingBox,
  isPointInCountry,
} from "@/engine/map/utils/polygon-geometry";
import { checkSeaAccessAndGetCoastalPoints } from "@/engine/map/utils/adjacency-calculator";

export function generateProvinces(
  countryCode: string,
  name: string,
  centerX: number,
  centerY: number,
  hasSeaAccess: boolean,
  numProvinces = 5,
): Province[] {
  const provinces: Province[] = [];
  const polygons = COUNTRY_POLYGONS_CACHE[countryCode] || [];

  let capitalX = centerX;
  let capitalY = centerY;

  if (polygons.length > 0 && !isPointInCountry([centerX, centerY], polygons)) {
    let closestPt: [number, number] | null = null;
    let minDist = Infinity;
    for (const poly of polygons) {
      for (const pt of poly) {
        const dist = Math.hypot(pt[0] - centerX, pt[1] - centerY);
        if (dist < minDist) {
          minDist = dist;
          closestPt = pt;
        }
      }
    }
    if (closestPt) {
      capitalX = closestPt[0];
      capitalY = closestPt[1];
    }
  }

  const sampledPoints: [number, number][] = [[capitalX, capitalY]];

  if (polygons.length > 0 && numProvinces > 1) {
    const box = getBoundingBox(polygons);
    const w = box.maxX - box.minX;
    const h = box.maxY - box.minY;
    const minAllowedDist = Math.max(
      5,
      (Math.min(w, h) / Math.sqrt(numProvinces)) * 0.7,
    );

    for (let i = 1; i < numProvinces; i++) {
      let bestPt: [number, number] | null = null;
      let maxMinDist = -1;

      for (let attempt = 0; attempt < 800; attempt++) {
        const rx = box.minX + Math.random() * w;
        const ry = box.minY + Math.random() * h;
        if (isPointInCountry([rx, ry], polygons)) {
          let d = Infinity;
          for (const spt of sampledPoints) {
            const dist = Math.hypot(spt[0] - rx, spt[1] - ry);
            if (dist < d) d = dist;
          }
          if (d > minAllowedDist) {
            bestPt = [rx, ry];
            break;
          }
          if (d > maxMinDist) {
            maxMinDist = d;
            bestPt = [rx, ry];
          }
        }
      }

      if (bestPt) {
        sampledPoints.push(bestPt);
      } else {
        const angle = (i * 2 * Math.PI) / (numProvinces - 1);
        const r = Math.min(w, h) * 0.25;
        sampledPoints.push([
          capitalX + Math.cos(angle) * r,
          capitalY + Math.sin(angle) * r,
        ]);
      }
    }
  }

  const seaDetails = checkSeaAccessAndGetCoastalPoints(
    countryCode,
    COUNTRY_POLYGONS_CACHE,
  );
  const isCoastalCount = seaDetails.hasSeaAccess
    ? Math.max(1, Math.floor(numProvinces * 0.4))
    : 0;

  provinces.push({
    id: `${countryCode}_P1`,
    name: `${name} - Capital Region`,
    ownerNationId: countryCode,
    gdp: 0,
    population: 0,
    isCapital: true,
    territorySize: 10,
    x: sampledPoints[0][0],
    y: sampledPoints[0][1],
    isCoastal: seaDetails.hasSeaAccess && isCoastalCount > 0,
    isOccupied: false,
    neighbors: [],
  });

  for (let i = 1; i < numProvinces; i++) {
    const pt = sampledPoints[i];
    if (!pt) continue;
    let isProvCoastal = false;
    if (seaDetails.hasSeaAccess) {
      let isNearSea = false;
      for (const cv of seaDetails.coastalVertices) {
        if (Math.hypot(cv[0] - pt[0], cv[1] - pt[1]) < 35) {
          isNearSea = true;
          break;
        }
      }
      isProvCoastal = isNearSea;
    }

    provinces.push({
      id: `${countryCode}_P${i + 1}`,
      name: `${name} - Sector ${i}`,
      ownerNationId: countryCode,
      gdp: 0,
      population: 0,
      isCapital: false,
      territorySize: 10,
      x: pt[0],
      y: pt[1],
      isCoastal: isProvCoastal,
      isOccupied: false,
      neighbors: [],
    });
  }

  const capital = provinces[0];
  if (capital) {
    for (let i = 1; i < numProvinces; i++) {
      const p = provinces[i];
      if (p) {
        capital.neighbors.push(p.id);
        p.neighbors.push(capital.id);
      }
    }
  }

  for (let i = 1; i < numProvinces; i++) {
    const current = provinces[i];
    if (!current) continue;
    let closestNeighbor: Province | null = null;
    let minDist = Infinity;
    for (let j = 1; j < numProvinces; j++) {
      if (i === j) continue;
      const other = provinces[j];
      if (other) {
        const dist = Math.hypot(current.x - other.x, current.y - other.y);
        if (dist < minDist) {
          minDist = dist;
          closestNeighbor = other;
        }
      }
    }
    if (closestNeighbor) {
      if (!current.neighbors.includes(closestNeighbor.id)) {
        current.neighbors.push(closestNeighbor.id);
      }
      if (!closestNeighbor.neighbors.includes(current.id)) {
        closestNeighbor.neighbors.push(current.id);
      }
    }
  }

  return provinces;
}
