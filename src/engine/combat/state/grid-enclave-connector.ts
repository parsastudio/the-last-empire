import { GridCell } from "@/domain/map/grid-cell.schema";
import { BfsQueue } from "@/engine/combat/bfs/bfs-queue";

interface ConnectedComponent {
  cells: GridCell[];
  hasOriginalMainland: boolean;
}

export class GridEnclaveConnector {
  public cleanupEnclaves(countryCells: GridCell[]): void {
    if (!countryCells || countryCells.length === 0) return;

    const activeEnclaves = new Set<number>();

    for (let i = 0; i < countryCells.length; i++) {
      const cell = countryCells[i]!;
      if (cell.enclaveId > 0) {
        activeEnclaves.add(cell.enclaveId);
      }
    }

    for (let id = 1; id <= 10; id++) {
      if (!activeEnclaves.has(id)) {
        for (let i = 0; i < countryCells.length; i++) {
          const c = countryCells[i]!;
          if (c.enclaveId === id) {
            c.enclaveId = 0;
          }
        }
      }
    }
  }

  public regroupEnclaves(countryId: string, countryCells: GridCell[]): void {
    if (!countryCells || countryCells.length === 0) return;

    const cellMap = new Map<string, GridCell>();
    for (let i = 0; i < countryCells.length; i++) {
      const c = countryCells[i]!;
      cellMap.set(`${c.x},${c.y}`, c);
    }

    const visited = new Set<string>();
    const components: ConnectedComponent[] = [];

    for (let i = 0; i < countryCells.length; i++) {
      const cell = countryCells[i]!;
      const key = `${cell.x},${cell.y}`;
      if (!visited.has(key)) {
        const componentCells: GridCell[] = [];
        const queue = new BfsQueue<GridCell>();

        queue.enqueue(cell);
        visited.add(key);

        let hasOriginalMainland = false;

        while (!queue.isEmpty()) {
          const current = queue.dequeue();
          if (!current) continue;

          componentCells.push(current);
          if (current.enclaveId === 0) {
            hasOriginalMainland = true;
          }

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
              const match = cellMap.get(nKey);
              if (match) {
                visited.add(nKey);
                queue.enqueue(match);
              }
            }
          }
        }

        components.push({
          cells: componentCells,
          hasOriginalMainland,
        });
      }
    }

    const hasAnyMainlandLeft = components.some(
      (comp) => comp.hasOriginalMainland,
    );

    components.sort((a, b) => b.cells.length - a.cells.length);

    let enclaveIdCounter = 1;

    for (let i = 0; i < components.length; i++) {
      const comp = components[i]!;

      let targetEnclaveId = 0;

      if (comp.hasOriginalMainland) {
        targetEnclaveId = 0;
      } else if (!hasAnyMainlandLeft && i === 0) {
        targetEnclaveId = 0;
      } else {
        targetEnclaveId = Math.min(10, enclaveIdCounter++);
      }

      for (let j = 0; j < comp.cells.length; j++) {
        comp.cells[j]!.enclaveId = targetEnclaveId;
      }
    }
  }
}
