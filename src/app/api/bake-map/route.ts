import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  subdivideWorld,
  InputFeature,
} from "@/engine/world-divider/world-divider";
import { consolidateWorldMap } from "@/engine/world-divider/world-consolidator";
import { FALLBACK_WORLD_MAP } from "@/application/fallback-map.config";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "full";

  try {
    let features: InputFeature[] = [];
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson",
      );
      if (response.ok) {
        const geoJson = await response.json();
        features = geoJson.features as InputFeature[];
      } else {
        features = FALLBACK_WORLD_MAP.features as InputFeature[];
      }
    } catch {
      features = FALLBACK_WORLD_MAP.features as InputFeature[];
    }

    let processedFeatures = features;
    if (type === "simplified") {
      processedFeatures = consolidateWorldMap(features);
    }

    const subdivided = subdivideWorld(processedFeatures, 3000);

    const publicDir = path.join(process.cwd(), "public");
    await fs.mkdir(publicDir, { recursive: true });

    const fileName =
      type === "simplified"
        ? "world-map-simplified.json"
        : "world-map-subdivided.json";
    const filePath = path.join(publicDir, fileName);

    await fs.writeFile(filePath, JSON.stringify(subdivided, null, 2), "utf-8");

    return NextResponse.json({ success: true, count: subdivided.length });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Baking failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
