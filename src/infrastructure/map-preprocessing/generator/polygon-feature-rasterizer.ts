import { rasterizePolygon } from "../rasterizer/scanline-rasterizer";
import {
  GeoJsonProcessor,
  ProcessedFeature,
} from "../rasterizer/geojson-processor";

export class PolygonFeatureRasterizer {
  public rasterizeFeatures(
    features: ProcessedFeature[],
    processor: GeoJsonProcessor,
    width: number,
    height: number,
    buffer: Uint8Array,
    getCountryId: (code: string) => number,
  ): void {
    for (let i = 0; i < features.length; i++) {
      const feature = features[i]!;
      const countryId = getCountryId(feature.code);

      const processRing = (ring: number[][]) => {
        const points = processor.getPolygonPoints(ring, width, height);
        rasterizePolygon(points, width, height, countryId, buffer);
      };

      if (feature.geometry.type === "Polygon") {
        const rings = feature.geometry.coordinates as number[][][];
        for (let r = 0; r < rings.length; r++) {
          processRing(rings[r]!);
        }
      } else if (feature.geometry.type === "MultiPolygon") {
        const multiRings = feature.geometry.coordinates as number[][][][];
        for (let m = 0; m < multiRings.length; m++) {
          const polygonCoords = multiRings[m]!;
          for (let r = 0; r < polygonCoords.length; r++) {
            processRing(polygonCoords[r]!);
          }
        }
      }
    }
  }
}
