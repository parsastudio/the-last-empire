import { InputFeature } from "./types";
import { calculatePolygonArea, getDistance } from "./geometry-utils";
import { PolygonDissolver } from "@/engine/map/utils/polygon-dissolver";
import { DELETED_COUNTRIES } from "@/application/config/deleted-countries";

export function consolidateWorldMap(features: InputFeature[]): InputFeature[] {
  const countries: {
    code: string;
    name: string;
    polygons: [number, number][][];
    area: number;
    edges: {
      p1: [number, number];
      p2: [number, number];
      mid: [number, number];
    }[];
    neighbors: Set<string>;
  }[] = [];

  features.forEach((f) => {
    const rawCode =
      f.properties?.adm0_a3 ||
      f.properties?.ISO_A3 ||
      f.properties?.iso_a3 ||
      f.id ||
      "";
    const code = rawCode.toString().toUpperCase();
    if (code === "-99" || code === "ATA") return;

    const name = f.properties?.name || f.properties?.NAME || code;

    const rawPolygons: [number, number][][] = [];
    const geom = f.geometry;
    if (geom.type === "Polygon") {
      const coords = geom.coordinates as number[][][];
      coords.forEach((ring) => {
        rawPolygons.push(ring.map((pt) => [pt[0], pt[1]]));
      });
    } else if (geom.type === "MultiPolygon") {
      const multi = geom.coordinates as number[][][][];
      multi.forEach((poly) => {
        poly.forEach((ring) => {
          rawPolygons.push(ring.map((pt) => [pt[0], pt[1]]));
        });
      });
    }

    const filteredPolygons: [number, number][][] = [];
    let totalArea = 0;

    const minAreaLimit = code === "CAN" || code === "RUS" ? 12.0 : 0.1;

    rawPolygons.forEach((poly) => {
      const area = calculatePolygonArea(poly);
      if (area >= minAreaLimit) {
        filteredPolygons.push(poly);
        totalArea += area;
      }
    });

    if (filteredPolygons.length === 0) return;

    const edges: {
      p1: [number, number];
      p2: [number, number];
      mid: [number, number];
    }[] = [];
    filteredPolygons.forEach((poly) => {
      for (let i = 0; i < poly.length; i++) {
        const p1 = poly[i];
        const p2 = poly[(i + 1) % poly.length];
        if (p1 && p2) {
          edges.push({
            p1,
            p2,
            mid: [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2],
          });
        }
      }
    });

    countries.push({
      code,
      name,
      polygons: filteredPolygons,
      area: totalArea,
      edges,
      neighbors: new Set<string>(),
    });
  });

  for (let i = 0; i < countries.length; i++) {
    for (let j = i + 1; j < countries.length; j++) {
      const c1 = countries[i]!;
      const c2 = countries[j]!;

      let isAdjacent = false;
      for (const e1 of c1.edges) {
        for (const e2 of c2.edges) {
          if (getDistance(e1.mid, e2.mid) < 0.05) {
            isAdjacent = true;
            break;
          }
        }
        if (isAdjacent) break;
      }

      if (isAdjacent) {
        c1.neighbors.add(c2.code);
        c2.neighbors.add(c1.code);
      }
    }
  }

  const activeCountries = countries.filter(
    (c) => !DELETED_COUNTRIES.has(c.code),
  );
  const deletedCountries = countries.filter((c) =>
    DELETED_COUNTRIES.has(c.code),
  );

  deletedCountries.sort((a, b) => a.area - b.area);

  deletedCountries.forEach((c) => {
    let smallestNeighbor: typeof c | undefined;
    let minArea = Infinity;

    c.neighbors.forEach((nCode) => {
      const neighbor = countries.find((x) => x.code === nCode);
      if (neighbor && neighbor.polygons.length > 0 && neighbor.area < minArea) {
        minArea = neighbor.area;
        smallestNeighbor = neighbor;
      }
    });

    if (smallestNeighbor) {
      smallestNeighbor.polygons.push(...c.polygons);
      smallestNeighbor.area += c.area;
      c.neighbors.forEach((nCode) => {
        if (nCode !== smallestNeighbor!.code) {
          smallestNeighbor!.neighbors.add(nCode);
        }
      });
      c.polygons = [];
      c.area = 0;
    } else {
      c.polygons = [];
      c.area = 0;
    }
  });

  const dissolver = new PolygonDissolver();
  const resultFeatures: InputFeature[] = [];

  activeCountries.forEach((c) => {
    if (c.polygons.length === 0) return;
    const dissolved = dissolver.dissolve(c.polygons);

    resultFeatures.push({
      type: "Feature",
      properties: {
        adm0_a3: c.code,
        ISO_A3: c.code,
        iso_a3: c.code,
        name: c.name,
        NAME: c.name,
      },
      geometry: {
        type: "MultiPolygon",
        coordinates: dissolved.map((poly) => [poly]),
      },
    });
  });

  return resultFeatures;
}
