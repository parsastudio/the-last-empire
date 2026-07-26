import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { generateTest6Map } from "@/application/map-rendering/map-generator";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const forceRebuild = searchParams.get("rebuild") === "true";
    const useEdited = searchParams.get("type") === "edited";

    const publicDir = path.join(process.cwd(), "public");
    const dirName = useEdited ? "edited-mask" : "test6";
    const mappingsPath = path.join(publicDir, dirName, "mappings.json");

    if (forceRebuild) {
      const result = await generateTest6Map(4096, 2048);
      await fs.writeFile(
        path.join(publicDir, "test6", "mappings.json"),
        JSON.stringify(result, null, 2),
        "utf-8",
      );
      return NextResponse.json({
        success: true,
        data: result,
        cached: false,
      });
    }

    try {
      const cached = await fs.readFile(mappingsPath, "utf-8");
      const parsed = JSON.parse(cached);
      return NextResponse.json({
        success: true,
        data: parsed,
        cached: true,
      });
    } catch {
      if (useEdited) {
        return NextResponse.json(
          {
            success: false,
            error: "No edited map configuration found",
          },
          { status: 404 },
        );
      }
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
