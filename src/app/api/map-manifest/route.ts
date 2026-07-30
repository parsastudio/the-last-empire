import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { MapManifestBuilder } from "@/application/map-rendering/generator/map-manifest-builder";
import { generateTest6Map } from "@/application/map-rendering/map-generator";
import { MapPathResolver } from "@/application/map-rendering/map-path-resolver";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "partition";

    const targetDir = MapPathResolver.getMapServerDir("map1", mode);
    await fs.mkdir(targetDir, { recursive: true });

    const manifestFileName = `${mode}-manifest.json`;
    const manifestPath = path.join(targetDir, manifestFileName);

    try {
      const existing = await fs.readFile(manifestPath, "utf-8");
      const parsed = JSON.parse(existing);
      return NextResponse.json(parsed);
    } catch {}

    const mappingsFileName = `${mode}-mappings.json`;
    const mappingsPath = path.join(targetDir, mappingsFileName);

    let mappingsData: {
      countries: { id: number; areaSqKm: number; code: string }[];
    };

    try {
      const jsonStr = await fs.readFile(mappingsPath, "utf-8");
      mappingsData = JSON.parse(jsonStr);
    } catch {
      try {
        const essentialDir = MapPathResolver.getMapServerDir("map1", "default");
        const defaultPath = path.join(essentialDir, "default-mappings.json");
        const jsonStr = await fs.readFile(defaultPath, "utf-8");
        mappingsData = JSON.parse(jsonStr);
      } catch {
        const generated = await generateTest6Map(4096, 2048);
        mappingsData = generated;
        const essentialDir = MapPathResolver.getMapServerDir("map1", "default");
        await fs.writeFile(
          path.join(essentialDir, "default-mappings.json"),
          JSON.stringify(generated, null, 2),
          "utf-8",
        );
      }
    }

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
