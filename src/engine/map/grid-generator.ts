import type { Province } from "@/domain/map/province.schema";
import {
  FAMOUS_COUNTRIES,
  MINOR_MERGE_MAP,
} from "@/application/map-simplification.config";
import { GeoJsonData } from "./types";
import { calculateRingArea, snapCoord } from "./utils/polygon-geometry";
import { PolygonDissolver } from "./utils/polygon-dissolver";

export const COUNTRY_POLYGONS_CACHE: Record<string, [number, number][][]> = {};

export class GridGenerator {
  private readonly minPixelArea = 50;
  private dissolver = new PolygonDissolver();

  public generateVectorMap(
    geoJson: GeoJsonData,
    width: number,
    height: number,
  ): {
    provinces: Record<string, Province>;
    vectorProvinces: {
      id: string;
      countryCode: string;
      name: string;
      pathData: string;
    }[];
  } {
    const provinces: Record<string, Province> = {};
    const vectorProvinces: {
      id: string;
      countryCode: string;
      name: string;
      pathData: string;
    }[] = [];

    const validFeatures = geoJson.features.filter((f) => {
      const code = f.id || f.properties?.ISO_A3 || f.properties?.iso_a3;
      return code && code !== "-99" && code !== "ATA";
    });

    const parsedCountries: Record<
      string,
      {
        code: string;
        name: string;
        gdp: number;
        pop: number;
        polygons: [number, number][][];
      }
    > = {};

    validFeatures.forEach((feature) => {
      const rawCode =
        feature.id ||
        feature.properties?.ISO_A3 ||
        feature.properties?.iso_a3 ||
        "";
      const countryCode = rawCode.toString().toUpperCase();
      const rawGdp =
        feature.properties?.GDP_MD || feature.properties?.gdp_md || 10000;
      const rawPop =
        feature.properties?.POP_EST || feature.properties?.pop_est || 1000000;
      const name =
        feature.properties?.NAME ||
        feature.properties?.name ||
        "Unknown Region";

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
        if (polyPoints.length > 0) {
          const area = calculateRingArea(polyPoints);
          if (area >= this.minPixelArea) {
            countryPolygons.push(polyPoints);
          }
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

      if (countryPolygons.length > 0) {
        const maxArea = Math.max(
          ...countryPolygons.map((p) => calculateRingArea(p)),
        );
        const filteredPolygons = countryPolygons.filter((p) => {
          const area = calculateRingArea(p);
          return (
            p === countryPolygons[0] || area >= maxArea * 0.1 || area >= 200
          );
        });

        parsedCountries[countryCode] = {
          code: countryCode,
          name,
          gdp: rawGdp * 1000000,
          pop: rawPop,
          polygons: filteredPolygons,
        };
      }
    });

    const mergeTargets: Record<string, string[]> = {};
    Object.keys(parsedCountries).forEach((code) => {
      if (FAMOUS_COUNTRIES.has(code)) {
        mergeTargets[code] = [code];
      }
    });

    Object.keys(parsedCountries).forEach((code) => {
      if (FAMOUS_COUNTRIES.has(code)) return;

      const mergeParent = MINOR_MERGE_MAP[code];
      if (mergeParent && parsedCountries[mergeParent]) {
        if (!mergeTargets[mergeParent]) {
          mergeTargets[mergeParent] = [];
        }
        mergeTargets[mergeParent].push(code);
      } else {
        const adjacentFamous = this.findAdjacentFamous(code, parsedCountries);
        if (adjacentFamous && parsedCountries[adjacentFamous]) {
          if (!mergeTargets[adjacentFamous]) {
            mergeTargets[adjacentFamous] = [];
          }
          mergeTargets[adjacentFamous].push(code);
        }
      }
    });

    Object.entries(mergeTargets).forEach(([parentCode, mergedCodes]) => {
      const parent = parsedCountries[parentCode];
      if (!parent) return;

      let combinedPolygons: [number, number][][] = [];
      let combinedGdp = 0;
      let combinedPop = 0;

      mergedCodes.forEach((code) => {
        const child = parsedCountries[code];
        if (child) {
          combinedPolygons.push(...child.polygons);
          combinedGdp += child.gdp;
          combinedPop += child.pop;
        }
      });

      const dissolvedPolygons = this.dissolver.dissolve(combinedPolygons);
      COUNTRY_POLYGONS_CACHE[parentCode] = dissolvedPolygons;

      const provinceId = `${parentCode}_P1`;
      let minX = Infinity,
        maxX = -Infinity,
        minY = Infinity,
        maxY = -Infinity;
      let sumX = 0,
        sumY = 0,
        vertexCount = 0;

      dissolvedPolygons.forEach((poly) => {
        poly.forEach(([x, y]) => {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          sumX += x;
          sumY += y;
          vertexCount++;
        });
      });

      const centerX = vertexCount > 0 ? sumX / vertexCount : width / 2;
      const centerY = vertexCount > 0 ? sumY / vertexCount : height / 2;
      const areaWidth = maxX - minX;
      const areaHeight = maxY - minY;
      const boundingBoxArea = Math.max(10, Math.round(areaWidth * areaHeight));

      provinces[provinceId] = {
        id: provinceId,
        name: `${parent.name} Region`,
        ownerNationId: parentCode,
        gdp: combinedGdp,
        population: combinedPop,
        isCapital: true,
        territorySize: boundingBoxArea,
        x: centerX,
        y: centerY,
        isCoastal: false,
        isOccupied: false,
        neighbors: [],
      };

      const pathData = this.dissolver.buildPath(dissolvedPolygons);
      vectorProvinces.push({
        id: provinceId,
        countryCode: parentCode,
        name: parent.name,
        pathData,
      });
    });

    return {
      provinces,
      vectorProvinces,
    };
  }

  private findAdjacentFamous(
    targetCode: string,
    parsedCountries: Record<
      string,
      { code: string; polygons: [number, number][][] }
    >,
  ): string | null {
    const target = parsedCountries[targetCode];
    if (!target) return null;

    const targetVertices = new Set<string>();
    target.polygons.forEach((poly) => {
      poly.forEach(([x, y]) => {
        targetVertices.add(`${snapCoord(x)},${snapCoord(y)}`);
      });
    });

    let bestNeighbor: string | null = null;
    let maxSharedCount = 0;

    Object.entries(parsedCountries).forEach(([code, country]) => {
      if (code === targetCode || !FAMOUS_COUNTRIES.has(code)) return;

      let sharedCount = 0;
      country.polygons.forEach((poly) => {
        poly.forEach(([x, y]) => {
          if (targetVertices.has(`${snapCoord(x)},${snapCoord(y)}`)) {
            sharedCount++;
          }
        });
      });

      if (sharedCount > maxSharedCount) {
        maxSharedCount = sharedCount;
        bestNeighbor = code;
      }
    });

    return bestNeighbor;
  }
}
