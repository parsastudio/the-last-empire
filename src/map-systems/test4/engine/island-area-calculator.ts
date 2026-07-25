import { calculatePolygonArea } from "@/map-systems/test2/engine/geometry-utils";
import type { InputFeature } from "@/map-systems/test2/engine/types";

export interface IsolatedPolygon {
  id: string;
  countryCode: string;
  countryName: string;
  coordinates: [number, number][];
  area: number;
  center: [number, number];
}

interface GridBox {
  box: [number, number, number, number];
  clippedPolygons: [number, number][][];
  area: number;
}

export function smoothPolygonChaikin(
  poly: [number, number][],
  iterations = 2,
): [number, number][] {
  if (poly.length < 3) {
    return poly;
  }
  let current = [...poly];

  for (let iter = 0; iter < iterations; iter++) {
    const next: [number, number][] = [];
    for (let i = 0; i < current.length; i++) {
      const p1 = current[i];
      const p2 = current[(i + 1) % current.length];
      if (p1 && p2) {
        const q: [number, number] = [
          0.75 * p1[0] + 0.25 * p2[0],
          0.75 * p1[1] + 0.25 * p2[1],
        ];
        const r: [number, number] = [
          0.25 * p1[0] + 0.75 * p2[0],
          0.25 * p1[1] + 0.75 * p2[1],
        ];
        next.push(q);
        next.push(r);
      }
    }
    current = next;
  }

  return current;
}

function getBoundingBox(
  polygons: [number, number][][],
): [number, number, number, number] {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const poly of polygons) {
    for (const pt of poly) {
      if (pt[0] < minX) minX = pt[0];
      if (pt[1] < minY) minY = pt[1];
      if (pt[0] > maxX) maxX = pt[0];
      if (pt[1] > maxY) maxY = pt[1];
    }
  }
  return [minX, minY, maxX, maxY];
}

function clipEdge(
  polygon: [number, number][],
  isInside: (p: [number, number]) => boolean,
  getIntersection: (
    p1: [number, number],
    p2: [number, number],
  ) => [number, number],
): [number, number][] {
  if (polygon.length === 0) return [];
  const result: [number, number][] = [];
  let s = polygon[polygon.length - 1]!;
  for (let i = 0; i < polygon.length; i++) {
    const p = polygon[i]!;
    if (isInside(p)) {
      if (isInside(s)) {
        result.push(p);
      } else {
        result.push(getIntersection(s, p));
        result.push(p);
      }
    } else if (isInside(s)) {
      result.push(getIntersection(s, p));
    }
    s = p;
  }
  return result;
}

function clipPolygonToBox(
  polygon: [number, number][],
  box: [number, number, number, number],
): [number, number][] {
  const [xmin, ymin, xmax, ymax] = box;
  let outputList = polygon;

  outputList = clipEdge(
    outputList,
    (p) => p[0] >= xmin,
    (p1, p2) => {
      const t = (xmin - p1[0]) / (p2[0] - p1[0]);
      return [xmin, p1[1] + t * (p2[1] - p1[1])];
    },
  );

  outputList = clipEdge(
    outputList,
    (p) => p[0] <= xmax,
    (p1, p2) => {
      const t = (xmax - p1[0]) / (p2[0] - p1[0]);
      return [xmax, p1[1] + t * (p2[1] - p1[1])];
    },
  );

  outputList = clipEdge(
    outputList,
    (p) => p[1] >= ymin,
    (p1, p2) => {
      const t = (ymin - p1[1]) / (p2[1] - p1[1]);
      return [p1[0] + t * (p2[0] - p1[0]), ymin];
    },
  );

  outputList = clipEdge(
    outputList,
    (p) => p[1] <= ymax,
    (p1, p2) => {
      const t = (ymax - p1[1]) / (p2[1] - p1[1]);
      return [p1[0] + t * (p2[0] - p1[0]), ymax];
    },
  );

  return outputList;
}

export function subdivideSinglePolygon(
  polygon: [number, number][],
  targetN: number,
): [number, number][][] {
  if (targetN <= 1) {
    return [polygon];
  }

  const initialBox = getBoundingBox([polygon]);
  const initialArea = calculatePolygonArea(polygon);
  const activeBoxes: GridBox[] = [
    { box: initialBox, clippedPolygons: [polygon], area: initialArea },
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

    if (bestIdx === -1) {
      break;
    }

    const targetBox = activeBoxes[bestIdx];
    if (!targetBox) {
      break;
    }
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

  return activeBoxes.flatMap((b) => b.clippedPolygons);
}

function getCountryCode(
  properties: Record<string, unknown> | undefined,
  id?: string | number,
): string {
  if (!properties) {
    return id ? id.toString().toUpperCase() : "";
  }
  const keys = [
    "ADM0_A3",
    "adm0_a3",
    "ISO_A3_EH",
    "iso_a3_eh",
    "ISO_A3",
    "iso_a3",
  ];
  for (const key of keys) {
    const val = properties[key];
    if (typeof val === "string" && val !== "" && val !== "-99") {
      return val.toUpperCase();
    }
  }
  return id ? id.toString().toUpperCase() : "";
}

export function extractIsolatedPolygons(
  features: InputFeature[],
): IsolatedPolygon[] {
  const list: IsolatedPolygon[] = [];

  features.forEach((feature) => {
    const props = feature.properties as Record<string, unknown> | undefined;
    const countryCode = getCountryCode(props, feature.id);

    if (countryCode === "" || countryCode === "ATA") {
      return;
    }
    const countryName =
      feature.properties?.name || feature.properties?.NAME || countryCode;

    const rawPolygons: [number, number][][] = [];
    const geom = feature.geometry;

    if (geom.type === "Polygon") {
      const coords = geom.coordinates as number[][][];
      coords.forEach((ring) => {
        rawPolygons.push(ring.map((pt) => [pt[0], pt[1]]));
      });
    } else if (geom.type === "MultiPolygon") {
      const multiCoords = geom.coordinates as number[][][][];
      multiCoords.forEach((poly) => {
        poly.forEach((ring) => {
          rawPolygons.push(ring.map((pt) => [pt[0], pt[1]]));
        });
      });
    }

    rawPolygons.forEach((poly, index) => {
      const area = calculatePolygonArea(poly);
      if (area < 0.0001) {
        return;
      }

      let sumX = 0;
      let sumY = 0;
      poly.forEach((pt) => {
        sumX += pt[0];
        sumY += pt[1];
      });
      const center: [number, number] =
        poly.length > 0 ? [sumX / poly.length, sumY / poly.length] : [0, 0];

      list.push({
        id: `${countryCode}_ISLAND_${index + 1}`,
        countryCode,
        countryName,
        coordinates: poly,
        area,
        center,
      });
    });
  });

  return list;
}
