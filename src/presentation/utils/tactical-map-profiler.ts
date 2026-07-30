export class TacticalMapProfiler {
  private static mainStart = 0;
  private static subDurations: Record<string, number> = {};

  public static start(): void {
    if (typeof window !== "undefined") {
      this.mainStart = performance.now();
      this.subDurations = {};
    }
  }

  public static profilePhase<T>(name: string, fn: () => T): T {
    if (typeof window === "undefined") return fn();
    const t0 = performance.now();
    const result = fn();
    const dt = performance.now() - t0;
    this.subDurations[name] = Number(dt.toFixed(2));
    return result;
  }

  public static recordPhase(name: string, durationMs: number): void {
    if (typeof window !== "undefined") {
      this.subDurations[name] = Number(durationMs.toFixed(2));
    }
  }

  public static end(phaseName: string, details?: string): number {
    if (typeof window === "undefined" || this.mainStart === 0) return 0;
    const total = performance.now() - this.mainStart;

    const entries = Object.entries(this.subDurations);
    let subBreakdown = "";
    if (entries.length > 0) {
      subBreakdown = entries.map(([k, d]) => `${k}: ${d}ms`).join(" | ");
    }

    console.log(
      `%c[TacticalMap Profiler] ${phaseName}: ${total.toFixed(2)}ms ${details ? `(${details})` : ""} \n   └─ [Sub-Breakdown] ${subBreakdown}`,
      "color: #10b981; font-weight: bold; font-family: monospace;",
    );

    this.mainStart = 0;
    this.subDurations = {};
    return total;
  }
}
