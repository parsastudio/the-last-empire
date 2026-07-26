export class MapShadingPerformanceMonitor {
  private frameTimes: number[] = [];

  public recordFrame(ms: number): void {
    this.frameTimes.push(ms);
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }
  }

  public getAverageFrameTime(): number {
    if (this.frameTimes.length === 0) return 0;
    const sum = this.frameTimes.reduce((acc, t) => acc + t, 0);
    return Number((sum / this.frameTimes.length).toFixed(2));
  }

  public getFpsEstimate(): number {
    const avg = this.getAverageFrameTime();
    if (avg === 0) return 60;
    return Math.min(60, Math.round(1000 / avg));
  }
}
