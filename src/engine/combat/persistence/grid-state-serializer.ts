import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridStateSerializer {
  public serialize(cells: GridCell[]): string {
    const sorted = [...cells].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });

    const parts: string[] = [];
    let currentOwner = "";
    let currentOccupied = false;
    let currentOccupier = "";
    let currentEnclave = 0;
    let currentPixels = 0;
    let count = 0;

    for (const cell of sorted) {
      const occupier = cell.occupierId || "";
      if (
        cell.ownerId === currentOwner &&
        cell.isOccupied === currentOccupied &&
        occupier === currentOccupier &&
        cell.enclaveId === currentEnclave &&
        cell.highResPixelCount === currentPixels
      ) {
        count++;
      } else {
        if (count > 0) {
          parts.push(
            `${currentOwner}:${currentOccupied ? 1 : 0}:${currentOccupier}:${currentEnclave}:${currentPixels}:${count}`,
          );
        }
        currentOwner = cell.ownerId;
        currentOccupied = cell.isOccupied;
        currentOccupier = occupier;
        currentEnclave = cell.enclaveId;
        currentPixels = cell.highResPixelCount;
        count = 1;
      }
    }

    if (count > 0) {
      parts.push(
        `${currentOwner}:${currentOccupied ? 1 : 0}:${currentOccupier}:${currentEnclave}:${currentPixels}:${count}`,
      );
    }

    return parts.join("|");
  }
}
