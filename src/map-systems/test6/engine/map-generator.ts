import fs from "fs/promises";
import path from "path";
import { rasterizePolygon } from "./scanline-rasterizer";
import { FALLBACK_WORLD_MAP } from "@/application/fallback-map.config";
import { GeoJsonProcessor } from "./geojson-processor";
import { DistanceTransform } from "./distance-transform";
import { MapWriter } from "./map-writer";

export interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
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

  const countries: CountryMapping[] = [];
  countries.push({ id: 0, code: "WATER", name: "Ocean", color: [0, 0, 0] });

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

  const dist = distanceTransform.calculate(buffer, width, height);
  distanceTransform.applySeaDepths(buffer, dist, width, height);

  await writer.saveMaskImage(width, height, buffer, publicDir);

  return { countries };
}
