import {
  partitionPolygonToVoronoiCells,
  generateOrganicSeeds,
} from "./voronoi-partitioner";
import { calculatePolygonArea } from "@/map-systems/test2/engine/geometry-utils";
import { buildTest5Topology } from "./topology-builder";
import { DELETED_CODES } from "./deleted-codes";

export interface GeoJsonCountryFeature {
  type: "Feature";
  properties: Record<string, unknown>;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface ConsolidatedRegion {
  id: string;
  countryCode: string;
  countryName: string;
  coordinates: [number, number][];
  area: number;
  center: [number, number];
  neighbors: string[];
}

function getCountryCode(properties: Record<string, unknown>): string {
  if (!properties) return "";
  const keys = [
    "ADM0_A3",
    "adm0_a3",
    "ISO_A3",
    "iso_a3",
    "ISO_A3_EH",
    "iso_a3_eh",
  ];
  for (const key of keys) {
    const val = properties[key];
    if (typeof val === "string" && val) {
      return val.toUpperCase();
    }
    if (typeof val === "number" && val) {
      return String(val).toUpperCase();
    }
  }
  return "";
}

function getCountryName(properties: Record<string, unknown>): string {
  if (!properties) return "";
  const keys = ["NAME", "name", "NAME_LONG", "name_long"];
  for (const key of keys) {
    const val = properties[key];
    if (typeof val === "string" && val) {
      return val;
    }
  }
  return "";
}

export function processConsolidationTest5(
  features: GeoJsonCountryFeature[],
  width: number,
  height: number,
): ConsolidatedRegion[] {
  const regions: ConsolidatedRegion[] = [];
  const survivorCountries: {
    code: string;
    name: string;
    polys: [number, number][][];
  }[] = [];
  const deletedCountries: {
    code: string;
    name: string;
    polys: [number, number][][];
  }[] = [];

  features.forEach((feature) => {
    const props = feature.properties;
    const code = getCountryCode(props);
    if (!code || code === "ATA" || code === "-99") return;

    const name = getCountryName(props) || code;
    const geometry = feature.geometry;
    const countryPolygons: [number, number][][] = [];

    const processRing = (ring: number[][]) => {
      const polyPoints: [number, number][] = [];
      ring.forEach((coord) => {
        if (coord[0] !== undefined && coord[1] !== undefined) {
          const x = ((coord[0] + 180) / 360) * width;
          const y = ((90 - coord[1]) / 180) * height;
          polyPoints.push([x, y]);
        }
      });
      if (polyPoints.length >= 3) {
        countryPolygons.push(polyPoints);
      }
    };

    if (geometry.type === "Polygon") {
      const rings = geometry.coordinates as number[][][];
      rings.forEach((ring) => processRing(ring));
    } else if (geometry.type === "MultiPolygon") {
      const multiRings = geometry.coordinates as number[][][][];
      multiRings.forEach((polygonCoords) => {
        polygonCoords.forEach((ring) => processRing(ring));
      });
    }

    if (countryPolygons.length === 0) return;

    if (DELETED_CODES.has(code)) {
      deletedCountries.push({ code, name, polys: countryPolygons });
    } else {
      survivorCountries.push({ code, name, polys: countryPolygons });
    }
  });

  survivorCountries.forEach((country) => {
    country.polys.forEach((poly, index) => {
      const area = calculatePolygonArea(poly);
      let sumX = 0,
        sumY = 0;
      poly.forEach((pt) => {
        sumX += pt[0];
        sumY += pt[1];
      });
      regions.push({
        id: `${country.code}_REG_${index + 1}`,
        countryCode: country.code,
        countryName: country.name,
        coordinates: poly,
        area,
        center: [sumX / poly.length, sumY / poly.length],
        neighbors: [],
      });
    });
  });

  const cellsToAnnex: { originalCode: string; poly: [number, number][] }[] = [];

  deletedCountries.forEach((country) => {
    country.polys.forEach((poly) => {
      const area = calculatePolygonArea(poly);
      if (area < 1.5) {
        return;
      }

      const seedCount = Math.max(3, Math.min(15, Math.ceil(area / 15)));
      const seeds = generateOrganicSeeds(poly, seedCount);
      const cells = partitionPolygonToVoronoiCells(poly, seeds);

      cells.forEach((cell) => {
        cellsToAnnex.push({
          originalCode: country.code,
          poly: cell,
        });
      });
    });
  });

  cellsToAnnex.forEach((cell, index) => {
    let bestSurvivorCode = "";
    let minDistance = Infinity;

    let cellSumX = 0,
      cellSumY = 0;
    cell.poly.forEach((pt) => {
      cellSumX += pt[0];
      cellSumY += pt[1];
    });
    const cellCenter: [number, number] = [
      cellSumX / cell.poly.length,
      cellSumY / cell.poly.length,
    ];

    survivorCountries.forEach((surv) => {
      surv.polys.forEach((poly) => {
        for (const pt of poly) {
          const dist = Math.hypot(pt[0] - cellCenter[0], pt[1] - cellCenter[1]);
          if (dist < minDistance) {
            minDistance = dist;
            bestSurvivorCode = surv.code;
          }
        }
      });
    });

    if (bestSurvivorCode) {
      const area = calculatePolygonArea(cell.poly);
      regions.push({
        id: `ANNEXED_${cell.originalCode}_${index + 1}`,
        countryCode: bestSurvivorCode,
        countryName: bestSurvivorCode,
        coordinates: cell.poly,
        area,
        center: cellCenter,
        neighbors: [],
      });
    }
  });

  buildTest5Topology(regions);

  return regions;
}
