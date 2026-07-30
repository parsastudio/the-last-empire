export class TacticalMapProfiler {
  private static startTime = 0;

  public static start(): void {
    if (typeof window !== "undefined") {
      this.startTime = performance.now();
    }
  }

  public static end(phaseName: string, details?: string): number {
    if (typeof window === "undefined" || this.startTime === 0) return 0;

    const duration = performance.now() - this.startTime;
    const formatted = duration.toFixed(2);

    console.log(
      `%c[TacticalMap Profiler] ${phaseName}: ${formatted}ms ${details ? `(${details})` : ""}`,
      "color: #10b981; font-weight: bold; font-family: monospace;",
    );

    this.startTime = 0;
    return duration;
  }
}
