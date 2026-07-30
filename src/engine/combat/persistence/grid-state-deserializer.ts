import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridStateDeserializer {
  public deserialize(serialized: string): GridCell[] {
    const cells: GridCell[] = [];
    if (!serialized) return cells;

    const parts = serialized.split("|");
    let currentX = 0;
    let currentY = 0;
    const width = 1024;

    for (const part of parts) {
      const [ownerId, enclaveStr, pixelsStr, countStr] = part.split(":");
      if (!ownerId || !countStr) continue;

      const enclaveId = parseInt(enclaveStr || "0", 10);
      const highResPixelCount = parseInt(pixelsStr || "0", 10);
      const count = parseInt(countStr, 10);

      for (let i = 0; i < count; i++) {
        cells.push({
          x: currentX,
          y: currentY,
          ownerId,
          highResPixelCount,
          enclaveId,
          seaAccess: 0,
        });

        currentX++;
        if (currentX >= width) {
          currentX = 0;
          currentY++;
        }
      }
    }

    return cells;
  }
}
