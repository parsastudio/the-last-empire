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

    const tempDir = MapPathResolver.getMapServerDir("map1", mode);
    await fs.mkdir(tempDir, { recursive: true });

    const mappingsFileName = `${mode}-mappings.json`;
    const mappingsPath = path.join(tempDir, mappingsFileName);

    let mappingsExists = false;
    try {
      await fs.access(mappingsPath);
      mappingsExists = true;
    } catch {}

    if (!mappingsExists) {
      const generated = await generateTest6Map(4096, 2048, mode);
      await fs.writeFile(
        mappingsPath,
        JSON.stringify(generated, null, 2),
        "utf-8",
      );
    }

    let mappingsData: {
      countries: { id: number; areaSqKm: number; code: string }[];
    } = { countries: [] };

    const jsonStr = await fs.readFile(mappingsPath, "utf-8");
    mappingsData = JSON.parse(jsonStr);

    const manifestFileName = `${mode}-manifest.json`;
    const builder = new MapManifestBuilder();
    const manifest = await builder.buildAndSaveManifest(
      "map1",
      mappingsData.countries || [],
      manifestFileName,
      mode,
    );

    return NextResponse.json(manifest);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load manifest";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
