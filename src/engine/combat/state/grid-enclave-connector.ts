import { GridCell } from "@/domain/map/grid-cell.schema";
import { BfsQueue } from "@/engine/combat/bfs/bfs-queue";

export class GridEnclaveConnector {
  public regroupEnclaves(countryId: string, allCells: GridCell[]): void {
    const countryCells = allCells.filter((c) => c.ownerId === countryId);
    const visited = new Set<string>();
    let enclaveIdCounter = 1;

    for (const cell of countryCells) {
      const key = `${cell.x},${cell.y}`;
      if (!visited.has(key)) {
        const component: GridCell[] = [];
        const queue = new BfsQueue<GridCell>();

        queue.enqueue(cell);
        visited.add(key);

        while (!queue.isEmpty()) {
          const current = queue.dequeue();
          if (!current) continue;

          component.push(current);

          const neighbors = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 },
          ];

          for (const n of neighbors) {
            const nKey = `${n.x},${n.y}`;
            if (!visited.has(nKey)) {
              const match = countryCells.find(
                (c) => c.x === n.x && c.y === n.y,
              );
              if (match) {
                visited.add(nKey);
                queue.enqueue(match);
              }
            }
          }
        }

        const isMainland = component.some((c) => c.enclaveId === 0);
        const targetEnclaveId = isMainland ? 0 : enclaveIdCounter++;

        for (const c of component) {
          c.enclaveId = targetEnclaveId;
        }
      }
    }
  }
}
