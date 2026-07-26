import { Coordinate } from "@/domain/map/coordinate.schema";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class NavalPathResolver {
  public isNavalPathBlocked(
    origin: Coordinate,
    target: Coordinate,
    allCells: GridCell[],
  ): boolean {
    const traversable = new Set<string>();
    for (const cell of allCells) {
      if (
        cell.ownerId === "WATER" ||
        cell.ownerId.startsWith("GULF_") ||
        cell.isOccupied
      ) {
        traversable.add(`${cell.x},${cell.y}`);
      }
    }

    traversable.add(`${origin.x},${origin.y}`);
    traversable.add(`${target.x},${target.y}`);

    const queue: Coordinate[] = [origin];
    const visited = new Set<string>([`${origin.x},${origin.y}`]);

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.x === target.x && current.y === target.y) {
        return false;
      }

      const neighbors = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 },
        { x: current.x + 1, y: current.y + 1 },
        { x: current.x - 1, y: current.y - 1 },
        { x: current.x + 1, y: current.y - 1 },
        { x: current.x - 1, y: current.y + 1 },
      ];

      for (const n of neighbors) {
        let nx = n.x;
        if (nx < 0) nx = 1023;
        if (nx >= 1024) nx = 0;

        const ny = n.y;
        if (ny >= 0 && ny < 512) {
          const key = `${nx},${ny}`;
          if (traversable.has(key) && !visited.has(key)) {
            visited.add(key);
            queue.push({ x: nx, y: ny });
          }
        }
      }
    }

    return true;
  }
}
