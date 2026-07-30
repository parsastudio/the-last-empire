import fs from "fs/promises";
import path from "path";
import { GeoJsonProcessor } from "./rasterizer/geojson-processor";
import { DistanceTransform } from "./distance-transform";
import { MapAreaPixelCounter } from "./generator/map-area-pixel-counter";
import { GeometryDraw } from "./utils/geometry-draw";
import { LowResPacker } from "./utils/low-res-packer";
import { ClosedSeaDetector } from "./utils/closed-sea-detector";
import { PolygonFeatureRasterizer } from "./generator/polygon-feature-rasterizer";
import { MapPathResolver } from "./map-path-resolver";
import { TerritoryPartitioner } from "./generator/territory-partitioner";
import { BoundarySmoother } from "./generator/boundary-smoother";
import { PngDecoder } from "./encoders/png-decoder";
import {
  ALL_COUNTRY_PROFILES,
  findCountryProfileByCode,
} from "@/infrastructure/data/countries";

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
  const targetDir = MapPathResolver.getMapServerDir("map1", mode);
  await fs.mkdir(targetDir, { recursive: true });

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
  const areaCounter = new MapAreaPixelCounter();
  const polygonRasterizer = new PolygonFeatureRasterizer();
  const partitioner = new TerritoryPartitioner();
  const boundarySmoother = new BoundarySmoother();

  const idToCodeMap = new Map<number, string>();
  const codeToIdMap = new Map<string, number>();

  const countries: CountryMapping[] = [
    {
      id: 0,
      code: "WATER",
      name: "Ocean",
      color: [0, 0, 0],
      areaSqKm: 0,
    },
  ];

  for (const profile of ALL_COUNTRY_PROFILES) {
    countries.push({
      id: profile.id,
      code: profile.code,
      name: profile.nameFa,
      color: [0, 0, profile.id],
      areaSqKm: 0,
    });
    idToCodeMap.set(profile.id, profile.code);
    codeToIdMap.set(profile.code.toUpperCase(), profile.id);
    if (profile.flagCode) {
      codeToIdMap.set(profile.flagCode.toUpperCase(), profile.id);
    }
  }

  const buffer = new Uint8Array(width * height);
  const features = processor.extractFeatures(geoJson);

  let fallbackId = 200;
  const getCountryId = (code: string): number => {
    const cleanCode = code.toUpperCase();
    if (codeToIdMap.has(cleanCode)) {
      return codeToIdMap.get(cleanCode)!;
    }

    const profile = findCountryProfileByCode(cleanCode);
    let assignedId = fallbackId;
    if (profile) {
      assignedId = profile.id;
    } else {
      fallbackId++;
    }

    codeToIdMap.set(cleanCode, assignedId);
    return assignedId;
  };

  for (const feature of features) {
    const countryId = getCountryId(feature.code);
    if (!idToCodeMap.has(countryId)) {
      countries.push({
        id: countryId,
        code: feature.code,
        name: feature.name,
        color: [0, 0, countryId],
        areaSqKm: 0,
      });
      idToCodeMap.set(countryId, feature.code);
    }
  }

  const editedMaskPath = MapPathResolver.getEditedMaskServerPath();
  const decodedMask = await PngDecoder.decodeIndexedPng(editedMaskPath);

  if (decodedMask && decodedMask.buffer.length === width * height) {
    buffer.set(decodedMask.buffer);
  } else {
    polygonRasterizer.rasterizeFeatures(
      features,
      processor,
      width,
      height,
      buffer,
      getCountryId,
    );
    const draw = new GeometryDraw();
    draw.drawWaterLine(2414, 676, 2419, 687, buffer, width, height, 254);
    draw.drawWaterLine(1136, 915, 1145, 925, buffer, width, height, 254);
  }

  if (mode === "partition") {
    partitioner.partitionBuffer(buffer, width, height, idToCodeMap);
  } else {
    boundarySmoother.smoothBoundaries(buffer, width, height);
  }

  const maxId = Math.max(...countries.map((c) => c.id), 255) + 1;
  const pixelAreas = areaCounter.calculateAreas(buffer, width, height, maxId);
  areaCounter.applyCalibratedAreas(countries, pixelAreas);

  const dist = distanceTransform.calculate(buffer, width, height);
  distanceTransform.applySeaDepths(buffer, dist, width, height);

  await fs.writeFile(path.join(targetDir, "mask-4k.bin"), buffer);

  const packer = new LowResPacker();
  const packed1024 = packer.pack4KTo1024(buffer, 1024, 512, 4);

  const seaDetector = new ClosedSeaDetector();
  seaDetector.detectAndMarkClosedSeas(packed1024, 1024, 512);

  await fs.writeFile(path.join(targetDir, "mask-1024.bin"), packed1024);

  return { countries };
}
