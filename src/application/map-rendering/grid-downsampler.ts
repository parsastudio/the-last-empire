import { GridState } from "@/engine/combat/state/grid-state";
import { RegionClusteringEngine } from "./utils/region-clustering-engine";

export class GridDownsampler {
  private clusteringEngine = new RegionClusteringEngine();

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
        const countryCounts = new Map<number, number>();
        for (let sy = 0; sy < scaleFactor; sy++) {
          for (let sx = 0; sx < scaleFactor; sx++) {
            const hx = gx * scaleFactor + sx;
            const hy = gy * scaleFactor + sy;
            const idx = hy * highResWidth + hx;
            const val = maskBuffer[idx];
            if (val === 254) {
              hasForcedPassage = true;
            } else if (val !== undefined && val >= 11) {
              countryCounts.set(val, (countryCounts.get(val) ?? 0) + 1);
            }
          }
        }

        let cellOwner = "WATER";
        if (hasForcedPassage) {
          cellOwner = "WATER";
        } else if (countryCounts.size > 0) {
          let maxCount = 0;
          for (const [id, count] of countryCounts.entries()) {
            if (count > maxCount) {
              maxCount = count;
              cellOwner = `NATION_${id}`;
            }
          }
        }

        const cell = {
          x: gx,
          y: gy,
          ownerId: cellOwner,
          highResPixelCount: countryCounts.size > 0 ? 16 : 0,
          enclaveId: 0,
          seaAccess: 0,
        };
        gridState.setCell(gx, gy, cell);
      }
    }

    const allCells = gridState.getAllCells();
    const uniqueOwners = new Set(
      allCells.map((c) => c.ownerId).filter((o) => o.startsWith("NATION_")),
    );

    for (const ownerId of uniqueOwners) {
      this.clusteringEngine.clusterNationRegions(
        ownerId,
        allCells,
        lowResWidth,
      );
    }

    return gridState;
  }
}
