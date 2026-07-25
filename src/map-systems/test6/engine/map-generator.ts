import fs from "fs/promises";
import path from "path";
import { encodePng } from "./png-encoder";
import { rasterizePolygon } from "./scanline-rasterizer";
import { FALLBACK_WORLD_MAP } from "@/application/fallback-map.config";
import type { GeoJsonData } from "@/map-systems/test1/engine/types";

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

  let geoJson: GeoJsonData;
  try {
    const raw = await fs.readFile(geojsonPath, "utf-8");
    geoJson = JSON.parse(raw);
  } catch {
    geoJson = FALLBACK_WORLD_MAP;
  }

  const countries: CountryMapping[] = [];
  countries.push({ id: 0, code: "WATER", name: "Ocean", color: [0, 0, 0] });

  const buffer = new Uint8Array(width * height);
  buffer.fill(0);

  let nextId = 11;
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
    const name = feature.properties?.name || feature.properties?.NAME || code;

    countries.push({ id: nextId, code, name, color: [0, 0, nextId] });

    const geom = feature.geometry;
    const processRing = (ring: number[][]) => {
      const polygonPoints = ring.map((pt) => {
        const lng = pt[0] ?? 0;
        const lat = pt[1] ?? 0;
        const x = ((lng + 180) / 360) * width;
        const y = ((90 - lat) / 180) * height;
        return { x, y };
      });
      rasterizePolygon(polygonPoints, width, height, nextId, buffer);
    };

    if (geom.type === "Polygon") {
      const rings = geom.coordinates as number[][][];
      rings.forEach((ring) => processRing(ring));
    } else if (geom.type === "MultiPolygon") {
      const multiRings = geom.coordinates as number[][][][];
      multiRings.forEach((polygonCoords) => {
        polygonCoords.forEach((ring) => processRing(ring));
      });
    }

    nextId++;
  }

  const dist = new Int32Array(width * height);
  dist.fill(9999);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (buffer[idx]! >= 11) {
        dist[idx] = 0;
      } else {
        if (x > 0) dist[idx] = Math.min(dist[idx]!, dist[idx - 1]! + 1);
        if (y > 0) dist[idx] = Math.min(dist[idx]!, dist[idx - width]! + 1);
      }
    }
  }

  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const idx = y * width + x;
      if (x < width - 1) dist[idx] = Math.min(dist[idx]!, dist[idx + 1]! + 1);
      if (y < height - 1)
        dist[idx] = Math.min(dist[idx]!, dist[idx + width]! + 1);
    }
  }

  for (let i = 0; i < width * height; i++) {
    if (buffer[i]! < 11) {
      const d = dist[i]!;
      const depthIndex = Math.max(
        0,
        Math.min(10, 10 - Math.floor(Math.sqrt(d) * 0.8)),
      );
      buffer[i] = depthIndex;
    }
  }

  const palette: [number, number, number][] = [];
  for (let i = 0; i < 256; i++) {
    palette.push([0, 0, i]);
  }

  const pngBuffer = encodePng(width, height, buffer, palette);
  const test6Dir = path.join(publicDir, "test6");
  await fs.mkdir(test6Dir, { recursive: true });
  await fs.writeFile(path.join(test6Dir, "world-mask.png"), pngBuffer);

  return { countries };
}
