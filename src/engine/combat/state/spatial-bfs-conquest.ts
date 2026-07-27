import { Coordinate } from "@/domain/map/coordinate.schema";

export class SpatialBfsConquest {
  public execute(
    start: Coordinate,
    targetNationId: number,
    pixelLimit: number,
    width: number,
    height: number,
    stride: number,
    buffer: Uint8Array,
    getOffset: (x: number, y: number) => number,
  ): Coordinate[] {
    const conquered: Coordinate[] = [];
    const visited = new Uint8Array(width * height);
    const queue: Coordinate[] = [start];

    visited[start.y * width + start.x] = 1;

    while (queue.length > 0 && conquered.length < pixelLimit) {
      const current = queue.shift();
      if (!current) continue;

      const offset = getOffset(current.x, current.y);
      const currentNation = buffer[offset + 1] ?? 0;

      if (currentNation === targetNationId) {
        conquered.push(current);
      }

      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
      ];

      for (const n of neighbors) {
        if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
          const vIdx = n.y * width + n.x;
          if (visited[vIdx] === 0) {
            visited[vIdx] = 1;
            const nOffset = getOffset(n.x, n.y);
            if (buffer[nOffset + 1] === targetNationId) {
              queue.push(n);
            }
          }
        }
      }
    }

    return conquered;
  }
}
