import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridState {
  private cells: Map<string, GridCell> = new Map();
  private ownerMap: Map<string, GridCell[]> = new Map();
  private cachedAllCells: GridCell[] | null = null;

  public setCell(x: number, y: number, cell: GridCell): void {
    const key = `${x},${y}`;
    const existing = this.cells.get(key);

    if (existing && existing.ownerId !== cell.ownerId) {
      const oldList = this.ownerMap.get(existing.ownerId);
      if (oldList) {
        const idx = oldList.indexOf(existing);
        if (idx !== -1) {
          oldList.splice(idx, 1);
        }
      }
    }

    this.cells.set(key, cell);
    this.cachedAllCells = null;

    let newList = this.ownerMap.get(cell.ownerId);
    if (!newList) {
      newList = [];
      this.ownerMap.set(cell.ownerId, newList);
    }
    newList.push(cell);
  }

  public getCell(x: number, y: number): GridCell | undefined {
    return this.cells.get(`${x},${y}`);
  }

  public getCellsByOwner(ownerId: string): GridCell[] {
    return this.ownerMap.get(ownerId) || [];
  }

  public getAllCells(): GridCell[] {
    if (!this.cachedAllCells) {
      this.cachedAllCells = Array.from(this.cells.values());
    }
    return this.cachedAllCells;
  }

  public clear(): void {
    this.cells.clear();
    this.ownerMap.clear();
    this.cachedAllCells = null;
  }
}
