export class ClosedSeaDetector {
  public detectAndMarkClosedSeas(
    packed1024: Uint8Array,
    lowResWidth = 1024,
    lowResHeight = 512,
  ): void {
    const totalPixels = lowResWidth * lowResHeight;
    const waterVisited = new Uint8Array(totalPixels);
    const component: number[] = [];
    const queue = new Int32Array(totalPixels);

    for (let gy = 0; gy < lowResHeight; gy++) {
      for (let gx = 0; gx < lowResWidth; gx++) {
        const startIdx = gy * lowResWidth + gx;
        const pIdx = startIdx * 2;
        const finalB = packed1024[pIdx + 1];

        if (finalB === 0 && waterVisited[startIdx] === 0) {
          component.length = 0;
          let head = 0;
          let tail = 0;

          queue[tail++] = startIdx;
          waterVisited[startIdx] = 1;

          while (head < tail) {
            const curr = queue[head++]!;
            component.push(curr);

            const cx = curr % lowResWidth;
            const cy = Math.floor(curr / lowResWidth);

            const neighbors = [
              { x: cx + 1, y: cy },
              { x: cx - 1, y: cy },
              { x: cx, y: cy + 1 },
              { x: cx, y: cy - 1 },
            ];

            for (let i = 0; i < 4; i++) {
              let nx = neighbors[i]!.x;
              if (nx < 0) nx = lowResWidth - 1;
              else if (nx >= lowResWidth) nx = 0;

              const ny = neighbors[i]!.y;
              if (ny >= 0 && ny < lowResHeight) {
                const nIdx = ny * lowResWidth + nx;
                const nPIdx = nIdx * 2;
                const nB = packed1024[nPIdx + 1];
                if (nB === 0 && waterVisited[nIdx] === 0) {
                  waterVisited[nIdx] = 1;
                  queue[tail++] = nIdx;
                }
              }
            }
          }

          const isClosed = component.length < 500;
          for (let i = 0; i < component.length; i++) {
            const cpIdx = component[i]! * 2;
            if (isClosed) {
              packed1024[cpIdx] = (0 << 2) | 2;
            } else {
              const originalR = packed1024[cpIdx]! & 0x3;
              packed1024[cpIdx] = (0 << 2) | (originalR <= 1 ? 1 : 0);
            }
          }
        }
      }
    }
  }
}
