import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

export interface ConquestExecutionResult {
  capturedPixelsCount: number;
  conquestCompleted: boolean;
}

export class WavefrontConquestEngine {
  private static readonly MAX_WATER_JUMP = 20;

  public conquerTerritory(
    buffer: BitPackedBuffer,
    attackerNationId: number,
    defenderNationId: number,
    targetPixelsCount: number,
    targetEnclaveId?: number,
  ): ConquestExecutionResult {
    if (targetPixelsCount <= 0 || attackerNationId === defenderNationId) {
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

    const isMatchingEnclave = (x: number, y: number): boolean => {
      if (targetEnclaveId === undefined || targetEnclaveId === 0) return true;
      return buffer.getEnclaveId(x, y) === targetEnclaveId;
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (
          buffer.getNationId(x, y) === defenderNationId &&
          isMatchingEnclave(x, y)
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

    const rayDirections = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: -1, dy: 1 },
    ];

    while (head < queueX.length && capturedPixelsCount < targetPixelsCount) {
      const cx = queueX[head]!;
      const cy = queueY[head]!;
      head++;

      if (buffer.getNationId(cx, cy) === defenderNationId) {
        gridState.setNationId(cx, cy, attackerNationId);
        capturedPixelsCount++;

        let foundLandNeighbor = false;

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
              foundLandNeighbor = true;
            }
          }
        }

        if (
          !foundLandNeighbor ||
          queueX.length - head < 10 ||
          capturedPixelsCount < targetPixelsCount
        ) {
          for (let r = 0; r < 8; r++) {
            const ray = rayDirections[r]!;
            for (
              let step = 1;
              step <= WavefrontConquestEngine.MAX_WATER_JUMP;
              step++
            ) {
              let nx = cx + ray.dx * step;
              if (nx < 0) nx = (nx + width) % width;
              else if (nx >= width) nx = nx % width;

              const ny = cy + ray.dy * step;
              if (ny < 0 || ny >= height) break;

              const pNation = buffer.getNationId(nx, ny);

              if (pNation === defenderNationId) {
                if (isMatchingEnclave(nx, ny)) {
                  const idx = ny * width + nx;
                  if (!visited.has(idx)) {
                    visited.add(idx);
                    queueX.push(nx);
                    queueY.push(ny);
                  }
                }
                break;
              } else if (pNation !== 0) {
                break;
              }
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
