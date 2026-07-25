import { GridState } from "@/engine/combat/state/grid-state";
import { GridBuilder } from "@/engine/combat/state/grid-builder";

export class GridDownsampler {
  private builder = new GridBuilder();

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

        for (let sy = 0; sy < scaleFactor; sy++) {
          for (let sx = 0; sx < scaleFactor; sx++) {
            const hx = gx * scaleFactor + sx;
            const hy = gy * scaleFactor + sy;
            const idx = hy * highResWidth + hx;
            const val = maskBuffer[idx];

            if (val !== undefined && val >= 11) {
              countryIds.push(`NATION_${val}`);
              enclaveIds.push(0);
            }
          }
        }

        const cell = this.builder.buildGridCell(gx, gy, countryIds, enclaveIds);

        gridState.setCell(gx, gy, cell);
      }
    }

    return gridState;
  }
}
