import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";

export interface ConquestExecutionResult {
  capturedPixelsCount: number;
  capturedAreaSqKm: number;
  conquestCompleted: boolean;
}

export class WavefrontConquestEngine {
  private readonly pixelAreaKm2 = 86.3;

  public conquerTerritory(
    buffer: BitPackedBuffer,
    attackerNationId: number,
    defenderNationId: number,
    targetAreaSqKm: number,
  ): ConquestExecutionResult {
    if (targetAreaSqKm <= 0) {
      return {
        capturedPixelsCount: 0,
        capturedAreaSqKm: 0,
        conquestCompleted: false,
      };
    }

    const width = buffer.getWidth();
    const height = buffer.getHeight();
    const targetPixelsToCapture = Math.ceil(targetAreaSqKm / this.pixelAreaKm2);

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
        if (buffer.getNationId(x, y) === defenderNationId) {
          let isFrontier = false;
          for (let k = 0; k < 4; k++) {
            const nx = (x + neighbors[k]!.dx + width) % width;
            const ny = y + neighbors[k]!.dy;
            if (ny >= 0 && ny < height) {
              if (buffer.getNationId(nx, ny) === attackerNationId) {
                isFrontier = true;
                break;
              }
            }
          }

          if (isFrontier) {
            queueX.push(x);
            queueY.push(y);
            visited.add(y * width + x);
          }
        }
      }
    }

    if (queueX.length === 0) {
      return {
        capturedPixelsCount: 0,
        capturedAreaSqKm: 0,
        conquestCompleted: false,
      };
    }

    let capturedPixelsCount = 0;
    let head = 0;

    while (
      head < queueX.length &&
      capturedPixelsCount < targetPixelsToCapture
    ) {
      const cx = queueX[head]!;
      const cy = queueY[head]!;
      head++;

      if (buffer.getNationId(cx, cy) === defenderNationId) {
        buffer.setNationId(cx, cy, attackerNationId);
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

    const capturedAreaSqKm = Math.round(
      capturedPixelsCount * this.pixelAreaKm2,
    );

    return {
      capturedPixelsCount,
      capturedAreaSqKm,
      conquestCompleted: capturedPixelsCount >= targetPixelsToCapture,
    };
  }
}
