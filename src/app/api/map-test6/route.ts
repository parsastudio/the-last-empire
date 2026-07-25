import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { generateTest6Map } from "@/map-systems/test6/engine/map-generator";

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const mappingsPath = path.join(publicDir, "test6", "mappings.json");

    try {
      const cached = await fs.readFile(mappingsPath, "utf-8");
      return NextResponse.json({
        success: true,
        data: JSON.parse(cached),
        cached: true,
      });
    } catch {
      const result = await generateTest6Map(1200, 600);
      await fs.writeFile(
        mappingsPath,
        JSON.stringify(result, null, 2),
        "utf-8",
      );
      return NextResponse.json({
        success: true,
        data: result,
        cached: false,
      });
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Map generation failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
