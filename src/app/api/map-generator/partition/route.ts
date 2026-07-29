import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { MapPartitionEngine } from "@/application/map-rendering/map-partition-engine";
import { encodePng } from "@/application/map-rendering/png-encoder";
import { AreaWeightCalculator } from "@/application/map-rendering/generator/area-weight-calculator";
import { PARTITION_COUNTRIES_LIST } from "@/application/map-rendering/partition-config";
import { generateTest6Map } from "@/application/map-rendering/map-generator";
import { PngDecoder } from "@/application/map-rendering/utils/png-decoder";
import { GeometryDraw } from "@/application/map-rendering/utils/geometry-draw";
import { LowResPacker } from "@/application/map-rendering/utils/low-res-packer";
import { ClosedSeaDetector } from "@/application/map-rendering/utils/closed-sea-detector";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm: number;
}

export async function POST(request: Request): Promise<NextResponse> {
  const tStart = performance.now();
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source") || "default";
    const publicDir = path.join(process.cwd(), "public");
    const map1Dir = path.join(publicDir, "maps", "map1");
    const sourcePrefix = source === "edited" ? "edited" : "default";
    const sourceBinPath = path.join(map1Dir, `${sourcePrefix}-mask.bin`);
    const sourceJsonPath = path.join(map1Dir, `${sourcePrefix}-mappings.json`);

    let mappingsData: { countries: CountryMapping[] };
    try {
      const jsonStr = await fs.readFile(sourceJsonPath, "utf-8");
      mappingsData = JSON.parse(jsonStr);
    } catch {
      if (source === "default") {
        await generateTest6Map(4096, 2048);
        const jsonStr = await fs.readFile(sourceJsonPath, "utf-8");
        mappingsData = JSON.parse(jsonStr);
      } else {
        return NextResponse.json(
          {
            success: false,
            error: `Mappings configuration file not found for: ${source}`,
          },
          { status: 400 },
        );
      }
    }
    let binBuffer: Uint8Array;
    try {
      const fileBytes = await fs.readFile(sourceBinPath);
      binBuffer = new Uint8Array(fileBytes);
    } catch {
      const sourcePngPath = path.join(map1Dir, `${sourcePrefix}-mask.png`);
      try {
        const pngBytes = await fs.readFile(sourcePngPath);
        const decoder = new PngDecoder();
        binBuffer = decoder.decodeOurIndexedPng(pngBytes, 4096, 2048);
        await fs.writeFile(sourceBinPath, binBuffer);
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: `Source map mask image (${sourcePrefix}-mask.png) not found`,
          },
          { status: 404 },
        );
      }
    }
    const tReadEnd = performance.now();
    const engine = new MapPartitionEngine();
    const partitionedBuffer = engine.applyPartition(
      binBuffer,
      4096,
      2048,
      mappingsData.countries,
    );

    const draw = new GeometryDraw();
    draw.drawWaterLine(2414, 676, 2419, 687, partitionedBuffer, 4096, 2048, 0);
    draw.drawWaterLine(1136, 915, 1145, 925, partitionedBuffer, 4096, 2048, 0);

    const tPartitionEnd = performance.now();
    const areaCalculator = new AreaWeightCalculator();
    const totalSurfaceArea = areaCalculator.calculateTotalSurfaceAreaSqKm();
    const { weights, totalWeight = 0 } = areaCalculator.generateRowWeights(
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
    const tAreaEnd = performance.now();
    await fs.mkdir(map1Dir, { recursive: true });
    const palette: [number, number, number][] = [];
    for (let i = 0; i < 256; i++) {
      palette.push([0, 0, i]);
    }
    const pngBuffer = encodePng(4096, 2048, partitionedBuffer, palette);
    await fs.writeFile(path.join(map1Dir, "partition-mask.png"), pngBuffer);
    await fs.writeFile(
      path.join(map1Dir, "partition-mask.bin"),
      partitionedBuffer,
    );
    await fs.writeFile(
      path.join(map1Dir, "partition-mappings.json"),
      JSON.stringify(newMappings, null, 2),
      "utf-8",
    );

    const packer = new LowResPacker();
    const packed1024 = packer.pack4KTo1024(partitionedBuffer, 1024, 512, 4);

    const seaDetector = new ClosedSeaDetector();
    seaDetector.detectAndMarkClosedSeas(packed1024, 1024, 512);

    await fs.writeFile(
      path.join(map1Dir, "partition-mask-1024.bin"),
      packed1024,
    );

    const tWriteEnd = performance.now();
    const metrics = {
      readTimeMs: Math.round(tReadEnd - tStart),
      partitionTimeMs: Math.round(tPartitionEnd - tReadEnd),
      areaRecalcTimeMs: Math.round(tAreaEnd - tPartitionEnd),
      writeTimeMs: Math.round(tWriteEnd - tAreaEnd),
      totalTimeMs: Math.round(tWriteEnd - tStart),
    };
    return NextResponse.json({ success: true, data: newMappings, metrics });
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Partition compilation failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
