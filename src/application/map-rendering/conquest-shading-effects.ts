import { GridCell } from "@/domain/map/grid-cell.schema";

export class ConquestShadingEffects {
  public applySiegeEffects(
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

        if (cell && cell.isOccupied) {
          const idx = (y * width + x) * 4;
          destData[idx] = Math.min(255, (destData[idx] || 0) + 20);
          destData[idx + 1] = Math.max(0, (destData[idx + 1] || 0) - 15);
          destData[idx + 2] = Math.max(0, (destData[idx + 2] || 0) - 15);
        }
      }
    }
  }
}
