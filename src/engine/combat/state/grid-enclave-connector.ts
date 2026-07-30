import { GridCell } from "@/domain/map/grid-cell.schema";
import { BfsQueue } from "@/engine/combat/bfs/bfs-queue";

export class GridEnclaveConnector {
  public regroupEnclaves(countryId: string, allCells: GridCell[]): void {
    const countryCells: GridCell[] = [];
    for (let i = 0; i < allCells.length; i++) {
      if (allCells[i]!.ownerId === countryId) {
        countryCells.push(allCells[i]!);
      }
    }

    if (countryCells.length === 0) return;

    const visited = new Set<string>();
    let enclaveIdCounter = 1;

    for (let i = 0; i < countryCells.length; i++) {
      const cell = countryCells[i]!;
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

          for (let j = 0; j < 4; j++) {
            const n = neighbors[j]!;
            const nKey = `${n.x},${n.y}`;
            if (!visited.has(nKey)) {
              for (let k = 0; k < countryCells.length; k++) {
                const match = countryCells[k]!;
                if (match.x === n.x && match.y === n.y) {
                  visited.add(nKey);
                  queue.enqueue(match);
                  break;
                }
              }
            }
          }
        }

        const isMainland = component.some((c) => c.enclaveId === 0);
        let colonyCell: GridCell | undefined = undefined;
        for (let j = 0; j < component.length; j++) {
          if (component[j]!.enclaveId >= 11) {
            colonyCell = component[j];
            break;
          }
        }

        let targetEnclaveId = 0;
        if (isMainland) {
          targetEnclaveId = 0;
        } else if (colonyCell) {
          targetEnclaveId = Math.min(63, colonyCell.enclaveId);
        } else {
          targetEnclaveId = Math.min(10, enclaveIdCounter++);
        }

        for (let j = 0; j < component.length; j++) {
          component[j]!.enclaveId = targetEnclaveId;
        }
      }
    }
  }
}
