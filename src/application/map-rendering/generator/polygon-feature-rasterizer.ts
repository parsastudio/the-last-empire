import { rasterizePolygon } from "../scanline-rasterizer";
import { GeoJsonProcessor, ProcessedFeature } from "../geojson-processor";

export class PolygonFeatureRasterizer {
  public rasterizeFeatures(
    features: ProcessedFeature[],
    processor: GeoJsonProcessor,
    width: number,
    height: number,
    buffer: Uint8Array,
    startId = 11,
  ): number {
    let nextId = startId;

    for (const feature of features) {
      const processRing = (ring: number[][]) => {
        const points = processor.getPolygonPoints(ring, width, height);
        rasterizePolygon(points, width, height, nextId, buffer);
      };

      if (feature.geometry.type === "Polygon") {
        const rings = feature.geometry.coordinates as number[][][];
        rings.forEach((ring) => processRing(ring));
      } else if (feature.geometry.type === "MultiPolygon") {
        const multiRings = feature.geometry.coordinates as number[][][][];
        multiRings.forEach((polygonCoords) => {
          polygonCoords.forEach((ring) => processRing(ring));
        });
      }
      nextId++;
    }

    return nextId;
  }
}
