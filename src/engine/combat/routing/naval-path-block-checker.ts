import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class NavalPathBlockChecker {
  public isNavalPathBlocked(
    origin: Coordinate,
    target: Coordinate,
    allCells: GridCell[],
  ): boolean {
    const width = 1024;
    const height = 512;
    const arraySize = width * height;

    const traversable = new Uint8Array(arraySize);
    for (let i = 0; i < allCells.length; i++) {
      const cell = allCells[i];
      if (cell) {
        if (
          cell.ownerId === "WATER" ||
          cell.ownerId === "CLOSED_SEA" ||
          cell.isOccupied
        ) {
          traversable[(cell.y << 10) | cell.x] = 1;
        }
      }
    }

    const visited = new Uint8Array(arraySize);
    const originIdx = (origin.y << 10) | origin.x;
    const targetIdx = (target.y << 10) | target.x;

    traversable[originIdx] = 1;
    traversable[targetIdx] = 1;

    const queue = new Int32Array(arraySize);
    let head = 0;
    let tail = 0;

    queue[tail++] = originIdx;
    visited[originIdx] = 1;

    let pathFound = false;

    const neighbors = [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 0 },
    ];

    while (head < tail) {
      const currentIdx = queue[head++];
      if (currentIdx === targetIdx) {
        pathFound = true;
        break;
      }

      const cx = currentIdx & 1023;
      const cy = currentIdx >> 10;

      neighbors[0]!.x = cx + 1;
      neighbors[0]!.y = cy;
      neighbors[1]!.x = cx - 1;
      neighbors[1]!.y = cy;
      neighbors[2]!.x = cx;
      neighbors[2]!.y = cy + 1;
      neighbors[3]!.x = cx;
      neighbors[3]!.y = cy - 1;
      neighbors[4]!.x = cx + 1;
      neighbors[4]!.y = cy + 1;
      neighbors[5]!.x = cx - 1;
      neighbors[5]!.y = cy - 1;
      neighbors[6]!.x = cx + 1;
      neighbors[6]!.y = cy - 1;
      neighbors[7]!.x = cx - 1;
      neighbors[7]!.y = cy + 1;

      for (let i = 0; i < 8; i++) {
        const n = neighbors[i]!;
        let nx = n.x;
        if (nx < 0) {
          nx = 1023;
        } else if (nx >= 1024) {
          nx = 0;
        }

        const ny = n.y;
        if (ny >= 0 && ny < 512) {
          const nIdx = (ny << 10) | nx;
          if (traversable[nIdx] === 1 && visited[nIdx] === 0) {
            visited[nIdx] = 1;
            queue[tail++] = nIdx;
          }
        }
      }
    }

    return !pathFound;
  }
}
