import { BitPackedBuffer } from "@/infrastructure/map-preprocessing/final/bit-packed-buffer";

export class FrontierBitManager {
  public updateAllFrontiers(buffer: BitPackedBuffer): number {
    const width = buffer.getWidth();
    const height = buffer.getHeight();
    let frontierCount = 0;

    const neighbors = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const currentNation = buffer.getNationId(x, y);

        if (currentNation < 11 || currentNation >= 250) {
          buffer.setFrontier(x, y, 0);
          continue;
        }

        let isFrontier = 0;
        for (let k = 0; k < 4; k++) {
          const nx = (x + neighbors[k]!.dx + width) % width;
          const ny = y + neighbors[k]!.dy;

          if (ny >= 0 && ny < height) {
            const neighborNation = buffer.getNationId(nx, ny);
            if (
              neighborNation >= 11 &&
              neighborNation < 250 &&
              neighborNation !== currentNation
            ) {
              isFrontier = 1;
              break;
            }
          }
        }

        buffer.setFrontier(x, y, isFrontier);
        if (isFrontier === 1) {
          frontierCount++;
        }
      }
    }

    return frontierCount;
  }

  public updateModifiedFrontiers(
    buffer: BitPackedBuffer,
    modifiedIndices: Iterable<number>,
  ): void {
    const width = buffer.getWidth();
    const height = buffer.getHeight();

    const neighbors = [
      { dx: 1, dy: 0 },
      { dx: -1, dy: 0 },
      { dx: 0, dy: 1 },
      { dx: 0, dy: -1 },
    ];

    for (const idx of modifiedIndices) {
      const x = idx % width;
      const y = Math.floor(idx / width);

      const currentNation = buffer.getNationId(x, y);

      if (currentNation < 11 || currentNation >= 250) {
        buffer.setFrontier(x, y, 0);
        continue;
      }

      let isFrontier = 0;
      for (let k = 0; k < 4; k++) {
        const nx = (x + neighbors[k]!.dx + width) % width;
        const ny = y + neighbors[k]!.dy;

        if (ny >= 0 && ny < height) {
          const neighborNation = buffer.getNationId(nx, ny);
          if (
            neighborNation >= 11 &&
            neighborNation < 250 &&
            neighborNation !== currentNation
          ) {
            isFrontier = 1;
            break;
          }
        }
      }

      buffer.setFrontier(x, y, isFrontier);
    }
  }
}
