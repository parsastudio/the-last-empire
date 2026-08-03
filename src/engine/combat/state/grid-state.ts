import { GridCell } from "@/domain/map/grid-cell.schema";
import { NationIdResolver } from "@/domain/shared/domain-utilities";

export type { GridCell };

export class GridState {
  private cells: Map<string, GridCell> = new Map();
  private gridArray: (GridCell | undefined)[] = new Array(1024 * 512);
  private ownerMap: Map<string, GridCell[]> = new Map();
  private modifiedCells: GridCell[] = [];
  private cachedAllCells: GridCell[] | null = null;

  public setCell(x: number, y: number, cell: GridCell): void {
    const key = `${x},${y}`;
    const idx = y * 1024 + x;
    const existing = this.gridArray[idx];

    if (existing && existing.ownerId !== cell.ownerId) {
      const oldList = this.ownerMap.get(existing.ownerId);
      if (oldList) {
        const listIdx = oldList.indexOf(existing);
        if (listIdx !== -1) {
          oldList.splice(listIdx, 1);
        }
      }
    }

    if (
      cell.initialOwnerId &&
      cell.ownerId !== cell.initialOwnerId &&
      cell.ownerId.startsWith("NATION_")
    ) {
      if (!this.modifiedCells.includes(cell)) {
        this.modifiedCells.push(cell);
      }
    }

    this.cells.set(key, cell);
    this.gridArray[idx] = cell;
    this.cachedAllCells = null;

    let newList = this.ownerMap.get(cell.ownerId);
    if (!newList) {
      newList = [];
      this.ownerMap.set(cell.ownerId, newList);
    }
    newList.push(cell);
  }

  public getCell(x: number, y: number): GridCell | undefined {
    if (x < 0 || x >= 1024 || y < 0 || y >= 512) return undefined;
    return this.gridArray[y * 1024 + x];
  }

  public getCellsByOwner(ownerId: string): GridCell[] {
    const canonical = NationIdResolver.resolveCanonicalId(ownerId);
    const direct = this.ownerMap.get(ownerId) || [];
    const canonicalList =
      ownerId !== canonical ? this.ownerMap.get(canonical) || [] : [];

    if (direct.length === 0) return canonicalList;
    if (canonicalList.length === 0) return direct;

    const set = new Set([...direct, ...canonicalList]);
    return Array.from(set);
  }

  public getModifiedCells(): readonly GridCell[] {
    return this.modifiedCells;
  }

  public getAllCells(): GridCell[] {
    if (!this.cachedAllCells) {
      this.cachedAllCells = Array.from(this.cells.values());
    }
    return this.cachedAllCells;
  }

  public clear(): void {
    this.cells.clear();
    this.gridArray.fill(undefined);
    this.ownerMap.clear();
    this.modifiedCells = [];
    this.cachedAllCells = null;
  }
}
