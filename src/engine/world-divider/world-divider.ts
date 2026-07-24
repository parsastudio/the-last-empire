import {
  getBoundingBox,
  calculatePolygonArea,
  getDistance,
  getPointToSegmentDistance,
} from "./geometry-utils";
import { clipPolygonToBox } from "./sutherland-hodgman";

export interface InputFeature {
  id?: string | number;
  properties?: {
    adm0_a3?: string | number;
    ISO_A3?: string | number;
    iso_a3?: string | number;
    name?: string;
    NAME?: string;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface SubdividedRegion {
  id: string;
  countryCode: string;
  countryName: string;
  polygons: [number, number][][];
  neighbors: string[];
  isCoastal: boolean;
  area: number;
  center: [number, number];
}

interface GridBox {
  box: [number, number, number, number];
  clippedPolygons: [number, number][][];
  area: number;
}

const LANDLOCKED_COUNTRIES = new Set([
  "MNG",
  "KAZ",
  "UZB",
  "TKM",
  "TJK",
  "KGZ",
  "AFG",
  "NPL",
  "BTN",
  "LAO",
  "ARM",
  "AZE",
  "CHE",
  "AUT",
  "HUN",
  "SVK",
  "CZE",
  "BLR",
  "BOL",
  "PRY",
  "ETH",
  "SSD",
  "TCD",
  "NER",
  "MLI",
  "RWA",
  "BDI",
  "UGA",
  "MWI",
  "ZMB",
  "ZWE",
  "BWA",
  "LSO",
  "SWZ",
  "AND",
  "LUX",
  "MDA",
]);

export function subdivideWorld(
  features: InputFeature[],
  targetRegionsTotal = 3000,
): SubdividedRegion[] {
  const validFeatures = features.filter((f) => {
    const code =
      f.properties?.adm0_a3 ||
      f.properties?.ISO_A3 ||
      f.properties?.iso_a3 ||
      f.id;
    return code && code !== "-99" && code !== "ATA";
  });

  const countriesData = validFeatures.map((f) => {
    const code = (
      f.properties?.adm0_a3 ||
      f.properties?.ISO_A3 ||
      f.properties?.iso_a3 ||
      f.id ||
      ""
    )
      .toString()
      .toUpperCase();
    const name = f.properties?.name || f.properties?.NAME || "Region";
    const polygons: [number, number][][] = [];

    const geom = f.geometry;
    if (geom.type === "Polygon") {
      const coords = geom.coordinates as number[][][];
      coords.forEach((ring) => {
        const polyPoints: [number, number][] = ring.map((pt) => [pt[0], pt[1]]);
        polygons.push(polyPoints);
      });
    } else if (geom.type === "MultiPolygon") {
      const multiCoords = geom.coordinates as number[][][][];
      multiCoords.forEach((poly) => {
        poly.forEach((ring) => {
          const polyPoints: [number, number][] = ring.map((pt) => [
            pt[0],
            pt[1],
          ]);
          polygons.push(polyPoints);
        });
      });
    }

    let countryArea = 0;
    polygons.forEach((p) => {
      countryArea += calculatePolygonArea(p);
    });

    const originalEdges: {
      p1: [number, number];
      p2: [number, number];
      mid: [number, number];
    }[] = [];
    polygons.forEach((poly) => {
      for (let i = 0; i < poly.length; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % poly.length];
        if (p1 && p2) {
          originalEdges.push({
            p1,
            p2,
            mid: [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2],
          });
        }
      }
    });

    return {
      code,
      name,
      polygons,
      area: countryArea,
      originalEdges,
      originalCoastalEdges: [] as {
        p1: [number, number];
        p2: [number, number];
        mid: [number, number];
      }[],
    };
  });

  countriesData.forEach((c1) => {
    c1.originalEdges.forEach((e1) => {
      let isLandBorder = false;
      for (const c2 of countriesData) {
        if (c1.code !== c2.code) {
          for (const e2 of c2.originalEdges) {
            if (getDistance(e1.mid, e2.mid) < 0.05) {
              isLandBorder = true;
              break;
            }
          }
        }
        if (isLandBorder) break;
      }
      if (!isLandBorder) {
        c1.originalCoastalEdges.push(e1);
      }
    });
  });

  let totalArea = 0;
  countriesData.forEach((c) => {
    totalArea += c.area;
  });

  const targetWeights = countriesData.map((c) => {
    const weight = Math.pow(c.area, 0.45);
    return { code: c.code, weight };
  });

  const totalWeight = targetWeights.reduce((sum, w) => sum + w.weight, 0);

  const regionAllocations: Record<string, number> = {};
  countriesData.forEach((c, idx) => {
    const w = targetWeights[idx]?.weight || 0;
    const count = Math.max(
      3,
      Math.round(targetRegionsTotal * (w / totalWeight)),
    );
    regionAllocations[c.code] = count;
  });

  const allRegions: SubdividedRegion[] = [];

  countriesData.forEach((country) => {
    const targetN = regionAllocations[country.code] || 3;
    if (country.polygons.length === 0) return;

    const fullBbox = getBoundingBox(country.polygons);
    let activeBoxes: GridBox[] = [
      { box: fullBbox, clippedPolygons: country.polygons, area: country.area },
    ];

    while (activeBoxes.length < targetN) {
      let bestIdx = -1;
      let maxArea = -1;
      for (let i = 0; i < activeBoxes.length; i++) {
        const item = activeBoxes[i];
        if (item && item.area > maxArea) {
          maxArea = item.area;
          bestIdx = i;
        }
      }

      if (bestIdx === -1) break;

      const targetBox = activeBoxes[bestIdx];
      if (!targetBox) break;
      activeBoxes.splice(bestIdx, 1);

      const [xmin, ymin, xmax, ymax] = targetBox.box;
      const w = xmax - xmin;
      const h = ymax - ymin;

      let box1: [number, number, number, number];
      let box2: [number, number, number, number];

      if (w > h) {
        const xmid = (xmin + xmax) / 2;
        box1 = [xmin, ymin, xmid, ymax];
        box2 = [xmid, ymin, xmax, ymax];
      } else {
        const ymid = (ymin + ymax) / 2;
        box1 = [xmin, ymin, xmax, ymid];
        box2 = [xmin, ymid, xmax, ymax];
      }

      const polys1: [number, number][][] = [];
      let area1 = 0;
      const polys2: [number, number][][] = [];
      let area2 = 0;

      for (const poly of targetBox.clippedPolygons) {
        const clip1 = clipPolygonToBox(poly, box1);
        if (clip1.length >= 3) {
          const a1 = calculatePolygonArea(clip1);
          if (a1 > 1e-6) {
            polys1.push(clip1);
            area1 += a1;
          }
        }

        const clip2 = clipPolygonToBox(poly, box2);
        if (clip2.length >= 3) {
          const a2 = calculatePolygonArea(clip2);
          if (a2 > 1e-6) {
            polys2.push(clip2);
            area2 += a2;
          }
        }
      }

      if (polys1.length > 0) {
        activeBoxes.push({ box: box1, clippedPolygons: polys1, area: area1 });
      }
      if (polys2.length > 0) {
        activeBoxes.push({ box: box2, clippedPolygons: polys2, area: area2 });
      }
    }

    activeBoxes.forEach((gBox, idx) => {
      let sumX = 0;
      let sumY = 0;
      let totalPts = 0;
      gBox.clippedPolygons.forEach((poly) => {
        poly.forEach((pt) => {
          sumX += pt[0];
          sumY += pt[1];
          totalPts++;
        });
      });

      const centerX =
        totalPts > 0 ? sumX / totalPts : (gBox.box[0] + gBox.box[2]) / 2;
      const centerY =
        totalPts > 0 ? sumY / totalPts : (gBox.box[1] + gBox.box[3]) / 2;

      allRegions.push({
        id: `${country.code}_R${idx + 1}`,
        countryCode: country.code,
        countryName: country.name,
        polygons: gBox.clippedPolygons,
        neighbors: [],
        isCoastal: false,
        area: gBox.area,
        center: [centerX, centerY],
      });
    });
  });

  const edgeMap = new Map<string, string[]>();

  allRegions.forEach((region) => {
    region.polygons.forEach((poly) => {
      for (let i = 0; i < poly.length; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % poly.length];
        if (!p1 || !p2) continue;

        const x1 = Math.round(p1[0] * 10000);
        const y1 = Math.round(p1[1] * 10000);
        const x2 = Math.round(p2[0] * 10000);
        const y2 = Math.round(p2[1] * 10000);

        const key1 = `${x1},${y1}`;
        const key2 = `${x2},${y2}`;
        const edgeKey = key1 < key2 ? `${key1}#${key2}` : `${key2}#${key1}`;

        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, []);
        }
        const list = edgeMap.get(edgeKey)!;
        if (!list.includes(region.id)) {
          list.push(region.id);
        }
      }
    });
  });

  edgeMap.forEach((regions, edgeKey) => {
    if (regions.length > 1) {
      for (let i = 0; i < regions.length; i++) {
        for (let j = i + 1; j < regions.length; j++) {
          const r1 = regions[i];
          const r2 = regions[j];
          const reg1 = allRegions.find((r) => r.id === r1);
          const reg2 = allRegions.find((r) => r.id === r2);
          if (reg1 && reg2) {
            if (!reg1.neighbors.includes(reg2.id)) reg1.neighbors.push(reg2.id);
            if (!reg2.neighbors.includes(reg1.id)) reg2.neighbors.push(reg1.id);
          }
        }
      }
    } else {
      const regId = regions[0];
      const reg = allRegions.find((r) => r.id === regId);
      if (reg) {
        const parts = edgeKey.split("#");
        if (parts[0] && parts[1]) {
          const c1 = parts[0].split(",");
          const c2 = parts[1].split(",");
          const p1: [number, number] = [
            Number(c1[0]) / 10000,
            Number(c1[1]) / 10000,
          ];
          const p2: [number, number] = [
            Number(c2[0]) / 10000,
            Number(c2[1]) / 10000,
          ];
          const mid: [number, number] = [
            (p1[0] + p2[0]) / 2,
            (p1[1] + p2[1]) / 2,
          ];

          const country = countriesData.find((c) => c.code === reg.countryCode);
          if (country && !LANDLOCKED_COUNTRIES.has(reg.countryCode)) {
            let matchesCoast = false;
            for (const cEdge of country.originalCoastalEdges) {
              if (getPointToSegmentDistance(mid, cEdge.p1, cEdge.p2) < 0.005) {
                matchesCoast = true;
                break;
              }
            }

            if (matchesCoast) {
              const isCaspianEdge =
                mid[0] >= 45.0 &&
                mid[0] <= 56.0 &&
                mid[1] >= 35.5 &&
                mid[1] <= 48.0;

              if (!isCaspianEdge) {
                reg.isCoastal = true;
              }
            }
          }
        }
      }
    }
  });

  return allRegions;
}
