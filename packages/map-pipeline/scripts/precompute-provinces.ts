import * as fs from "fs";

interface RawFeature {
  properties: {
    iso_a3?: string;
    ISO_A3?: string;
    name?: string;
    NAME?: string;
    provcode?: string;
    gdp_md?: number;
    pop_est?: number;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

interface RawGeoJson {
  features: RawFeature[];
}

interface ComputedProvince {
  id: string;
  name: string;
  countryCode: string;
  centerX: number;
  centerY: number;
  area: number;
  isCoastal: boolean;
  neighbors: string[];
}

function calculateCentroidAndArea(coordinates: number[][]): {
  cx: number;
  cy: number;
  area: number;
} {
  let area = 0;
  let cx = 0;
  let cy = 0;
  const n = coordinates.length;
  if (n < 3) {
    return { cx: 0, cy: 0, area: 0 };
  }
  for (let i = 0; i < n; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % n];
    if (p1 && p2) {
      const x1 = p1[0] ?? 0;
      const y1 = p1[1] ?? 0;
      const x2 = p2[0] ?? 0;
      const y2 = p2[1] ?? 0;
      const factor = x1 * y2 - x2 * y1;
      area += factor;
      cx += (x1 + x2) * factor;
      cy += (y1 + y2) * factor;
    }
  }
  area = Math.abs(area / 2);
  if (area === 0) {
    let sumX = 0;
    let sumY = 0;
    for (const p of coordinates) {
      sumX += p[0] ?? 0;
      sumY += p[1] ?? 0;
    }
    return { cx: sumX / n, cy: sumY / n, area: 1 };
  }
  cx = cx / (6 * area);
  cy = cy / (6 * area);
  return { cx, cy, area };
}

function extractAllPoints(feature: RawFeature): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const geomType = feature.geometry.type;
  if (geomType === "Polygon") {
    const rings = feature.geometry.coordinates as number[][][];
    for (const ring of rings) {
      for (const coord of ring) {
        const px = coord[0];
        const py = coord[1];
        if (px !== undefined && py !== undefined) {
          points.push({ x: px, y: py });
        }
      }
    }
  } else if (geomType === "MultiPolygon") {
    const polygons = feature.geometry.coordinates as number[][][][];
    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (const coord of ring) {
          const px = coord[0];
          const py = coord[1];
          if (px !== undefined && py !== undefined) {
            points.push({ x: px, y: py });
          }
        }
      }
    }
  }
  return points;
}

function areProvincesAdjacent(
  p1Points: { x: number; y: number }[],
  p2Points: { x: number; y: number }[],
): boolean {
  const threshold = 0.05;
  for (const pt1 of p1Points) {
    for (const pt2 of p2Points) {
      const dist = Math.sqrt(
        Math.pow(pt1.x - pt2.x, 2) + Math.pow(pt1.y - pt2.y, 2),
      );
      if (dist < threshold) {
        return true;
      }
    }
  }
  return false;
}

export function compileMapData(
  inputFilePath: string,
  outputFilePath: string,
): void {
  const rawData = fs.readFileSync(inputFilePath, "utf-8");
  const geoJson = JSON.parse(rawData) as RawGeoJson;
  const provinces: ComputedProvince[] = [];
  const featurePointsMap: Record<string, { x: number; y: number }[]> = {};

  geoJson.features.forEach((feature, idx) => {
    const countryCode = (
      feature.properties.iso_a3 ||
      feature.properties.ISO_A3 ||
      "UNK"
    ).toUpperCase();
    const provName =
      feature.properties.name || feature.properties.NAME || `Region ${idx}`;
    const pCode = feature.properties.provcode || `${countryCode}_R${idx}`;
    const provinceId = `${countryCode}_${pCode}`;

    let totalArea = 0;
    let weightedCx = 0;
    let weightedCy = 0;

    const geomType = feature.geometry.type;
    if (geomType === "Polygon") {
      const rings = feature.geometry.coordinates as number[][][];
      const outerRing = rings[0];
      if (outerRing) {
        const calc = calculateCentroidAndArea(outerRing);
        totalArea = calc.area;
        weightedCx = calc.cx * calc.area;
        weightedCy = calc.cy * calc.area;
      }
    } else if (geomType === "MultiPolygon") {
      const polygons = feature.geometry.coordinates as number[][][][];
      polygons.forEach((polygon) => {
        const outerRing = polygon[0];
        if (outerRing) {
          const calc = calculateCentroidAndArea(outerRing);
          totalArea += calc.area;
          weightedCx += calc.cx * calc.area;
          weightedCy += calc.cy * calc.area;
        }
      });
    }

    const finalCx = totalArea > 0 ? weightedCx / totalArea : 0;
    const finalCy = totalArea > 0 ? weightedCy / totalArea : 0;

    provinces.push({
      id: provinceId,
      name: provName,
      countryCode,
      centerX: Number(finalCx.toFixed(4)),
      centerY: Number(finalCy.toFixed(4)),
      area: Number(totalArea.toFixed(4)),
      isCoastal: false,
      neighbors: [],
    });

    featurePointsMap[provinceId] = extractAllPoints(feature);
  });

  for (let i = 0; i < provinces.length; i++) {
    const p1 = provinces[i];
    if (!p1) continue;
    const p1Points = featurePointsMap[p1.id] || [];

    for (let j = i + 1; j < provinces.length; j++) {
      const p2 = provinces[j];
      if (!p2) continue;
      const p2Points = featurePointsMap[p2.id] || [];

      if (areProvincesAdjacent(p1Points, p2Points)) {
        p1.neighbors.push(p2.id);
        p2.neighbors.push(p1.id);
      }
    }
  }

  fs.writeFileSync(outputFilePath, JSON.stringify(provinces, null, 2), "utf-8");
}
