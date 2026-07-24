import type { Province } from "@/domain/map/province.schema";

export interface GeoJsonFeature {
  type: string;
  id?: string;
  properties: {
    ISO_A3?: string;
    iso_a3?: string;
    NAME?: string;
    name?: string;
    POP_EST?: number;
    pop_est?: number;
    GDP_MD?: number;
    gdp_md?: number;
  };
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJsonData {
  type: string;
  features: GeoJsonFeature[];
}

export interface VectorProvince {
  id: string;
  countryCode: string;
  name: string;
  pathData: string;
}

export interface GeneratedVectorMapPayload {
  provinces: Record<string, Province>;
  vectorProvinces: VectorProvince[];
}

export const COUNTRY_POLYGONS_CACHE: Record<string, [number, number][][]> = {};

export class GridGenerator {
  public generateVectorMap(
    geoJson: GeoJsonData,
    width: number,
    height: number,
  ): GeneratedVectorMapPayload {
    const provinces: Record<string, Province> = {};
    const vectorProvinces: VectorProvince[] = [];

    const validFeatures = geoJson.features.filter((f) => {
      const code = f.id || f.properties?.ISO_A3 || f.properties?.iso_a3;
      return code && code !== "-99" && code !== "ATA";
    });

    validFeatures.forEach((feature) => {
      const rawCode =
        feature.id ||
        feature.properties?.ISO_A3 ||
        feature.properties?.iso_a3 ||
        "";
      const countryCode = rawCode.toString().toUpperCase();
      const provinceId = `${countryCode}_P1`;

      const rawGdp =
        feature.properties?.GDP_MD || feature.properties?.gdp_md || 10000;
      const rawPop =
        feature.properties?.POP_EST || feature.properties?.pop_est || 1000000;
      const name =
        feature.properties?.NAME ||
        feature.properties?.name ||
        "Unknown Region";

      const geometry = feature.geometry;
      let pathData = "";
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      let sumX = 0;
      let sumY = 0;
      let vertexCount = 0;

      const countryPolygons: [number, number][][] = [];

      const trackCoords = (lon: number, lat: number) => {
        const x = ((lon + 180) / 360) * width;
        const y = ((90 - lat) / 180) * height;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

        sumX += x;
        sumY += y;
        vertexCount++;
      };

      if (geometry.type === "Polygon") {
        const rings = geometry.coordinates as number[][][];
        rings.forEach((ring) => {
          const polyPoints: [number, number][] = [];
          ring.forEach((coord) => {
            if (coord[0] !== undefined && coord[1] !== undefined) {
              trackCoords(coord[0], coord[1]);
              const x = ((coord[0] + 180) / 360) * width;
              const y = ((90 - coord[1]) / 180) * height;
              polyPoints.push([x, y]);
            }
          });
          if (polyPoints.length > 0) {
            countryPolygons.push(polyPoints);
          }
        });
        pathData = this.buildPathFromPolygon(rings, width, height);
      } else if (geometry.type === "MultiPolygon") {
        const multiRings = geometry.coordinates as number[][][][];
        multiRings.forEach((polygonCoords) => {
          polygonCoords.forEach((ring) => {
            const polyPoints: [number, number][] = [];
            ring.forEach((coord) => {
              if (coord[0] !== undefined && coord[1] !== undefined) {
                trackCoords(coord[0], coord[1]);
                const x = ((coord[0] + 180) / 360) * width;
                const y = ((90 - coord[1]) / 180) * height;
                polyPoints.push([x, y]);
              }
            });
            if (polyPoints.length > 0) {
              countryPolygons.push(polyPoints);
            }
          });
        });
        pathData = multiRings
          .map((polygonCoords) =>
            this.buildPathFromPolygon(polygonCoords, width, height),
          )
          .join(" ");
      }

      COUNTRY_POLYGONS_CACHE[countryCode] = countryPolygons;

      const areaWidth = maxX - minX;
      const areaHeight = maxY - minY;
      const boundingBoxArea = Math.max(10, Math.round(areaWidth * areaHeight));

      const centerX = vertexCount > 0 ? sumX / vertexCount : width / 2;
      const centerY = vertexCount > 0 ? sumY / vertexCount : height / 2;

      provinces[provinceId] = {
        id: provinceId,
        name: `${name} Region`,
        ownerNationId: countryCode,
        gdp: rawGdp * 1000000,
        population: rawPop,
        isCapital: true,
        territorySize: boundingBoxArea,
        x: centerX,
        y: centerY,
        isCoastal: false,
        isOccupied: false,
        neighbors: [],
      };

      vectorProvinces.push({
        id: provinceId,
        countryCode,
        name,
        pathData,
      });
    });

    return {
      provinces,
      vectorProvinces,
    };
  }

  private buildPathFromPolygon(
    coordinates: number[][][],
    width: number,
    height: number,
  ): string {
    let path = "";
    coordinates.forEach((ring) => {
      if (ring.length === 0) return;
      let ringPath = "";
      ring.forEach((coord, idx) => {
        const lon = coord[0];
        const lat = coord[1];
        if (lon !== undefined && lat !== undefined) {
          const x = ((lon + 180) / 360) * width;
          const y = ((90 - lat) / 180) * height;
          if (idx === 0) {
            ringPath += `M ${x.toFixed(1)},${y.toFixed(1)}`;
          } else {
            ringPath += ` L ${x.toFixed(1)},${y.toFixed(1)}`;
          }
        }
      });
      ringPath += " Z";
      path += ringPath + " ";
    });
    return path.trim();
  }
}
