import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";

export async function GET(): Promise<NextResponse> {
  try {
    const finalDir = MapPathResolver.getMapFinalServerDir("map1");
    const liveStatePath = path.join(finalDir, "live-state.bin");

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
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
