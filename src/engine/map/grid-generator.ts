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

      provinces[provinceId] = {
        id: provinceId,
        name: `${name} Region`,
        ownerNationId: countryCode,
        gdp: rawGdp * 1000000,
        population: rawPop,
        isCapital: true,
        territorySize: 100,
      };

      const geometry = feature.geometry;
      let pathData = "";

      if (geometry.type === "Polygon") {
        pathData = this.buildPathFromPolygon(
          geometry.coordinates as number[][][],
          width,
          height,
        );
      } else if (geometry.type === "MultiPolygon") {
        pathData = (geometry.coordinates as number[][][][])
          .map((polygonCoords) =>
            this.buildPathFromPolygon(polygonCoords, width, height),
          )
          .join(" ");
      }

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
