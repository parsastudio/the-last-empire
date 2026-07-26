export class TacticalGridOverlay {
  public drawGrid(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    zoomScale: number,
    cellSize = 32,
  ): void {
    if (zoomScale < 4.0) {
      return;
    }

    ctx.strokeStyle = "rgba(100, 116, 139, 0.15)";
    ctx.lineWidth = 0.5;

    ctx.beginPath();

    for (let x = 0; x < width; x += cellSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    for (let y = 0; y < height; y += cellSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.stroke();
  }
}
