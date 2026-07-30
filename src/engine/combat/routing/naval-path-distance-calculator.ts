import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { NavalGridBuilder } from "./naval-grid-builder";

export class NavalPathDistanceCalculator {
  private gridBuilder = new NavalGridBuilder();

  public calculateNavalDistanceInPixels(
    origin: Coordinate,
    target: Coordinate,
    allCells: GridCell[],
  ): number | null {
    const traversable = this.gridBuilder.buildTraversableGrid(allCells);
    const arraySize = 1024 * 512;

    const originIdx = (origin.y << 10) | origin.x;
    const targetIdx = (target.y << 10) | target.x;

    traversable[originIdx] = 1;
    traversable[targetIdx] = 1;

    const dist = new Int32Array(arraySize);
    dist.fill(-1);

    const queue = new Int32Array(arraySize);
    let head = 0;
    let tail = 0;

    queue[tail++] = originIdx;
    dist[originIdx] = 0;

    while (head < tail) {
      const currentIdx = queue[head++]!;
      const currentDist = dist[currentIdx]!;

      if (currentIdx === targetIdx) {
        return currentDist;
      }

      const cx = currentIdx & 1023;
      const cy = currentIdx >> 10;

      const offsets = [
        [cx + 1, cy],
        [cx - 1, cy],
        [cx, cy + 1],
        [cx, cy - 1],
      ];

      for (let i = 0; i < 4; i++) {
        const pair = offsets[i]!;
        let nx = pair[0]!;
        const ny = pair[1]!;

        if (nx < 0) nx = 1023;
        else if (nx >= 1024) nx = 0;

        if (ny >= 0 && ny < 512) {
          const nIdx = (ny << 10) | nx;
          if (traversable[nIdx] === 1 && dist[nIdx] === -1) {
            dist[nIdx] = currentDist + 1;
            queue[tail++] = nIdx;
          }
        }
      }
    }

    return null;
  }
}
