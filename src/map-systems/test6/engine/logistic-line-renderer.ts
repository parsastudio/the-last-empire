import { Coordinate } from "@/domain/map/coordinate.schema";

export class LogisticLineRenderer {
  public drawTacticalArrow(
    ctx: CanvasRenderingContext2D,
    origin: Coordinate,
    target: Coordinate,
    scaleFactor = 4,
  ): void {
    const ox = origin.x * scaleFactor;
    const oy = origin.y * scaleFactor;
    const tx = target.x * scaleFactor;
    const ty = target.y * scaleFactor;

    ctx.strokeStyle = "rgba(16, 185, 129, 0.85)";
    ctx.lineWidth = 3;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(ox, oy);

    const cx = (ox + tx) / 2;
    const cy = (oy + ty) / 2 - 40;

    ctx.quadraticCurveTo(cx, cy, tx, ty);
    ctx.stroke();
    ctx.setLineDash([]);

    const angle = Math.atan2(ty - cy, tx - cx);
    ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(
      tx - 10 * Math.cos(angle - Math.PI / 6),
      ty - 10 * Math.sin(angle - Math.PI / 6),
    );
    ctx.lineTo(
      tx - 10 * Math.cos(angle + Math.PI / 6),
      ty - 10 * Math.sin(angle + Math.PI / 6),
    );
    ctx.fill();
  }
}
