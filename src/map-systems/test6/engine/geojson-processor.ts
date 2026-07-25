import { EquirectangularProjection } from "./projection";

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
  private projection = new EquirectangularProjection();

  public extractFeatures(geoJson: {
    features: Array<{
      properties?: Record<string, unknown>;
      id?: string;
      geometry: { type: string; coordinates: unknown };
    }>;
  }): ProcessedFeature[] {
    const features: ProcessedFeature[] = [];
    for (const feature of geoJson.features) {
      const rawCode =
        feature.properties?.adm0_a3 ||
        feature.properties?.ISO_A3 ||
        feature.properties?.iso_a3 ||
        feature.id ||
        "";
      const code = rawCode.toString().toUpperCase();
      if (!code || code === "-99" || code === "ATA") {
        continue;
      }
      const name = (
        feature.properties?.name ||
        feature.properties?.NAME ||
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
      return this.projection.project(lng, lat, width, height);
    });
  }
}
