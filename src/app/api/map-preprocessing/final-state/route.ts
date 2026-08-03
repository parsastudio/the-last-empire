import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";
import { FinalMapPipeline } from "@/infrastructure/map-preprocessing/final/final-map-pipeline";

export async function GET(): Promise<NextResponse> {
  try {
    const finalDir = MapPathResolver.getMapFinalServerDir("map1");
    await fs.mkdir(finalDir, { recursive: true });

    const liveStatePath = path.join(finalDir, "live-state.bin");

    let fileExists = false;
    try {
      await fs.access(liveStatePath);
      fileExists = true;
    } catch {}

    if (!fileExists) {
      const pipeline = new FinalMapPipeline();
      await pipeline.buildFinalAssets("map1", 4096, 2048);
    }

    const buffer = await fs.readFile(liveStatePath);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load live state";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
