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
        const countryIds: string[] = [];
        const enclaveIds: number[] = [];
        const waterCounts = new Int32Array(11);
        let hasHighway = false;

        for (let sy = 0; sy < scaleFactor; sy++) {
          for (let sx = 0; sx < scaleFactor; sx++) {
            const hx = gx * scaleFactor + sx;
            const hy = gy * scaleFactor + sy;
            const idx = hy * highResWidth + hx;
            const val = maskBuffer[idx];

            if (val !== undefined) {
              if (val === 1) {
                hasHighway = true;
              }

              if (val >= 11) {
                countryIds.push(`NATION_${val}`);
                enclaveIds.push(0);
              } else {
                waterCounts[val]++;
              }
            }
          }
        }

        let cellOwner = "WATER";
        if (countryIds.length > 0) {
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

          if (hasHighway) {
            cellOwner = "WATER";
          }
        } else {
          let maxWaterId = 0;
          let maxWaterCount = 0;
          for (let w = 0; w < 11; w++) {
            if (waterCounts[w] > maxWaterCount) {
              maxWaterCount = waterCounts[w];
              maxWaterId = w;
            }
          }
          if (maxWaterId > 0) {
            cellOwner = `GULF_${maxWaterId}`;
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

    return gridState;
  }
}
