import { Coordinate } from "@/domain/map/coordinate.schema";

export class SeaBridgeVisualizer {
  public drawVisualSeaBridge(
    ctx: CanvasRenderingContext2D,
    p1: Coordinate,
    p2: Coordinate,
    scaleFactor = 4,
  ): void {
    const x1 =
      p1.x * scaleFactor * scaleFactor + scaleFactor * scaleFactor * 0.5;
    const y1 =
      p1.y * scaleFactor * scaleFactor + scaleFactor * scaleFactor * 0.5;
    const x2 =
      p2.x * scaleFactor * scaleFactor + scaleFactor * scaleFactor * 0.5;
    const y2 =
      p2.y * scaleFactor * scaleFactor + scaleFactor * scaleFactor * 0.5;

    ctx.strokeStyle = "rgba(56, 189, 248, 0.6)";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([2, 4]);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.setLineDash([]);
  }
}
