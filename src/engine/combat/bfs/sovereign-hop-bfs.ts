import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { BfsQueue } from "@/engine/combat/bfs/bfs-queue";
import { BfsStartCellFinder } from "./bfs-start-cell-finder";

export class SovereignHopBfs {
  private startCellFinder = new BfsStartCellFinder();

  public executeHopBfs(
    targetCountryId: string,
    targetEnclaveId: number,
    entryPoint: Coordinate,
    allCells: GridCell[],
    pixelLimit: number,
  ): GridCell[] {
    const targetCells = allCells.filter(
      (c) => c.ownerId === targetCountryId && c.enclaveId === targetEnclaveId,
    );

    if (targetCells.length === 0 || pixelLimit <= 0) {
      return [];
    }

    const cellMap = new Map<string, GridCell>();
    for (const c of targetCells) {
      cellMap.set(`${c.x},${c.y}`, c);
    }

    const conquered: GridCell[] = [];
    const queue = new BfsQueue<GridCell>();
    const visited = new Set<string>();

    const startCell = this.startCellFinder.findStartCell(
      entryPoint,
      targetCells,
      cellMap,
    );

    if (!startCell) {
      return [];
    }

    queue.enqueue(startCell);
    visited.add(`${startCell.x},${startCell.y}`);

    while (conquered.length < pixelLimit) {
      if (queue.isEmpty()) {
        let closestUnvisited: GridCell | undefined = undefined;
        let minDist = Infinity;

        for (const c of targetCells) {
          const key = `${c.x},${c.y}`;
          if (!visited.has(key)) {
            for (const active of conquered) {
              const dist = Math.hypot(c.x - active.x, c.y - active.y);
              if (dist < minDist) {
                minDist = dist;
                closestUnvisited = c;
              }
            }
          }
        }

        if (!closestUnvisited) {
          break;
        }

        queue.enqueue(closestUnvisited);
        visited.add(`${closestUnvisited.x},${closestUnvisited.y}`);
      }

      const current = queue.dequeue();
      if (!current) continue;

      conquered.push(current);

      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
      ];

      for (const n of neighbors) {
        const key = `${n.x},${n.y}`;
        if (cellMap.has(key) && !visited.has(key)) {
          visited.add(key);
          const neighborCell = cellMap.get(key);
          if (neighborCell) {
            queue.enqueue(neighborCell);
          }
        }
      }
    }

    return conquered;
  }
}
