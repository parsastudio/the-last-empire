import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";
import { FinalMapPipeline } from "@/infrastructure/map-preprocessing/final/final-map-pipeline";

export async function GET(): Promise<NextResponse> {
  try {
    const finalDir = MapPathResolver.getMapFinalServerDir("map1");
    await fs.mkdir(finalDir, { recursive: true });

    const manifestPath = path.join(finalDir, "manifest.json");

    let manifestExists = false;
    try {
      await fs.access(manifestPath);
      manifestExists = true;
    } catch {}

    if (!manifestExists) {
      const pipeline = new FinalMapPipeline();
      await pipeline.buildFinalAssets("map1", 4096, 2048);
    }

    const raw = await fs.readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);
    return NextResponse.json(manifest);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load manifest";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
