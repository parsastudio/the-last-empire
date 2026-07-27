export interface HighwayStreak {
  y: number;
  startX: number;
  endX: number;
  length: number;
}

export class HighwayStreakDetector {
  public detectL1Streaks(
    buffer: Uint8Array,
    l1Dist: Int32Array,
    width: number,
    height: number,
  ): { totalHighwayPixels: number; streaks: HighwayStreak[] } {
    let l1HighwayCount = 0;
    const l1Streaks: HighwayStreak[] = [];
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
    return { totalHighwayPixels: l1HighwayCount, streaks: l1Streaks };
  }

  public detectChamferStreaks(
    buffer: Uint8Array,
    chamferDist: Int32Array,
    width: number,
    height: number,
  ): { totalHighwayPixels: number; streaks: HighwayStreak[] } {
    let chamferHighwayCount = 0;
    const chamferStreaks: HighwayStreak[] = [];
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
    return { totalHighwayPixels: chamferHighwayCount, streaks: chamferStreaks };
  }
}
