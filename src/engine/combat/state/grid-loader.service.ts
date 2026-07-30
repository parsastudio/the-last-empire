import { GridState } from "@/engine/combat/state/grid-state";
import { MapDataProvider } from "@/engine/combat/state/map-data-provider";
import { LowResPacker } from "@/infrastructure/map-preprocessing/utils/low-res-packer";
import { GridCell } from "@/domain/map/grid-cell.schema";

export class GridLoaderService {
  private static isLoading = false;

  public static async ensureGridLoaded(
    gridState: GridState,
  ): Promise<GridState> {
    if (gridState.getAllCells().length > 0 || this.isLoading) {
      return gridState;
    }

    this.isLoading = true;
    try {
      const mapProvider = new MapDataProvider();
      const packedBuffer = await mapProvider.load1024PackedBuffer();

      if (packedBuffer && packedBuffer.length === 1024 * 512 * 2) {
        for (let gy = 0; gy < 512; gy++) {
          for (let gx = 0; gx < 1024; gx++) {
            const pIdx = (gy * 1024 + gx) * 2;
            const geoByte = packedBuffer[pIdx] || 0;
            const nationByte = packedBuffer[pIdx + 1] || 0;
            const enclaveId = geoByte >> 2;

            let ownerId = "WATER";
            if (nationByte >= 11) {
              ownerId = `NATION_${nationByte}`;
            } else if ((geoByte & 0x3) === 2) {
              ownerId = "CLOSED_SEA";
            }

            const cell: GridCell = {
              x: gx,
              y: gy,
              ownerId,
              highResPixelCount: nationByte >= 11 ? 16 : 0,
              enclaveId,
              seaAccess: geoByte & 0x3,
            };
            gridState.setCell(gx, gy, cell);
          }
        }
      } else {
        const rawBuffer = await mapProvider.loadRawMaskBuffer();
        if (rawBuffer && rawBuffer.length === 4096 * 2048) {
          const packer = new LowResPacker();
          const generatedPacked = packer.pack4KTo1024(rawBuffer, 1024, 512, 4);
          for (let gy = 0; gy < 512; gy++) {
            for (let gx = 0; gx < 1024; gx++) {
              const pIdx = (gy * 1024 + gx) * 2;
              const geoByte = generatedPacked[pIdx] || 0;
              const nationByte = generatedPacked[pIdx + 1] || 0;
              const enclaveId = geoByte >> 2;

              let ownerId = "WATER";
              if (nationByte >= 11) {
                ownerId = `NATION_${nationByte}`;
              } else if ((geoByte & 0x3) === 2) {
                ownerId = "CLOSED_SEA";
              }

              const cell: GridCell = {
                x: gx,
                y: gy,
                ownerId,
                highResPixelCount: nationByte >= 11 ? 16 : 0,
                enclaveId,
                seaAccess: geoByte & 0x3,
              };
              gridState.setCell(gx, gy, cell);
            }
          }
        }
      }
    } finally {
      this.isLoading = false;
    }

    return gridState;
  }
}
