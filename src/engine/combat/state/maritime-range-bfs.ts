import { GridState } from "@/engine/combat/state/grid-state";

export class MaritimeRangeBfs {
  public run(
    width: number,
    height: number,
    maxRange: number,
    gridState: GridState,
    visitedDist: Uint8Array,
    visitedSource: string[],
    queueX: Int16Array,
    queueY: Int16Array,
    queueDist: Uint8Array,
    queueSource: string[],
    tail: number,
    seaNeighborsMap: Map<string, Set<string>>,
  ): void {
    let head = 0;

    while (head < tail) {
      const cx = queueX[head]!;
      const cy = queueY[head]!;
      const cd = queueDist[head]!;
      const cs = queueSource[head]!;
      head++;

      if (cd >= maxRange) {
        continue;
      }

      const neighbors = [
        { nx: cx + 1, ny: cy },
        { nx: cx - 1, ny: cy },
        { nx: cx, ny: cy + 1 },
        { nx: nx, ny: cy - 1 },
      ];

      for (const n of neighbors) {
        let nx = n.nx;
        if (nx < 0) {
          nx = width - 1;
        } else if (nx >= width) {
          nx = 0;
        }

        const ny = n.ny;
        if (ny >= 0 && ny < height) {
          const nCell = gridState.getCell(nx, ny);
          if (
            nCell &&
            (nCell.ownerId === "WATER" || nCell.ownerId === "CLOSED_SEA")
          ) {
            const idx = ny * width + nx;
            const existingDist = visitedDist[idx]!;

            if (existingDist === 255) {
              visitedDist[idx] = cd + 1;
              visitedSource[idx] = cs;
              queueX[tail] = nx;
              queueY[tail] = ny;
              queueDist[tail] = cd + 1;
              queueSource[tail] = cs;
              tail++;
            } else {
              const existingSource = visitedSource[idx]!;
              if (existingSource !== cs) {
                seaNeighborsMap.get(cs)?.add(existingSource);
                seaNeighborsMap.get(existingSource)?.add(cs);
              }
            }
          }
        }
      }
    }
  }
}
