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
    const essentialDir = MapPathResolver.getMapServerDir("map1", "default");
    await fs.mkdir(targetDir, { recursive: true });
    await fs.mkdir(essentialDir, { recursive: true });

    const defaultMappingsPath = path.join(
      essentialDir,
      "default-mappings.json",
    );
    let defaultExists = false;
    try {
      await fs.access(defaultMappingsPath);
      defaultExists = true;
    } catch {}

    if (!defaultExists) {
      const generated = await generateTest6Map(4096, 2048);
      await fs.writeFile(
        defaultMappingsPath,
        JSON.stringify(generated, null, 2),
        "utf-8",
      );
    }

    if (mode !== "default") {
      const copyPairs = [
        ["default-mappings.json", `${mode}-mappings.json`],
        ["default-mask.png", `${mode}-mask.png`],
        ["default-mask.bin", `${mode}-mask.bin`],
        ["default-mask-1024.bin", `${mode}-mask-1024.bin`],
      ];

      for (const [srcName, destName] of copyPairs) {
        const srcPath = path.join(essentialDir, srcName);
        const destPath = path.join(targetDir, destName);
        try {
          await fs.access(destPath);
        } catch {
          try {
            await fs.copyFile(srcPath, destPath);
          } catch {}
        }
      }
    }

    const mappingsFileName = `${mode}-mappings.json`;
    const mappingsPath = path.join(targetDir, mappingsFileName);

    let mappingsData: {
      countries: { id: number; areaSqKm: number; code: string }[];
    } = { countries: [] };

    try {
      const jsonStr = await fs.readFile(mappingsPath, "utf-8");
      mappingsData = JSON.parse(jsonStr);
    } catch {
      const jsonStr = await fs.readFile(defaultMappingsPath, "utf-8");
      mappingsData = JSON.parse(jsonStr);
    }

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
