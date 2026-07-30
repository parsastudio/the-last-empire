export class TacticalMapProfiler {
  private static mainStart = 0;
  private static lastSubTime = 0;
  private static subDurations: Record<string, number> = {};

  public static start(): void {
    if (typeof window !== "undefined") {
      this.mainStart = performance.now();
      this.lastSubTime = this.mainStart;
      this.subDurations = {};
    }
  }

  public static markSub(subName: string): void {
    if (typeof window !== "undefined" && this.mainStart > 0) {
      const now = performance.now();
      const delta = now - this.lastSubTime;
      this.subDurations[subName] = Number(delta.toFixed(2));
      this.lastSubTime = now;
    }
  }

  public static end(phaseName: string, details?: string): number {
    if (typeof window === "undefined" || this.mainStart === 0) return 0;
    const now = performance.now();

    if (this.lastSubTime > this.mainStart) {
      const finalDelta = now - this.lastSubTime;
      this.subDurations["6.ImageDataUpload"] = Number(finalDelta.toFixed(2));
    }

    const total = now - this.mainStart;
    const formattedTotal = total.toFixed(2);

    const entries = Object.entries(this.subDurations);
    let subBreakdown = "";
    if (entries.length > 0) {
      subBreakdown = entries.map(([k, d]) => `${k}: ${d}ms`).join(" | ");
    }

    console.log(
      `%c[TacticalMap Profiler] ${phaseName}: ${formattedTotal}ms ${details ? `(${details})` : ""} \n   └─ [Sub-Breakdown] ${subBreakdown}`,
      "color: #10b981; font-weight: bold; font-family: monospace;",
    );

    this.mainStart = 0;
    this.subDurations = {};
    return total;
  }
}
