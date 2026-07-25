import { GridCell } from "@/domain/map/grid-cell.schema";

export class MinimapRenderer {
  public drawMinimapBorder(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, 0, width, height);
  }

  public renderMinimapViewBounds(
    ctx: CanvasRenderingContext2D,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
    lowResWidth = 256,
    lowResHeight = 128,
  ): void {
    const rx = (sx / 4096) * lowResWidth;
    const ry = (sy / 2048) * lowResHeight;
    const rw = (sw / 4096) * lowResWidth;
    const rh = (sh / 2048) * lowResHeight;

    ctx.strokeStyle = "rgb(16, 185, 129)";
    ctx.lineWidth = 1;
    ctx.strokeRect(rx, ry, rw, rh);
  }
}
