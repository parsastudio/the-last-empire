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

function drawWaterLine(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  buffer: Uint8Array,
  width: number,
  height: number,
  color: number,
) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  let cx = x1;
  let cy = y1;
  while (true) {
    if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
      buffer[cy * width + cx] = color;
    }
    if (cx === x2 && cy === y2) break;
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }
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

  drawWaterLine(2414, 676, 2419, 687, buffer, width, height, 0);
  drawWaterLine(1136, 915, 1145, 925, buffer, width, height, 0);

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

  const waterVisited = new Uint8Array(lowResWidth * lowResHeight);
  for (let gy = 0; gy < lowResHeight; gy++) {
    for (let gx = 0; gx < lowResWidth; gx++) {
      const startIdx = gy * lowResWidth + gx;
      const pIdx = startIdx * 3;
      const finalB = packed1024[pIdx + 2];
      if (finalB === 0 && waterVisited[startIdx] === 0) {
        const component: number[] = [];
        const queue: number[] = [startIdx];
        waterVisited[startIdx] = 1;
        let head = 0;
        while (head < queue.length) {
          const curr = queue[head++];
          if (curr !== undefined) {
            component.push(curr);
            const cx = curr % lowResWidth;
            const cy = Math.floor(curr / lowResWidth);
            const neighbors = [
              { x: cx + 1, y: cy },
              { x: cx - 1, y: cy },
              { x: cx, y: cy + 1 },
              { x: cx, y: cy - 1 },
            ];
            for (const n of neighbors) {
              let nx = n.x;
              if (nx < 0) {
                nx = lowResWidth - 1;
              } else if (nx >= lowResWidth) {
                nx = 0;
              }
              const ny = n.y;
              if (ny >= 0 && ny < lowResHeight) {
                const nIdx = ny * lowResWidth + nx;
                const nPIdx = nIdx * 3;
                const nB = packed1024[nPIdx + 2];
                if (nB === 0 && waterVisited[nIdx] === 0) {
                  waterVisited[nIdx] = 1;
                  queue.push(nIdx);
                }
              }
            }
          }
        }
        const isClosed = component.length < 500;
        for (const idx of component) {
          const cpIdx = idx * 3;
          if (isClosed) {
            packed1024[cpIdx] = 2;
          } else {
            const originalR = packed1024[cpIdx]!;
            packed1024[cpIdx] = originalR <= 1 ? 1 : 0;
          }
        }
      }
    }
  }

  await fs.writeFile(
    path.join(publicDir, "test6", "world-mask-1024.bin"),
    packed1024,
  );
  return { countries };
}
