import { GridCell } from "@/domain/map/grid-cell.schema";

export class GdpHeatmapShader {
  public applyHeatmapOverlay(
    destData: Uint8ClampedArray,
    width: number,
    height: number,
    cells: GridCell[],
    scaleFactor = 4,
  ): void {
    const cellMap = new Map<string, GridCell>();
    cells.forEach((c) => cellMap.set(`${c.x},${c.y}`, c));

    for (let y = 0; y < height; y++) {
      const gy = Math.floor(y / scaleFactor);
      for (let x = 0; x < width; x++) {
        const gx = Math.floor(x / scaleFactor);
        const cell = cellMap.get(`${gx},${gy}`);

        if (cell && cell.ownerId !== "WATER") {
          const idx = (y * width + x) * 4;
          const density = cell.highResPixelCount;
          const heat = Math.min(255, density * 15);

          destData[idx] = Math.min(255, (destData[idx] || 0) + heat);
          destData[idx + 1] = Math.max(
            0,
            (destData[idx + 1] || 0) - heat * 0.5,
          );
          destData[idx + 2] = Math.max(0, (destData[idx + 2] || 0) - heat);
        }
      }
    }
  }
}
