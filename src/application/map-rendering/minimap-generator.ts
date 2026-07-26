import { GridCell } from "@/domain/map/grid-cell.schema";

export class MinimapGenerator {
  public drawMinimap(
    ctx: CanvasRenderingContext2D,
    cells: GridCell[],
    lowResWidth = 256,
    lowResHeight = 128,
  ): void {
    const cellMap = new Map<string, GridCell>();
    cells.forEach((c) => cellMap.set(`${c.x},${c.y}`, c));

    const pixelData = ctx.createImageData(lowResWidth, lowResHeight);

    for (let y = 0; y < lowResHeight; y++) {
      for (let x = 0; x < lowResWidth; x++) {
        const cell = cellMap.get(`${x},${y}`);
        const idx = (y * lowResWidth + x) * 4;

        if (cell) {
          if (cell.ownerId === "WATER") {
            pixelData.data[idx] = 15;
            pixelData.data[idx + 1] = 23;
            pixelData.data[idx + 2] = 42;
            pixelData.data[idx + 3] = 255;
          } else if (cell.isOccupied) {
            pixelData.data[idx] = 239;
            pixelData.data[idx + 1] = 68;
            pixelData.data[idx + 2] = 68;
            pixelData.data[idx + 3] = 255;
          } else {
            pixelData.data[idx] = 16;
            pixelData.data[idx + 1] = 185;
            pixelData.data[idx + 2] = 129;
            pixelData.data[idx + 3] = 255;
          }
        }
      }
    }

    ctx.putImageData(pixelData, 0, 0);
  }
}
