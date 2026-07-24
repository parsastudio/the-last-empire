import { Province } from "@/domain/map/province.schema";
import { COUNTRY_POLYGONS_CACHE } from "@/engine/map/grid-generator";
import { isPointInCountry } from "@/engine/map/utils/polygon-geometry";

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

  const vertices: [number, number][] = [];
  polygons.forEach((poly) => {
    poly.forEach((pt) => {
      vertices.push(pt);
    });
  });

  if (vertices.length > 0) {
    const isCenterInside = isPointInCountry([centerX, centerY], polygons);
    if (!isCenterInside) {
      let closestPt: [number, number] | null = null;
      let minDist = Infinity;
      for (const pt of vertices) {
        const dist = Math.hypot(pt[0] - centerX, pt[1] - centerY);
        if (dist < minDist) {
          minDist = dist;
          closestPt = pt;
        }
      }
      if (closestPt) {
        capitalX = closestPt[0];
        capitalY = closestPt[1];
      }
    }
  }

  for (let i = 0; i < numProvinces; i++) {
    provinces.push({
      id: `${countryCode}_P${i + 1}`,
      name: i === 0 ? `${name} - Capital Region` : `${name} - Sector ${i}`,
      ownerNationId: countryCode,
      gdp: 0,
      population: 0,
      isCapital: i === 0,
      territorySize: 10,
      x: capitalX,
      y: capitalY,
      isCoastal: hasSeaAccess && i === 0,
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

  return provinces;
}
