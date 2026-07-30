import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class SovereignHopBfs {
  private readonly width = 1024;
  private readonly height = 512;

  public executeHopBfs(
    targetCountryId: string,
    targetEnclaveId: number,
    entryPoint: Coordinate,
    allCells: GridCell[],
    pixelLimit: number,
  ): GridCell[] {
    if (pixelLimit <= 0 || allCells.length === 0) {
      return [];
    }

    const totalPixels = this.width * this.height;
    const gridLookup = new Array<GridCell | undefined>(totalPixels);
    let startCell: GridCell | undefined = undefined;
    let minEntryDist = Infinity;

    for (let i = 0; i < allCells.length; i++) {
      const c = allCells[i]!;
      if (c.ownerId === targetCountryId && c.enclaveId === targetEnclaveId) {
        const idx = c.y * this.width + c.x;
        gridLookup[idx] = c;

        const dist = Math.hypot(c.x - entryPoint.x, c.y - entryPoint.y);
        if (dist < minEntryDist) {
          minEntryDist = dist;
          startCell = c;
        }
      }
    }

    if (!startCell) {
      return [];
    }

    const conquered: GridCell[] = [];
    const queueX = new Int16Array(pixelLimit + 1000);
    const queueY = new Int16Array(pixelLimit + 1000);
    const visited = new Uint8Array(totalPixels);

    let head = 0;
    let tail = 0;

    const startIdx = startCell.y * this.width + startCell.x;
    visited[startIdx] = 1;
    queueX[tail] = startCell.x;
    queueY[tail] = startCell.y;
    tail++;

    while (head < tail && conquered.length < pixelLimit) {
      const cx = queueX[head]!;
      const cy = queueY[head]!;
      head++;

      const currentCell = gridLookup[cy * this.width + cx];
      if (currentCell) {
        conquered.push(currentCell);
      }

      const neighbors = [
        { x: cx + 1, y: cy },
        { x: cx - 1, y: cy },
        { x: cx, y: cy + 1 },
        { x: cx, y: cy - 1 },
      ];

      for (let i = 0; i < 4; i++) {
        let nx = neighbors[i]!.x;
        if (nx < 0) nx = this.width - 1;
        else if (nx >= this.width) nx = 0;

        const ny = neighbors[i]!.y;
        if (ny >= 0 && ny < this.height) {
          const nIdx = ny * this.width + nx;
          if (visited[nIdx] === 0 && gridLookup[nIdx] !== undefined) {
            visited[nIdx] = 1;
            queueX[tail] = nx;
            queueY[tail] = ny;
            tail++;
          }
        }
      }
    }

    return conquered;
  }
}
