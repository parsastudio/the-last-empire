import fs from "fs/promises";
import path from "path";
import { rasterizePolygon } from "./scanline-rasterizer";
import { FALLBACK_WORLD_MAP } from "@/application/fallback-map.config";
import { GeoJsonProcessor } from "./geojson-processor";
import { DistanceTransform } from "./distance-transform";
import { MapWriter } from "./map-writer";
import { AreaWeightCalculator } from "./generator/area-weight-calculator";
import { GLOBAL_DEVIATION_FACTOR } from "../../domain/map/country-area-calibration.config";
import { GeometryDraw } from "./utils/geometry-draw";
import { LowResPacker } from "./utils/low-res-packer";
import { ClosedSeaDetector } from "./utils/closed-sea-detector";

export interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm: number;
}

export async function generateTest6Map(
  width: number,
  height: number,
): Promise<{ countries: CountryMapping[] }> {
  const publicDir = path.join(process.cwd(), "public");
  const geojsonPath = path.join(publicDir, "ne_110m_admin_0_countries.geojson");
  let geoJson: typeof FALLBACK_WORLD_MAP;
  try {
    const raw = await fs.readFile(geojsonPath, "utf-8");
    geoJson = JSON.parse(raw);
  } catch {
    geoJson = FALLBACK_WORLD_MAP;
  }
  const processor = new GeoJsonProcessor();
  const distanceTransform = new DistanceTransform();
  const writer = new MapWriter();
  const areaCalculator = new AreaWeightCalculator();
  const countries: CountryMapping[] = [];
  countries.push({
    id: 0,
    code: "WATER",
    name: "Ocean",
    color: [0, 0, 0],
    areaSqKm: 0,
  });
  const buffer = new Uint8Array(width * height);
  buffer.fill(0);
  const features = processor.extractFeatures(geoJson);
  let nextId = 11;
  for (const feature of features) {
    countries.push({
      id: nextId,
      code: feature.code,
      name: feature.name,
      color: [0, 0, nextId],
      areaSqKm: 0,
    });
    const processRing = (ring: number[][]) => {
      const points = processor.getPolygonPoints(ring, width, height);
      rasterizePolygon(points, width, height, nextId, buffer);
    };
    if (feature.geometry.type === "Polygon") {
      const rings = feature.geometry.coordinates as number[][][];
      rings.forEach((ring) => processRing(ring));
    } else if (feature.geometry.type === "MultiPolygon") {
      const multiRings = feature.geometry.coordinates as number[][][];
      multiRings.forEach((polygonCoords) => {
        polygonCoords.forEach((ring) => processRing(ring));
      });
    }
    nextId++;
  }

  const draw = new GeometryDraw();
  draw.drawWaterLine(2414, 676, 2419, 687, buffer, width, height, 0);
  draw.drawWaterLine(1136, 915, 1145, 925, buffer, width, height, 0);

  const pixelAreas = new Float64Array(nextId);
  pixelAreas.fill(0);
  const totalSurfaceAreaSqKm = areaCalculator.calculateTotalSurfaceAreaSqKm();
  const { weights, totalWeight = 0 } = areaCalculator.generateRowWeights(
    height,
    width,
  );
  const areaPerUnit = totalSurfaceAreaSqKm / totalWeight;
  for (let y = 0; y < height; y++) {
    const rowWeight = weights[y] * areaPerUnit;
    for (let x = 0; x < width; x++) {
      const id = buffer[y * width + x]!;
      if (id >= 11 && id < nextId) {
        pixelAreas[id] += rowWeight;
      }
    }
  }
  countries.forEach((c) => {
    if (c.id >= 11) {
      c.areaSqKm = Math.round(
        (pixelAreas[c.id] || 0) * GLOBAL_DEVIATION_FACTOR,
      );
    }
  });
  const dist = distanceTransform.calculate(buffer, width, height);

  distanceTransform.applySeaDepths(buffer, dist, width, height);
  await writer.saveMaskImage(width, height, buffer, publicDir);
  await fs.writeFile(path.join(publicDir, "test6", "world-mask.bin"), buffer);

  const packer = new LowResPacker();
  const packed1024 = packer.pack4KTo1024(buffer, 1024, 512, 4);

  const seaDetector = new ClosedSeaDetector();
  seaDetector.detectAndMarkClosedSeas(packed1024, 1024, 512);

  await fs.writeFile(
    path.join(publicDir, "test6", "world-mask-1024.bin"),
    packed1024,
  );
  return { countries };
}
