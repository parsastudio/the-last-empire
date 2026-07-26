import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { MapPartitionEngine } from "@/application/map-rendering/map-partition-engine";
import { encodePng } from "@/application/map-rendering/png-encoder";
import { AreaWeightCalculator } from "@/application/map-rendering/generator/area-weight-calculator";
import { PARTITION_COUNTRIES_LIST } from "@/application/map-rendering/partition-config";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm: number;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source") || "default";

    const publicDir = path.join(process.cwd(), "public");
    const sourceDirName = source === "edited" ? "edited-mask" : "test6";
    const sourceBinPath = path.join(publicDir, sourceDirName, "world-mask.bin");
    const sourceJsonPath = path.join(publicDir, sourceDirName, "mappings.json");

    let binBuffer: Uint8Array;
    let mappingsData: { countries: CountryMapping[] };

    try {
      const fileBytes = await fs.readFile(sourceBinPath);
      binBuffer = new Uint8Array(fileBytes);
      const jsonStr = await fs.readFile(sourceJsonPath, "utf-8");
      mappingsData = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: `Source mask directory data not found for: ${source}`,
        },
        { status: 400 },
      );
    }

    const engine = new MapPartitionEngine();
    const partitionedBuffer = engine.applyPartition(
      binBuffer,
      4096,
      2048,
      mappingsData.countries,
    );

    const partitionDir = path.join(publicDir, "partition-mask");
    await fs.mkdir(partitionDir, { recursive: true });

    const palette: [number, number, number][] = [];
    for (let i = 0; i < 256; i++) {
      palette.push([0, 0, i]);
    }

    const pngBuffer = encodePng(4096, 2048, partitionedBuffer, palette);
    await fs.writeFile(path.join(partitionDir, "world-mask.png"), pngBuffer);
    await fs.writeFile(
      path.join(partitionDir, "world-mask.bin"),
      partitionedBuffer,
    );

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
        const id = partitionedBuffer[y * 4096 + x]!;
        if (id >= 11 && id < 256) {
          pixelAreas[id] += rowWeight;
        }
      }
    }

    const updatedCountries = mappingsData.countries
      .filter((c) => !PARTITION_COUNTRIES_LIST.includes(c.code))
      .map((c) => {
        if (c.id >= 11) {
          c.areaSqKm = Math.round(pixelAreas[c.id] || 0);
        }
        return c;
      });

    const newMappings = { countries: updatedCountries };
    await fs.writeFile(
      path.join(partitionDir, "mappings.json"),
      JSON.stringify(newMappings, null, 2),
      "utf-8",
    );

    return NextResponse.json({ success: true, data: newMappings });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Partition compilation failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
