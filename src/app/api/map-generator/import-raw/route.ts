import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { encodePng } from "@/application/map-rendering/png-encoder";
import { AreaWeightCalculator } from "@/application/map-rendering/generator/area-weight-calculator";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const buffer = await request.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const expectedLength = 4096 * 2048;

    if (bytes.length !== expectedLength) {
      return NextResponse.json(
        { success: false, error: "Invalid map resolution" },
        { status: 400 },
      );
    }

    const publicDir = path.join(process.cwd(), "public");
    const editedDir = path.join(publicDir, "edited-mask");
    await fs.mkdir(editedDir, { recursive: true });

    const palette: [number, number, number][] = [];
    for (let i = 0; i < 256; i++) {
      palette.push([0, 0, i]);
    }

    const pngBuffer = encodePng(4096, 2048, bytes, palette);
    await fs.writeFile(path.join(editedDir, "world-mask.png"), pngBuffer);
    await fs.writeFile(path.join(editedDir, "world-mask.bin"), bytes);

    const defaultMappingsPath = path.join(publicDir, "test6", "mappings.json");
    const editedMappingsPath = path.join(editedDir, "mappings.json");
    let mappings = { countries: [] };
    try {
      const current = await fs.readFile(defaultMappingsPath, "utf-8");
      mappings = JSON.parse(current);
    } catch {}

    const areaCalculator = new AreaWeightCalculator();
    const totalSurfaceArea = areaCalculator.calculateTotalSurfaceAreaSqKm();
    const { weights, totalWeight } = areaCalculator.generateRowWeights(
      2048,
      4096,
    );
    const areaPerUnit = totalSurfaceArea / totalWeight;

    const pixelAreas = new Float64Array(256);
    pixelAreas.fill(0);

    for (let y = 0; y < 2048; y++) {
      const rowWeight = weights[y] * areaPerUnit;
      for (let x = 0; x < 4096; x++) {
        const id = bytes[y * 4096 + x]!;
        if (id >= 11 && id < 256) {
          pixelAreas[id] += rowWeight;
        }
      }
    }

    if (mappings.countries && mappings.countries.length > 0) {
      mappings.countries.forEach((c: { id: number; areaSqKm: number }) => {
        if (c.id >= 11) {
          c.areaSqKm = Math.round(pixelAreas[c.id] || 0);
        }
      });
    }

    await fs.writeFile(
      editedMappingsPath,
      JSON.stringify(mappings, null, 2),
      "utf-8",
    );

    const lowResWidth = 1024;
    const lowResHeight = 512;
    const scale = 4;
    const packed1024 = new Uint8Array(lowResWidth * lowResHeight * 2);
    for (let gy = 0; gy < lowResHeight; gy++) {
      for (let gx = 0; gx < lowResWidth; gx++) {
        let hasForcedPassage = false;
        const countryCounts = new Map<number, number>();
        const waterCounts = new Int32Array(11);
        for (let sy = 0; sy < scale; sy++) {
          for (let sx = 0; sx < scale; sx++) {
            const hx = gx * scale + sx;
            const hy = gy * scale + sy;
            const val = bytes[hy * 4096 + hx] ?? 0;
            if (val === 254) {
              hasForcedPassage = true;
            } else if (val >= 11) {
              countryCounts.set(val, (countryCounts.get(val) ?? 0) + 1);
            } else {
              waterCounts[val]++;
            }
          }
        }
        let finalB = 0;
        let finalR = 0;
        if (hasForcedPassage) {
          finalB = 0;
          finalR = 1;
        } else {
          let maxCountryCount = 0;
          for (const [id, count] of countryCounts.entries()) {
            if (count > maxCountryCount) {
              maxCountryCount = count;
              finalB = id;
            }
          }
          if (finalB === 0) {
            let maxWaterCount = 0;
            for (let w = 0; w < 11; w++) {
              if (waterCounts[w] > maxWaterCount) {
                maxWaterCount = waterCounts[w];
                finalR = w;
              }
            }
          }
        }
        const pIdx = (gy * lowResWidth + gx) * 2;
        packed1024[pIdx] = (0 << 2) | (finalR & 0x3);
        packed1024[pIdx + 1] = finalB;
      }
    }

    const waterVisited = new Uint8Array(lowResWidth * lowResHeight);
    for (let gy = 0; gy < lowResHeight; gy++) {
      for (let gx = 0; gx < lowResWidth; gx++) {
        const startIdx = gy * lowResWidth + gx;
        const pIdx = startIdx * 2;
        const finalB = packed1024[pIdx + 1];
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
                  const nPIdx = nIdx * 2;
                  const nB = packed1024[nPIdx + 1];
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
            const cpIdx = idx * 2;
            if (isClosed) {
              packed1024[cpIdx] = (0 << 2) | 2;
            } else {
              const originalR = packed1024[cpIdx]! & 0x3;
              packed1024[cpIdx] = (0 << 2) | (originalR <= 1 ? 1 : 0);
            }
          }
        }
      }
    }

    await fs.writeFile(path.join(editedDir, "world-mask-1024.bin"), packed1024);

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Import failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
