import { GridCell } from "@/domain/map/grid-cell.schema";

export class FrontlineRenderer {
  public drawConquestFrontline(
    ctx: CanvasRenderingContext2D,
    cells: GridCell[],
    scaleFactor = 4,
  ): void {
    ctx.strokeStyle = "rgb(239, 68, 68)";
    ctx.lineWidth = 2;
    ctx.shadowColor = "rgba(239, 68, 68, 0.5)";
    ctx.shadowBlur = 4;

    const cellMap = new Map<string, GridCell>();
    cells.forEach((c) => cellMap.set(`${c.x},${c.y}`, c));

    ctx.beginPath();

    for (const cell of cells) {
      if (cell.isOccupied) {
        const neighbors = [
          { x: cell.x + 1, y: cell.y },
          { x: cell.x - 1, y: cell.y },
          { x: cell.x, y: cell.y + 1 },
          { x: cell.x, y: cell.y - 1 },
        ];

        for (const n of neighbors) {
          const match = cellMap.get(`${n.x},${n.y}`);
          if (match && !match.isOccupied) {
            const startX =
              cell.x * scaleFactor + (n.x - cell.x) * scaleFactor * 0.5;
            const startY =
              cell.y * scaleFactor + (n.y - cell.y) * scaleFactor * 0.5;
            ctx.moveTo(startX * scaleFactor, startY * scaleFactor);
            ctx.lineTo(startX * scaleFactor + 4, startY * scaleFactor + 4);
          }
        }
      }
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}
