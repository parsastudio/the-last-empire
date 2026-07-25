import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridState {
  private cells: Map<string, GridCell> = new Map();

  public setCell(x: number, y: number, cell: GridCell): void {
    this.cells.set(`${x},${y}`, cell);
  }

  public getCell(x: number, y: number): GridCell | undefined {
    return this.cells.get(`${x},${y}`);
  }

  public getAllCells(): GridCell[] {
    return Array.from(this.cells.values());
  }

  public clear(): void {
    this.cells.clear();
  }
}
