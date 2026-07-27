export class GeometryDraw {
  public drawWaterLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    buffer: Uint8Array,
    width: number,
    height: number,
    color: number,
  ): void {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    let cx = x1;
    let cy = y1;
    while (true) {
      if (cx >= 0 && cx < width && cy >= 0 && cy < height) {
        buffer[cy * width + cx] = color;
      }
      if (cx === x2 && cy === y2) break;
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        cx += sx;
      }
      if (e2 < dx) {
        err += dx;
        cy += sy;
      }
    }
  }
}
