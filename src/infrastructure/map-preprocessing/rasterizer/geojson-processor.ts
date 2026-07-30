export interface GeoJsonPoint {
  x: number;
  y: number;
}

export interface ProcessedFeature {
  code: string;
  name: string;
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
}

export class GeoJsonProcessor {
  public extractFeatures(geoJson: {
    features: Array<{
      properties?: Record<string, unknown>;
      id?: string;
      geometry: { type: string; coordinates: unknown };
    }>;
  }): ProcessedFeature[] {
    const features: ProcessedFeature[] = [];
    for (const feature of geoJson.features) {
      let code = "";
      if (feature.properties) {
        const keys = [
          "ADM0_A3",
          "adm0_a3",
          "ISO_A3",
          "iso_a3",
          "ADM0_A3_IS",
          "adm0_a3_is",
          "SOV_A3",
          "sov_a3",
          "ISO_A3_EH",
          "iso_a3_eh",
        ];
        for (const key of keys) {
          const val = feature.properties[key];
          if (val) {
            const str = val.toString().toUpperCase();
            if (str && str !== "-99" && str !== "-99.00") {
              code = str;
              break;
            }
          }
        }
      }
      if (!code && feature.id) {
        code = feature.id.toString().toUpperCase();
      }

      if (!code || code === "-99" || code === "-99.00" || code === "ATA") {
        continue;
      }

      const name = (
        feature.properties?.name ||
        feature.properties?.NAME ||
        feature.properties?.name_en ||
        feature.properties?.NAME_EN ||
        code
      ).toString();

      features.push({
        code,
        name,
        geometry: feature.geometry as ProcessedFeature["geometry"],
      });
    }
    return features;
  }

  public getPolygonPoints(
    ring: number[][],
    width: number,
    height: number,
  ): GeoJsonPoint[] {
    return ring.map((pt) => {
      const lng = pt[0] ?? 0;
      const lat = pt[1] ?? 0;
      const x = ((lng + 180) / 360) * width;
      const y = ((90 - lat) / 180) * height;
      return { x, y };
    });
  }
}
