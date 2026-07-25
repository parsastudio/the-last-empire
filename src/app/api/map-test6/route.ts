import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { generateTest6Map } from "@/map-systems/test6/engine/map-generator";

export async function GET(): Promise<NextResponse> {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const mappingsPath = path.join(publicDir, "test6", "mappings.json");

    try {
      const cached = await fs.readFile(mappingsPath, "utf-8");
      const parsed = JSON.parse(cached);
      const countries = parsed.countries || [];
      const hasArea = countries.some(
        (c: { id: number; areaSqKm?: number }) =>
          c.id >= 11 && c.areaSqKm !== undefined,
      );
      if (!hasArea) {
        throw new Error("Outdated cache structure");
      }
      return NextResponse.json({
        success: true,
        data: parsed,
        cached: true,
      });
    } catch {
      const result = await generateTest6Map(4096, 2048);
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
