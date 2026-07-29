import fs from "fs/promises";
import path from "path";
import { FALLBACK_WORLD_MAP } from "@/application/fallback-map.config";
import { GeoJsonProcessor } from "./geojson-processor";
import { DistanceTransform } from "./distance-transform";
import { MapWriter } from "./map-writer";
import { MapAreaPixelCounter } from "./generator/map-area-pixel-counter";
import { GeometryDraw } from "./utils/geometry-draw";
import { LowResPacker } from "./utils/low-res-packer";
import { ClosedSeaDetector } from "./utils/closed-sea-detector";
import { PolygonFeatureRasterizer } from "./generator/polygon-feature-rasterizer";

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
  const map1Dir = path.join(publicDir, "maps", "map1");
  await fs.mkdir(map1Dir, { recursive: true });

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
  const areaCounter = new MapAreaPixelCounter();
  const polygonRasterizer = new PolygonFeatureRasterizer();

  const countries: CountryMapping[] = [
    {
      id: 0,
      code: "WATER",
      name: "Ocean",
      color: [0, 0, 0],
      areaSqKm: 0,
    },
  ];

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
    nextId++;
  }

  polygonRasterizer.rasterizeFeatures(
    features,
    processor,
    width,
    height,
    buffer,
    11,
  );

  const draw = new GeometryDraw();
  draw.drawWaterLine(2414, 676, 2419, 687, buffer, width, height, 0);
  draw.drawWaterLine(1136, 915, 1145, 925, buffer, width, height, 0);

  const pixelAreas = areaCounter.calculateAreas(buffer, width, height, nextId);
  areaCounter.applyCalibratedAreas(countries, pixelAreas);

  const dist = distanceTransform.calculate(buffer, width, height);
  distanceTransform.applySeaDepths(buffer, dist, width, height);

  await writer.saveMaskImage(width, height, buffer, publicDir);
  await fs.writeFile(path.join(map1Dir, "default-mask.bin"), buffer);

  const packer = new LowResPacker();
  const packed1024 = packer.pack4KTo1024(buffer, 1024, 512, 4);

  const seaDetector = new ClosedSeaDetector();
  seaDetector.detectAndMarkClosedSeas(packed1024, 1024, 512);

  await fs.writeFile(path.join(map1Dir, "default-mask-1024.bin"), packed1024);

  return { countries };
}
