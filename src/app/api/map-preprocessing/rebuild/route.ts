import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { generateTest6Map } from "@/infrastructure/map-preprocessing/map-generator";
import { MapManifestBuilder } from "@/infrastructure/map-preprocessing/generator/map-manifest-builder";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";
import { MapDataProvider } from "@/engine/combat/state/map-data-provider";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      mode?: "partition" | "edited" | "default" | "all";
    };
    const targetMode = body.mode || "partition";

    const modesToBuild =
      targetMode === "all" ? ["partition", "edited", "default"] : [targetMode];

    const provider = new MapDataProvider();
    provider.clearCache();

    for (const mode of modesToBuild) {
      const tempDir = MapPathResolver.getMapServerDir("map1", mode);
      await fs.mkdir(tempDir, { recursive: true });

      const generated = await generateTest6Map(4096, 2048, mode);
      const mappingsFileName = `${mode}-mappings.json`;
      const mappingsPath = path.join(tempDir, mappingsFileName);

      await fs.writeFile(
        mappingsPath,
        JSON.stringify(generated, null, 2),
        "utf-8",
      );

      const manifestFileName = `${mode}-manifest.json`;
      const builder = new MapManifestBuilder();
      await builder.buildAndSaveManifest(
        "map1",
        generated.countries || [],
        manifestFileName,
        mode,
      );
    }

    provider.clearCache();

    return NextResponse.json({
      success: true,
      message: "بازسازی کامل فایل‌های نقشه با موفقیت انجام شد.",
      rebuiltModes: modesToBuild,
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
