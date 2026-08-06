import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export interface ConquestExecutionResult {
  capturedPixelsCount: number;
  conquestCompleted: boolean;
}

export class WavefrontConquestEngine {
  public conquerTerritory(
    buffer: BitPackedBuffer,
    attackerNationId: number,
    defenderNationId: number,
    targetPixelsCount: number,
  ): ConquestExecutionResult {
    if (targetPixelsCount <= 0) {
      return {
        capturedPixelsCount: 0,
        conquestCompleted: false,
      };
    }

    const width = buffer.getWidth();
    const height = buffer.getHeight();
    const gridState = BitPackedGridState.getInstance();

    const queueX: number[] = [];
    const queueY: number[] = [];
    const visited = new Set<number>();

    const neighbors = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (
          buffer.getNationId(x, y) === defenderNationId &&
          buffer.getFrontier(x, y) === 1
        ) {
          for (let k = 0; k < 4; k++) {
            const nx = (x + neighbors[k]!.dx + width) % width;
            const ny = y + neighbors[k]!.dy;
            if (ny >= 0 && ny < height) {
              if (buffer.getNationId(nx, ny) === attackerNationId) {
                const idx = y * width + x;
                if (!visited.has(idx)) {
                  visited.add(idx);
                  queueX.push(x);
                  queueY.push(y);
                }
                break;
              }
            }
          }
        }
      }
    }

    if (queueX.length === 0) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (buffer.getNationId(x, y) === defenderNationId) {
            for (let k = 0; k < 4; k++) {
              const nx = (x + neighbors[k]!.dx + width) % width;
              const ny = y + neighbors[k]!.dy;
              if (ny >= 0 && ny < height) {
                if (buffer.getNationId(nx, ny) === attackerNationId) {
                  const idx = y * width + x;
                  if (!visited.has(idx)) {
                    visited.add(idx);
                    queueX.push(x);
                    queueY.push(y);
                  }
                  break;
                }
              }
            }
          }
        }
      }
    }

    if (queueX.length === 0) {
      return {
        capturedPixelsCount: 0,
        conquestCompleted: false,
      };
    }

    let capturedPixelsCount = 0;
    let head = 0;

    while (head < queueX.length && capturedPixelsCount < targetPixelsCount) {
      const cx = queueX[head]!;
      const cy = queueY[head]!;
      head++;

      if (buffer.getNationId(cx, cy) === defenderNationId) {
        gridState.setNationId(cx, cy, attackerNationId);
        capturedPixelsCount++;

        for (let k = 0; k < 4; k++) {
          const nx = (cx + neighbors[k]!.dx + width) % width;
          const ny = cy + neighbors[k]!.dy;

          if (ny >= 0 && ny < height) {
            const idx = ny * width + nx;
            if (
              !visited.has(idx) &&
              buffer.getNationId(nx, ny) === defenderNationId
            ) {
              visited.add(idx);
              queueX.push(nx);
              queueY.push(ny);
            }
          }
        }
      }
    }

    return {
      capturedPixelsCount,
      conquestCompleted: capturedPixelsCount >= targetPixelsCount,
    };
  }
}
