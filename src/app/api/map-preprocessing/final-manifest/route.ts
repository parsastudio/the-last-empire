import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";

export async function GET(): Promise<NextResponse> {
  try {
    const finalDir = MapPathResolver.getMapFinalServerDir("map1");
    const manifestPath = path.join(finalDir, "manifest.json");

    const raw = await fs.readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(raw) as unknown;
    return NextResponse.json(manifest);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to load manifest";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
