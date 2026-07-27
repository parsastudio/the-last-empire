import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { DistanceTransformAlgorithms } from "@/application/map-rendering/utils/distance-transform-algorithms";
import { HighwayStreakDetector } from "@/application/map-rendering/utils/highway-streak-detector";

export async function GET(): Promise<NextResponse> {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const binPath = path.join(publicDir, "test6", "world-mask.bin");
    const fileBytes = await fs.readFile(binPath);
    const buffer = new Uint8Array(fileBytes);
    const width = 4096;
    const height = 2048;

    const algorithms = new DistanceTransformAlgorithms();
    const l1Dist = algorithms.calculateL1(buffer, width, height);

    const streakDetector = new HighwayStreakDetector();
    const l1Result = streakDetector.detectL1Streaks(
      buffer,
      l1Dist,
      width,
      height,
    );

    const chamferDist = algorithms.calculateChamfer(buffer, width, height);
    const chamferResult = streakDetector.detectChamferStreaks(
      buffer,
      chamferDist,
      width,
      height,
    );

    const report = {
      resolution: `${width}x${height}`,
      totalPixels: buffer.length,
      l1: {
        totalHighwayPixels: l1Result.totalHighwayPixels,
        streakCountGreaterThan50px: l1Result.streaks.length,
        longestStreaksSample: l1Result.streaks.slice(0, 15),
      },
      chamfer: {
        totalHighwayPixels: chamferResult.totalHighwayPixels,
        streakCountGreaterThan50px: chamferResult.streaks.length,
        longestStreaksSample: chamferResult.streaks.slice(0, 15),
      },
    };
    await fs.writeFile(
      path.join(publicDir, "debug_ocean_report.json"),
      JSON.stringify(report, null, 2),
      "utf-8",
    );
    return NextResponse.json({
      success: true,
      message: "Ocean routing diagnostic test successfully executed",
      report,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Diagnostic failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
