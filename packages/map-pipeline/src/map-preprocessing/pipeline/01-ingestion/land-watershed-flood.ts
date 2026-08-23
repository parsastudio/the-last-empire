export class LandWatershedFlood {
  public static flood(
    rawNationGrid: Uint8Array,
    width: number,
    height: number,
    validNationIds: Set<number>,
  ): Uint8Array {
    const totalPixels = width * height;
    const assignmentGrid = new Uint8Array(totalPixels);
    const distGrid = new Int32Array(totalPixels);
    distGrid.fill(2000000000);

    const maxQueueSize = totalPixels * 2;
    const queueX = new Int32Array(maxQueueSize);
    const queueY = new Int32Array(maxQueueSize);
    let head = 0;
    let tail = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const rawId = rawNationGrid[idx]!;

        if (validNationIds.has(rawId)) {
          assignmentGrid[idx] = rawId;
          distGrid[idx] = 0;

          queueX[tail] = x;
          queueY[tail] = y;
          tail++;
        } else if (rawId >= 11 && rawId < 250) {
          assignmentGrid[idx] = 255;
        } else {
          assignmentGrid[idx] = 0;
        }
      }
    }

    const neighbors8 = [
      { dx: 1, dy: 0, cost: 10 },
      { dx: -1, dy: 0, cost: 10 },
      { dx: 0, dy: 1, cost: 10 },
      { dx: 0, dy: -1, cost: 10 },
      { dx: 1, dy: 1, cost: 14 },
      { dx: -1, dy: 1, cost: 14 },
      { dx: 1, dy: -1, cost: 14 },
      { dx: -1, dy: -1, cost: 14 },
    ];

    while (head < tail) {
      const cx = queueX[head]!;
      const cy = queueY[head]!;
      head++;

      const cIdx = cy * width + cx;
      const currentDist = distGrid[cIdx]!;
      const currentNation = assignmentGrid[cIdx]!;

      for (let k = 0; k < 8; k++) {
        const n = neighbors8[k]!;
        const nx = (cx + n.dx + width) % width;
        const ny = cy + n.dy;

        if (ny >= 0 && ny < height) {
          const nIdx = ny * width + nx;
          if (assignmentGrid[nIdx] === 255) {
            const newDist = currentDist + n.cost;
            if (newDist < distGrid[nIdx]!) {
              distGrid[nIdx] = newDist;
              assignmentGrid[nIdx] = currentNation;

              if (tail < maxQueueSize) {
                queueX[tail] = nx;
                queueY[tail] = ny;
                tail++;
              }
            }
          }
        }
      }
    }

    for (let i = 0; i < totalPixels; i++) {
      if (assignmentGrid[i] === 255) {
        assignmentGrid[i] = 0;
      }
    }

    return assignmentGrid;
  }
}
