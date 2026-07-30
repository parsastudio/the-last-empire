export class TacticalMapProfiler {
  private static startTime = 0;
  private static subTimers: Record<string, number> = {};

  public static start(): void {
    if (typeof window !== "undefined") {
      this.startTime = performance.now();
      this.subTimers = {};
    }
  }

  public static markSub(subName: string): void {
    if (typeof window !== "undefined") {
      this.subTimers[subName] = performance.now();
    }
  }

  public static endSub(subName: string): number {
    if (typeof window === "undefined" || !this.subTimers[subName]) return 0;
    const duration = performance.now() - this.subTimers[subName]!;
    return Number(duration.toFixed(2));
  }

  public static end(phaseName: string, details?: string): number {
    if (typeof window === "undefined" || this.startTime === 0) return 0;

    const totalDuration = performance.now() - this.startTime;
    const formattedTotal = totalDuration.toFixed(2);

    let subBreakdown = "";
    const entries = Object.entries(this.subTimers);
    if (entries.length > 0) {
      subBreakdown = entries
        .map(([k, t]) => `${k}: ${(performance.now() - t).toFixed(2)}ms`)
        .join(" | ");
    }

    console.log(
      `%c[TacticalMap Profiler] ${phaseName}: ${formattedTotal}ms ${details ? `(${details})` : ""} ${subBreakdown ? `\n   └─ [Sub-Breakdown] ${subBreakdown}` : ""}`,
      "color: #10b981; font-weight: bold; font-family: monospace;",
    );

    this.startTime = 0;
    this.subTimers = {};
    return totalDuration;
  }
}
