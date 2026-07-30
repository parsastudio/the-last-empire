import fs from "fs/promises";
import path from "path";
import { GeoJsonProcessor } from "./rasterizer/geojson-processor";
import { DistanceTransform } from "./distance-transform";
import { MapWriter } from "./encoders/map-writer";
import { MapAreaPixelCounter } from "./generator/map-area-pixel-counter";
import { GeometryDraw } from "./utils/geometry-draw";
import { LowResPacker } from "./utils/low-res-packer";
import { ClosedSeaDetector } from "./utils/closed-sea-detector";
import { PolygonFeatureRasterizer } from "./generator/polygon-feature-rasterizer";
import { MapPathResolver } from "./map-path-resolver";
import { TerritoryPartitioner } from "./generator/territory-partitioner";
import { PngDecoder } from "./encoders/png-decoder";

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
  mode = "partition",
): Promise<{ countries: CountryMapping[] }> {
  const tempDir = MapPathResolver.getMapServerDir("map1", "temp");
  await fs.mkdir(tempDir, { recursive: true });

  const geojsonPath = MapPathResolver.getGeoJsonServerPath();
  let geoJson: {
    features: Array<{
      properties?: Record<string, unknown>;
      id?: string;
      geometry: { type: string; coordinates: unknown };
    }>;
  };
  try {
    const raw = await fs.readFile(geojsonPath, "utf-8");
    geoJson = JSON.parse(raw);
  } catch {
    geoJson = { features: [] };
  }

  const processor = new GeoJsonProcessor();
  const distanceTransform = new DistanceTransform();
  const writer = new MapWriter();
  const areaCounter = new MapAreaPixelCounter();
  const polygonRasterizer = new PolygonFeatureRasterizer();
  const partitioner = new TerritoryPartitioner();

  const countries: CountryMapping[] = [
    {
      id: 0,
      code: "WATER",
      name: "Ocean",
      color: [0, 0, 0],
      areaSqKm: 0,
    },
  ];

  let buffer = new Uint8Array(width * height);
  const features = processor.extractFeatures(geoJson);
  const idToCodeMap = new Map<number, string>();

  let nextId = 11;
  for (const feature of features) {
    countries.push({
      id: nextId,
      code: feature.code,
      name: feature.name,
      color: [0, 0, nextId],
      areaSqKm: 0,
    });
    idToCodeMap.set(nextId, feature.code);
    nextId++;
  }

  const editedMaskPath = MapPathResolver.getEditedMaskServerPath();
  const decodedMask = await PngDecoder.decodeIndexedPng(editedMaskPath);

  if (decodedMask && decodedMask.buffer.length === width * height) {
    buffer = decodedMask.buffer;
  } else {
    polygonRasterizer.rasterizeFeatures(
      features,
      processor,
      width,
      height,
      buffer,
      11,
    );
    const draw = new GeometryDraw();
    draw.drawWaterLine(2414, 676, 2419, 687, buffer, width, height, 254);
    draw.drawWaterLine(1136, 915, 1145, 925, buffer, width, height, 254);
  }

  if (mode === "partition") {
    partitioner.partitionBuffer(buffer, width, height, idToCodeMap);
  }

  const pixelAreas = areaCounter.calculateAreas(buffer, width, height, nextId);
  areaCounter.applyCalibratedAreas(countries, pixelAreas);

  const dist = distanceTransform.calculate(buffer, width, height);
  distanceTransform.applySeaDepths(buffer, dist, width, height);

  const maskName = mode;

  await writer.saveMaskImage(width, height, buffer, "map1", maskName);
  await fs.writeFile(path.join(tempDir, `${maskName}-mask.bin`), buffer);

  const packer = new LowResPacker();
  const packed1024 = packer.pack4KTo1024(buffer, 1024, 512, 4);

  const seaDetector = new ClosedSeaDetector();
  seaDetector.detectAndMarkClosedSeas(packed1024, 1024, 512);

  await fs.writeFile(
    path.join(tempDir, `${maskName}-mask-1024.bin`),
    packed1024,
  );

  return { countries };
}
