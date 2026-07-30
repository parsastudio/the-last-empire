import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { MapManifestBuilder } from "@/infrastructure/map-preprocessing/generator/map-manifest-builder";
import { generateTest6Map } from "@/infrastructure/map-preprocessing/map-generator";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "partition";

    const targetDir = MapPathResolver.getMapServerDir("map1", mode);
    await fs.mkdir(targetDir, { recursive: true });

    const manifestPath = path.join(targetDir, "manifest.json");

    let manifestExists = false;
    try {
      await fs.access(manifestPath);
      manifestExists = true;
    } catch {}

    if (!manifestExists) {
      const generated = await generateTest6Map(4096, 2048, mode);
      const builder = new MapManifestBuilder();
      const manifest = await builder.buildAndSaveManifest(
        "map1",
        generated.countries.map((c) => ({
          id: c.id,
          code: c.code,
          name: c.name,
          color: c.color,
          areaSqKm: c.areaSqKm,
        })),
        "manifest.json",
        mode,
      );
      return NextResponse.json(manifest);
    }

    const raw = await fs.readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(raw);
    return NextResponse.json(manifest);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load manifest";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
