import { GridState } from "@/engine/combat/state/grid-state";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { CellAreaCalibrator } from "./state/cell-area-calibrator";

export class GridTerritoryCapturer {
  private calibrator = new CellAreaCalibrator(512, 1024, 510072000);

  public captureTerritory(
    attackerId: string,
    defenderId: string,
    targetAreaSqKm: number,
    gridState: GridState,
  ): number {
    if (targetAreaSqKm <= 0) return 0;

    const defenderCells = gridState.getCellsByOwner(defenderId);
    if (defenderCells.length === 0) return 0;

    const defenderSet = new Set<string>();
    const cellMap = new Map<string, GridCell>();

    for (let i = 0; i < defenderCells.length; i++) {
      const c = defenderCells[i]!;
      const key = `${c.x},${c.y}`;
      defenderSet.add(key);
      cellMap.set(key, c);
    }

    const frontierQueue: GridCell[] = [];

    const neighbors = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    for (let i = 0; i < defenderCells.length; i++) {
      const c = defenderCells[i]!;
      let isFrontier = false;

      for (let k = 0; k < 4; k++) {
        const nx = (c.x + neighbors[k]!.dx + 1024) % 1024;
        const ny = c.y + neighbors[k]!.dy;

        if (ny < 0 || ny >= 512) continue;

        const neighborCell = gridState.getCell(nx, ny);
        if (neighborCell && neighborCell.ownerId === attackerId) {
          isFrontier = true;
          break;
        }
      }

      if (isFrontier) {
        frontierQueue.push(c);
      }
    }

    if (frontierQueue.length === 0) {
      frontierQueue.push(...defenderCells.slice(0, 10));
    }

    let capturedArea = 0;
    const capturedCells = new Set<GridCell>();

    let head = 0;
    while (head < frontierQueue.length && capturedArea < targetAreaSqKm) {
      const current = frontierQueue[head++]!;
      if (capturedCells.has(current)) continue;

      capturedCells.add(current);
      const cellArea = this.calibrator.getCalibratedCellArea(current);
      capturedArea += cellArea;

      for (let k = 0; k < 4; k++) {
        const nx = (current.x + neighbors[k]!.dx + 1024) % 1024;
        const ny = current.y + neighbors[k]!.dy;

        if (ny < 0 || ny >= 512) continue;

        const nKey = `${nx},${ny}`;
        if (defenderSet.has(nKey)) {
          const neighborCell = cellMap.get(nKey);
          if (neighborCell && !capturedCells.has(neighborCell)) {
            frontierQueue.push(neighborCell);
          }
        }
      }
    }

    for (const cell of capturedCells) {
      const updatedCell: GridCell = {
        ...cell,
        ownerId: attackerId,
      };
      gridState.setCell(cell.x, cell.y, updatedCell);
    }

    return Math.round(capturedArea);
  }
}
