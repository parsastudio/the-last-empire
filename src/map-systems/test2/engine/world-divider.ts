import { getBoundingBox, calculatePolygonArea } from "./geometry-utils";
import { clipPolygonToBox } from "./sutherland-hodgman";
import { InputFeature, SubdividedRegion, GridBox } from "./types";
import { CountryData, classifyCountryBorders } from "./border-classifier";
import { buildNeighborTopology } from "./edge-topographer";

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

  const countriesData: CountryData[] = validFeatures.map((f) => {
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
      originalCoastalEdges: [],
    };
  });

  classifyCountryBorders(countriesData);

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
    const activeBoxes: GridBox[] = [
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

  buildNeighborTopology(allRegions, countriesData);

  return allRegions;
}
