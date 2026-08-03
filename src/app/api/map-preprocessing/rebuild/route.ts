import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { generateTest6Map } from "@/infrastructure/map-preprocessing/map-generator";
import { MapManifestBuilder } from "@/infrastructure/map-preprocessing/generator/map-manifest-builder";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";
import { FinalStateLoader } from "@/infrastructure/storage/final-state-loader";

export async function POST(): Promise<NextResponse> {
  try {
    FinalStateLoader.clearCache();

    const tempDir = MapPathResolver.getMapServerDir("map1");
    await fs.mkdir(tempDir, { recursive: true });

    const generated = await generateTest6Map(4096, 2048);
    const mappingsPath = path.join(tempDir, "partition-mappings.json");

    await fs.writeFile(
      mappingsPath,
      JSON.stringify(generated, null, 2),
      "utf-8",
    );

    const builder = new MapManifestBuilder();
    await builder.buildAndSaveManifest(
      "map1",
      generated.countries || [],
      "manifest.json",
    );

    FinalStateLoader.clearCache();

    return NextResponse.json({
      success: true,
      message: "بازسازی کامل فایل‌های نقشه با موفقیت انجام شد.",
      timestamp: Date.now(),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "خطا در بازسازی نقشه";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
