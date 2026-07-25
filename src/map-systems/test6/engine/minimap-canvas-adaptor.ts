import { MinimapRenderer } from "./minimap-renderer";

export class MinimapCanvasAdaptor {
  private renderer = new MinimapRenderer();

  public renderMinimapView(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    sx: number,
    sy: number,
    sw: number,
    sh: number,
  ): void {
    ctx.clearRect(0, 0, width, height);
    this.renderer.drawMinimapBorder(ctx, width, height);
    this.renderer.renderMinimapViewBounds(ctx, sx, sy, sw, sh, width, height);
  }
}
