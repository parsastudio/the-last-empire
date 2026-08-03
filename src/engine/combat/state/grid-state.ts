import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { GridCell } from "@/domain/map/grid-cell.schema";

export type { GridCell };

export class GridState {
  private packedGrid = BitPackedGridState.getInstance();

  public setCell(x: number, y: number, cell: GridCell): void {
    const nationId = parseInt(cell.ownerId.replace("NATION_", ""), 10);
    if (!isNaN(nationId)) {
      this.packedGrid.setNationId(x, y, nationId);
    }
  }

  public getCell(x: number, y: number): GridCell | undefined {
    const buffer = this.packedGrid.getBuffer();
    const nationId = buffer.getNationId(x, y);

    if (x < 0 || x >= 4096 || y < 0 || y >= 2048) {
      return undefined;
    }

    const ownerId = nationId >= 11 ? `NATION_${nationId}` : "WATER";
    const enclaveId = buffer.getEnclaveId(x, y);
    const seaAccess = buffer.getCoastalAccess(x, y);

    return {
      x,
      y,
      ownerId,
      highResPixelCount: nationId >= 11 ? 1 : 0,
      enclaveId,
      seaAccess,
    };
  }

  public getModifiedCells(): readonly GridCell[] {
    const indices = this.packedGrid.getModifiedIndices();
    const result: GridCell[] = [];
    const buffer = this.packedGrid.getBuffer();

    for (const idx of indices) {
      const x = idx % 4096;
      const y = Math.floor(idx / 4096);
      const nationId = buffer.getNationId(x, y);
      const ownerId = nationId >= 11 ? `NATION_${nationId}` : "WATER";

      result.push({
        x,
        y,
        ownerId,
        highResPixelCount: nationId >= 11 ? 1 : 0,
        enclaveId: buffer.getEnclaveId(x, y),
        seaAccess: buffer.getCoastalAccess(x, y),
      });
    }

    return result;
  }

  public clear(): void {
    this.packedGrid.clearModifiedIndices();
  }
}
