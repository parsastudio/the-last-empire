import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { MapManifestBuilder } from "@/application/map-rendering/generator/map-manifest-builder";
import { generateTest6Map } from "@/application/map-rendering/map-generator";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode") || "partition";

    const publicDir = path.join(process.cwd(), "public");
    const map1Dir = path.join(publicDir, "maps", "map1");
    await fs.mkdir(map1Dir, { recursive: true });

    const manifestFileName = `${mode}-manifest.json`;
    const manifestPath = path.join(map1Dir, manifestFileName);

    try {
      const existing = await fs.readFile(manifestPath, "utf-8");
      const parsed = JSON.parse(existing);
      return NextResponse.json(parsed);
    } catch {}

    const mappingsFileName = `${mode}-mappings.json`;
    const mappingsPath = path.join(map1Dir, mappingsFileName);

    let mappingsData: {
      countries: { id: number; areaSqKm: number; code: string }[];
    };

    try {
      const jsonStr = await fs.readFile(mappingsPath, "utf-8");
      mappingsData = JSON.parse(jsonStr);
    } catch {
      try {
        const defaultPath = path.join(map1Dir, "default-mappings.json");
        const jsonStr = await fs.readFile(defaultPath, "utf-8");
        mappingsData = JSON.parse(jsonStr);
      } catch {
        const generated = await generateTest6Map(4096, 2048);
        mappingsData = generated;
        await fs.writeFile(
          path.join(map1Dir, "default-mappings.json"),
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
    );

    return NextResponse.json(manifest);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to load manifest";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
