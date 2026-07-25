import type { Province } from "@/domain/map/province.schema";
import { calculateRingArea } from "./polygon-geometry";
import { PolygonDissolver } from "./polygon-dissolver";
import type { GeoJsonData } from "./types";

export type {
  GeoJsonFeature,
  GeoJsonData,
  VectorProvince,
  GeneratedVectorMapPayload,
} from "./types";

export const COUNTRY_POLYGONS_CACHE: Record<string, [number, number][][]> = {};

export class GridGenerator {
  private readonly minPixelArea = 10;
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
      const code =
        f.properties?.adm0_a3 ||
        f.properties?.ISO_A3 ||
        f.properties?.iso_a3 ||
        f.id;
      return code && code !== "-99" && code !== "ATA";
    });

    let provinceIndex = 1;

    validFeatures.forEach((feature) => {
      const rawCode =
        feature.properties?.adm0_a3 ||
        feature.properties?.ISO_A3 ||
        feature.properties?.iso_a3 ||
        "";
      const countryCode = rawCode.toString().toUpperCase();
      const stateName = feature.properties?.name || "Region";

      const rawGdp = feature.properties?.gdp_md || 10000;
      const rawPop = feature.properties?.pop_est || 1000000;

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
        const dissolvedPolygons = this.dissolver.dissolve(countryPolygons);
        const provinceId = `${countryCode}_P${provinceIndex}`;
        provinceIndex++;

        COUNTRY_POLYGONS_CACHE[provinceId] = dissolvedPolygons;

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
        const boundingBoxArea = Math.max(
          10,
          Math.round(areaWidth * areaHeight),
        );

        provinces[provinceId] = {
          id: provinceId,
          name: `${stateName} - ${countryCode}`,
          ownerNationId: countryCode,
          gdp: rawGdp * 1000000,
          population: rawPop,
          isCapital: provinceId.endsWith("_P1") || provinceId.endsWith("_P2"),
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
          countryCode: countryCode,
          name: stateName,
          pathData,
        });
      }
    });

    const provinceList = Object.values(provinces);
    for (let i = 0; i < provinceList.length; i++) {
      for (let j = i + 1; j < provinceList.length; j++) {
        const p1 = provinceList[i];
        const p2 = provinceList[j];
        if (p1 && p2) {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (dist < 32) {
            p1.neighbors.push(p2.id);
            p2.neighbors.push(p1.id);
          }
        }
      }
    }

    return {
      provinces,
      vectorProvinces,
    };
  }
}
