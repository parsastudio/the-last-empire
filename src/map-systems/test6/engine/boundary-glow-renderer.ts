import { GridCell } from "@/domain/map/grid-cell.schema";

export class BoundaryGlowRenderer {
  public drawActiveTheaterGlow(
    ctx: CanvasRenderingContext2D,
    theaterCells: GridCell[],
    scaleFactor = 4,
  ): void {
    ctx.strokeStyle = "rgba(16, 185, 129, 0.4)";
    ctx.lineWidth = 6;
    ctx.shadowColor = "rgb(16, 185, 129)";
    ctx.shadowBlur = 8;

    ctx.beginPath();

    for (const cell of theaterCells) {
      const x = cell.x * scaleFactor * scaleFactor;
      const y = cell.y * scaleFactor * scaleFactor;
      ctx.strokeRect(
        x,
        y,
        scaleFactor * scaleFactor,
        scaleFactor * scaleFactor,
      );
    }

    ctx.shadowBlur = 0;
  }
}
