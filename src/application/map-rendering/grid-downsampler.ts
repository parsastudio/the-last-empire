import { GridState } from "@/engine/combat/state/grid-state";

export class GridDownsampler {
  public downsampleMask(
    maskBuffer: Uint8Array,
    highResWidth: number,
    highResHeight: number,
    scaleFactor = 4,
  ): GridState {
    const gridState = new GridState();
    const lowResWidth = Math.floor(highResWidth / scaleFactor);
    const lowResHeight = Math.floor(highResHeight / scaleFactor);

    for (let gy = 0; gy < lowResHeight; gy++) {
      for (let gx = 0; gx < lowResWidth; gx++) {
        let hasForcedPassage = false;
        const countryIds: string[] = [];
        for (let sy = 0; sy < scaleFactor; sy++) {
          for (let sx = 0; sx < scaleFactor; sx++) {
            const hx = gx * scaleFactor + sx;
            const hy = gy * scaleFactor + sy;
            const idx = hy * highResWidth + hx;
            const val = maskBuffer[idx];
            if (val === 254) {
              hasForcedPassage = true;
            } else if (val !== undefined && val >= 11) {
              countryIds.push(`NATION_${val}`);
            }
          }
        }

        let cellOwner = "WATER";
        if (hasForcedPassage) {
          cellOwner = "WATER";
        } else if (countryIds.length > 0) {
          const counts = new Map<string, number>();
          for (const id of countryIds) {
            counts.set(id, (counts.get(id) || 0) + 1);
          }
          let maxCount = 0;
          for (const [id, count] of counts.entries()) {
            if (count > maxCount) {
              maxCount = count;
              cellOwner = id;
            }
          }
        }

        const cell = {
          x: gx,
          y: gy,
          ownerId: cellOwner,
          isOccupied: false,
          occupierId: null,
          highResPixelCount: countryIds.length,
          enclaveId: 0,
        };
        gridState.setCell(gx, gy, cell);
      }
    }

    const visited = new Uint8Array(lowResWidth * lowResHeight);

    for (let gy = 0; gy < lowResHeight; gy++) {
      for (let gx = 0; gx < lowResWidth; gx++) {
        const startIdx = gy * lowResWidth + gx;
        const cell = gridState.getCell(gx, gy);
        if (cell && cell.ownerId === "WATER" && visited[startIdx] === 0) {
          const component: (typeof cell)[] = [];
          const queue: number[] = [startIdx];
          visited[startIdx] = 1;
          let head = 0;

          while (head < queue.length) {
            const curr = queue[head++];
            if (curr !== undefined) {
              const cx = curr % lowResWidth;
              const cy = Math.floor(curr / lowResWidth);
              const cCell = gridState.getCell(cx, cy);
              if (cCell) {
                component.push(cCell);
              }

              const neighbors = [
                { x: cx + 1, y: cy },
                { x: cx - 1, y: cy },
                { x: cx, y: cy + 1 },
                { x: cx, y: cy - 1 },
              ];

              for (const n of neighbors) {
                let nx = n.x;
                if (nx < 0) {
                  nx = lowResWidth - 1;
                } else if (nx >= lowResWidth) {
                  nx = 0;
                }

                const ny = n.y;
                if (ny >= 0 && ny < lowResHeight) {
                  const nIdx = ny * lowResWidth + nx;
                  const nCell = gridState.getCell(nx, ny);
                  if (
                    nCell &&
                    nCell.ownerId === "WATER" &&
                    visited[nIdx] === 0
                  ) {
                    visited[nIdx] = 1;
                    queue.push(nIdx);
                  }
                }
              }
            }
          }

          if (component.length < 500) {
            for (const c of component) {
              c.ownerId = "CLOSED_SEA";
            }
          }
        }
      }
    }

    return gridState;
  }
}
