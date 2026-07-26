import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import zlib from "zlib";
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

function decodeOurIndexedPng(
  pngBuffer: Buffer,
  width = 4096,
  height = 2048,
): Uint8Array {
  if (
    pngBuffer[0] !== 0x89 ||
    pngBuffer[1] !== 0x50 ||
    pngBuffer[2] !== 0x4e ||
    pngBuffer[3] !== 0x47
  ) {
    throw new Error("Invalid PNG signature");
  }

  const idatChunks: Buffer[] = [];
  let pos = 8;

  while (pos < pngBuffer.length) {
    if (pos + 8 > pngBuffer.length) break;
    const length = pngBuffer.readUInt32BE(pos);
    const type = pngBuffer.toString("ascii", pos + 4, pos + 8);
    pos += 8;

    if (pos + length > pngBuffer.length) break;
    if (type === "IDAT") {
      idatChunks.push(pngBuffer.subarray(pos, pos + length));
    } else if (type === "IEND") {
      break;
    }
    pos += length + 4;
  }

  if (idatChunks.length === 0) {
    throw new Error("No IDAT chunk found in PNG");
  }

  const compressedIdat = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressedIdat);

  const scanlineSize = width + 1;
  if (decompressed.length !== height * scanlineSize) {
    throw new Error(`Unexpected decompressed size: ${decompressed.length}`);
  }

  const rawPixels = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const srcPos = y * scanlineSize + 1;
    const destPos = y * width;
    rawPixels.set(decompressed.subarray(srcPos, srcPos + width), destPos);
  }

  return rawPixels;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const source = searchParams.get("source") || "default";

    const publicDir = path.join(process.cwd(), "public");
    const sourceDirName = source === "edited" ? "edited-mask" : "test6";
    const sourceBinPath = path.join(publicDir, sourceDirName, "world-mask.bin");
    const sourceJsonPath = path.join(publicDir, sourceDirName, "mappings.json");

    let mappingsData: { countries: CountryMapping[] };
    try {
      const jsonStr = await fs.readFile(sourceJsonPath, "utf-8");
      mappingsData = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: `Mappings configuration file not found for: ${source}`,
        },
        { status: 400 },
      );
    }

    let binBuffer: Uint8Array;
    try {
      const fileBytes = await fs.readFile(sourceBinPath);
      binBuffer = new Uint8Array(fileBytes);
    } catch {
      const sourcePngPath = path.join(
        publicDir,
        sourceDirName,
        "world-mask.png",
      );
      try {
        const pngBytes = await fs.readFile(sourcePngPath);
        binBuffer = decodeOurIndexedPng(pngBytes, 4096, 2048);
        await fs.writeFile(sourceBinPath, binBuffer);
      } catch {
        return NextResponse.json(
          {
            success: false,
            error: `Source map mask image (world-mask.png) not found for: ${source}`,
          },
          { status: 404 },
        );
      }
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
