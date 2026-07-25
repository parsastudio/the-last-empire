import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { extractIsolatedPolygons } from "@/map-systems/test4/engine/island-area-calculator";
import type {
  InputFeature,
  GeoJsonData,
} from "@/map-systems/test2/engine/types";

export async function GET() {
  try {
    const filePath = path.join(
      process.cwd(),
      "public",
      "ne_110m_admin_0_countries.geojson",
    );

    let fileContent: string;
    try {
      fileContent = await fs.readFile(filePath, "utf-8");
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Local file ne_110m_admin_0_countries.geojson not found in public folder. Please download it and put it there.",
        },
        { status: 404 },
      );
    }

    const geoJson = JSON.parse(fileContent) as GeoJsonData;
    const features = geoJson.features;

    const phase1Countries = features
      .filter((f) => {
        const rawCode =
          f.properties?.adm0_a3 ||
          f.properties?.ISO_A3 ||
          f.properties?.iso_a3 ||
          f.id ||
          "";
        const code = rawCode.toString().toUpperCase();
        return code && code !== "-99" && code !== "ATA";
      })
      .map((f) => {
        const rawCode =
          f.properties?.adm0_a3 ||
          f.properties?.ISO_A3 ||
          f.properties?.iso_a3 ||
          f.id ||
          "";
        const code = rawCode.toString().toUpperCase();
        const name = f.properties?.name || f.properties?.NAME || code;

        const rings: [number, number][][] = [];
        const geom = f.geometry;
        if (geom.type === "Polygon") {
          const coords = geom.coordinates as number[][][];
          coords.forEach((ring) => {
            rings.push(ring.map((pt) => [pt[0], pt[1]]));
          });
        } else if (geom.type === "MultiPolygon") {
          const multi = geom.coordinates as number[][][][];
          multi.forEach((poly) => {
            poly.forEach((ring) => {
              rings.push(ring.map((pt) => [pt[0], pt[1]]));
            });
          });
        }

        return {
          code,
          name,
          rings,
        };
      });

    const phase2Islands = extractIsolatedPolygons(features);

    return NextResponse.json({
      success: true,
      phase1: phase1Countries,
      phase2: phase2Islands,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Processing failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
