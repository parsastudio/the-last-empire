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
        const id = bytes[y * 4096 + x];
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

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Import failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
