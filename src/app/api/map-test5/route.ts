import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { processConsolidationTest5 } from "@/map-systems/test5/engine/annexation-processor";
import type { GeoJsonCountryFeature } from "@/map-systems/test5/engine/annexation-processor";

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const test5Dir = path.join(publicDir, "test5");
    await fs.mkdir(test5Dir, { recursive: true });

    const cachedFilePath = path.join(test5Dir, "world-map-consolidated.json");

    try {
      const cachedContent = await fs.readFile(cachedFilePath, "utf-8");
      const parsed = JSON.parse(cachedContent);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return NextResponse.json({
          success: true,
          regions: parsed,
          cached: true,
        });
      }
      throw new Error("Cache is empty or invalid");
    } catch {
      const sourceFilePath = path.join(
        publicDir,
        "ne_110m_admin_0_countries.geojson",
      );
      let fileContent: string;
      try {
        fileContent = await fs.readFile(sourceFilePath, "utf-8");
      } catch {
        return NextResponse.json(
          {
            success: false,
            error:
              "Source ne_110m_admin_0_countries.geojson not found in public folder.",
          },
          { status: 404 },
        );
      }

      const geoJson = JSON.parse(fileContent);
      const features = geoJson.features as GeoJsonCountryFeature[];

      const consolidatedRegions = processConsolidationTest5(
        features,
        1200,
        600,
      );

      await fs.writeFile(
        cachedFilePath,
        JSON.stringify(consolidatedRegions, null, 2),
        "utf-8",
      );

      return NextResponse.json({
        success: true,
        regions: consolidatedRegions,
        cached: false,
      });
    }
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Map Test 5 processing failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
