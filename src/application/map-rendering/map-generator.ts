import fs from "fs/promises";
import path from "path";
import { rasterizePolygon } from "./scanline-rasterizer";
import { FALLBACK_WORLD_MAP } from "@/application/fallback-map.config";
import { GeoJsonProcessor } from "./geojson-processor";
import { DistanceTransform } from "./distance-transform";
import { MapWriter } from "./map-writer";
import { AreaWeightCalculator } from "./generator/area-weight-calculator";
import { REAL_WORLD_COUNTRY_AREAS } from "../../domain/map/country-area-calibration.config";

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
      const multiRings = feature.geometry.coordinates as number[][][][];
      multiRings.forEach((polygonCoords) => {
        polygonCoords.forEach((ring) => processRing(ring));
      });
    }

    nextId++;
  }

  const pixelAreas = new Float64Array(nextId);
  pixelAreas.fill(0);

  const totalSurfaceAreaSqKm = areaCalculator.calculateTotalSurfaceAreaSqKm();
  const { weights, totalWeight } = areaCalculator.generateRowWeights(
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
      const calibratedArea =
        REAL_WORLD_COUNTRY_AREAS[c.code] ||
        REAL_WORLD_COUNTRY_AREAS[c.id.toString()] ||
        REAL_WORLD_COUNTRY_AREAS[`NATION_${c.id}`];
      c.areaSqKm = calibratedArea
        ? calibratedArea
        : Math.round(pixelAreas[c.id] || 0);
    }
  });

  const dist = distanceTransform.calculate(buffer, width, height);
  distanceTransform.applySeaDepths(buffer, dist, width, height);

  await writer.saveMaskImage(width, height, buffer, publicDir);
  await fs.writeFile(path.join(publicDir, "test6", "world-mask.bin"), buffer);

  const lowResWidth = 1024;
  const lowResHeight = 512;
  const scale = 4;
  const packed1024 = new Uint8Array(lowResWidth * lowResHeight * 3);

  for (let gy = 0; gy < lowResHeight; gy++) {
    for (let gx = 0; gx < lowResWidth; gx++) {
      const countryCounts = new Map<number, number>();
      const waterCounts = new Int32Array(11);

      for (let sy = 0; sy < scale; sy++) {
        for (let sx = 0; sx < scale; sx++) {
          const hx = gx * scale + sx;
          const hy = gy * scale + sy;
          const val = buffer[hy * width + hx] ?? 0;
          if (val >= 11) {
            countryCounts.set(val, (countryCounts.get(val) ?? 0) + 1);
          } else {
            waterCounts[val]++;
          }
        }
      }

      let finalB = 0;
      let maxCountryCount = 0;
      for (const [id, count] of countryCounts.entries()) {
        if (count > maxCountryCount) {
          maxCountryCount = count;
          finalB = id;
        }
      }

      let finalR = 0;
      if (finalB === 0) {
        let maxWaterCount = 0;
        for (let w = 0; w < 11; w++) {
          if (waterCounts[w] > maxWaterCount) {
            maxWaterCount = waterCounts[w];
            finalR = w;
          }
        }
      }

      const pIdx = (gy * lowResWidth + gx) * 3;
      packed1024[pIdx] = finalR;
      packed1024[pIdx + 1] = 0;
      packed1024[pIdx + 2] = finalB;
    }
  }

  await fs.writeFile(
    path.join(publicDir, "test6", "world-mask-1024.bin"),
    packed1024,
  );

  return { countries };
}
