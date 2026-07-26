import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(): Promise<NextResponse> {
  try {
    const publicDir = path.join(process.cwd(), "public");
    const binPath = path.join(publicDir, "test6", "world-mask.bin");
    const fileBytes = await fs.readFile(binPath);
    const buffer = new Uint8Array(fileBytes);
    const width = 4096;
    const height = 2048;
    const l1Dist = new Int32Array(width * height);
    l1Dist.fill(9999);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (buffer[idx]! >= 11 && buffer[idx]! < 250) {
          l1Dist[idx] = 0;
        } else {
          if (x > 0) l1Dist[idx] = Math.min(l1Dist[idx]!, l1Dist[idx - 1]! + 1);
          if (y > 0)
            l1Dist[idx] = Math.min(l1Dist[idx]!, l1Dist[idx - width]! + 1);
        }
      }
    }
    for (let y = height - 1; y >= 0; y--) {
      for (let x = width - 1; x >= 0; x--) {
        const idx = y * width + x;
        if (x < width - 1) {
          l1Dist[idx] = Math.min(l1Dist[idx]!, l1Dist[idx + 1]! + 1);
        }
        if (y < height - 1) {
          l1Dist[idx] = Math.min(l1Dist[idx]!, l1Dist[idx + width]! + 1);
        }
      }
    }
    let l1HighwayCount = 0;
    const l1Streaks: Array<{
      y: number;
      startX: number;
      endX: number;
      length: number;
    }> = [];
    for (let y = 150; y < height - 150; y++) {
      let streakStart = -1;
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const val = buffer[idx]!;
        if (val < 11 || val === 254) {
          const d = l1Dist[idx]!;
          if (d >= 3 && d <= 120) {
            const hMax = d > l1Dist[idx - 1]! && d >= l1Dist[idx + 1]!;
            const vMax = d > l1Dist[idx - width]! && d >= l1Dist[idx + width]!;
            if (hMax || vMax) {
              l1HighwayCount++;
              if (streakStart === -1) {
                streakStart = x;
              }
            } else {
              if (streakStart !== -1) {
                const len = x - streakStart;
                if (len > 50) {
                  l1Streaks.push({
                    y,
                    startX: streakStart,
                    endX: x - 1,
                    length: len,
                  });
                }
                streakStart = -1;
              }
            }
          } else {
            if (streakStart !== -1) {
              const len = x - streakStart;
              if (len > 50) {
                l1Streaks.push({
                  y,
                  startX: streakStart,
                  endX: x - 1,
                  length: len,
                });
              }
              streakStart = -1;
            }
          }
        }
      }
    }
    const chamferDist = new Int32Array(width * height);
    chamferDist.fill(99999);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        if (buffer[idx]! >= 11 && buffer[idx]! < 250) {
          chamferDist[idx] = 0;
        } else {
          let m = chamferDist[idx]!;
          if (x > 0) m = Math.min(m, chamferDist[idx - 1]! + 3);
          if (y > 0) m = Math.min(m, chamferDist[idx - width]! + 3);
          if (x > 0 && y > 0)
            m = Math.min(m, chamferDist[idx - width - 1]! + 4);
          if (x < width - 1 && y > 0)
            m = Math.min(m, chamferDist[idx - width + 1]! + 4);
          chamferDist[idx] = m;
        }
      }
    }
    for (let y = height - 1; y >= 0; y--) {
      for (let x = width - 1; x >= 0; x--) {
        const idx = y * width + x;
        let m = chamferDist[idx]!;
        if (x < width - 1) m = Math.min(m, chamferDist[idx + 1]! + 3);
        if (y < height - 1) m = Math.min(m, chamferDist[idx + width]! + 3);
        if (x < width - 1 && y < height - 1)
          m = Math.min(m, chamferDist[idx + width + 1]! + 4);
        if (x > 0 && y < height - 1)
          m = Math.min(m, chamferDist[idx + width - 1]! + 4);
        chamferDist[idx] = m;
      }
    }
    let chamferHighwayCount = 0;
    const chamferStreaks: Array<{
      y: number;
      startX: number;
      endX: number;
      length: number;
    }> = [];
    for (let y = 150; y < height - 150; y++) {
      let streakStart = -1;
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const val = buffer[idx]!;
        if (val < 11 || val === 254) {
          const d = chamferDist[idx]!;
          if (d >= 9 && d <= 360) {
            const hMax =
              d > chamferDist[idx - 1]! && d >= chamferDist[idx + 1]!;
            const vMax =
              d > chamferDist[idx - width]! && d >= chamferDist[idx + width]!;
            if (hMax || vMax) {
              chamferHighwayCount++;
              if (streakStart === -1) {
                streakStart = x;
              }
            } else {
              if (streakStart !== -1) {
                const len = x - streakStart;
                if (len > 50) {
                  chamferStreaks.push({
                    y,
                    startX: streakStart,
                    endX: x - 1,
                    length: len,
                  });
                }
                streakStart = -1;
              }
            }
          } else {
            if (streakStart !== -1) {
              const len = x - streakStart;
              if (len > 50) {
                chamferStreaks.push({
                  y,
                  startX: streakStart,
                  endX: x - 1,
                  length: len,
                });
              }
              streakStart = -1;
            }
          }
        }
      }
    }
    const report = {
      resolution: `${width}x${height}`,
      totalPixels: buffer.length,
      l1: {
        totalHighwayPixels: l1HighwayCount,
        streakCountGreaterThan50px: l1Streaks.length,
        longestStreaksSample: l1Streaks.slice(0, 15),
      },
      chamfer: {
        totalHighwayPixels: chamferHighwayCount,
        streakCountGreaterThan50px: chamferStreaks.length,
        longestStreaksSample: chamferStreaks.slice(0, 15),
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
