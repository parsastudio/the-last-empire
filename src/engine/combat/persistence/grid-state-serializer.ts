import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridStateSerializer {
  public serialize(cells: GridCell[]): string {
    const sorted = [...cells].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    const parts: string[] = [];
    let currentOwner = "";
    let currentEnclave = 0;
    let currentPixels = 0;
    let count = 0;

    for (const cell of sorted) {
      if (
        cell.ownerId === currentOwner &&
        cell.enclaveId === currentEnclave &&
        cell.highResPixelCount === currentPixels
      ) {
        count++;
      } else {
        if (count > 0) {
          parts.push(
            `${currentOwner}:${currentEnclave}:${currentPixels}:${count}`,
          );
        }
        currentOwner = cell.ownerId;
        currentEnclave = cell.enclaveId;
        currentPixels = cell.highResPixelCount;
        count = 1;
      }
    }

    if (count > 0) {
      parts.push(`${currentOwner}:${currentEnclave}:${currentPixels}:${count}`);
    }

    return parts.join("|");
  }
}
