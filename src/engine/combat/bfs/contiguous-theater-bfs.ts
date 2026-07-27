import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";
import { SeaBridgeConnector } from "@/engine/combat/sea-bridges/sea-bridge-connector";
import { BfsQueue } from "@/engine/combat/bfs/bfs-queue";
import { BfsStartCellFinder } from "./bfs-start-cell-finder";

export class ContiguousTheaterBfs {
  private connector = new SeaBridgeConnector();
  private startCellFinder = new BfsStartCellFinder();

  public findTheaterCells(
    targetCountryId: string,
    entryPoint: Coordinate,
    allCells: GridCell[],
  ): GridCell[] {
    const countryCells = allCells.filter((c) => c.ownerId === targetCountryId);
    const cellMap = new Map<string, GridCell>();
    for (const c of countryCells) {
      cellMap.set(`${c.x},${c.y}`, c);
    }

    const startCell = this.startCellFinder.findStartCell(
      entryPoint,
      countryCells,
      cellMap,
    );

    if (!startCell) {
      return [];
    }

    const theaterCells: GridCell[] = [];
    const queue = new BfsQueue<GridCell>();
    const visited = new Set<string>();

    queue.enqueue(startCell);
    visited.add(`${startCell.x},${startCell.y}`);

    const latitude = (0.5 - entryPoint.y / 512) * 180;

    while (!queue.isEmpty()) {
      const current = queue.dequeue();
      if (!current) continue;

      theaterCells.push(current);

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

      for (const potential of countryCells) {
        const key = `${potential.x},${potential.y}`;
        if (!visited.has(key)) {
          if (
            this.connector.areConnectedBySeaBridge(current, potential, latitude)
          ) {
            visited.add(key);
            queue.enqueue(potential);
          }
        }
      }
    }

    return theaterCells;
  }
}
