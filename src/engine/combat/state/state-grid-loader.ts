import { GridState } from "@/engine/combat/state/grid-state";
import { MapDataProvider } from "@/engine/combat/state/map-data-provider";
import { GridDownsampler } from "@/application/map-rendering/grid-downsampler";
import { SpatialBufferEngine } from "@/engine/combat/state/spatial-buffer-engine";

export class StateGridLoader {
  private dataProvider = new MapDataProvider();
  private downsampler = new GridDownsampler();

  public async initializeDefaultGrid(gridState: GridState): Promise<boolean> {
    const packedBuffer = await this.dataProvider.load1024PackedBuffer();
    if (packedBuffer) {
      const engine = new SpatialBufferEngine(packedBuffer);
      const loadedGrid = engine.parseToGridState();
      const cells = loadedGrid.getAllCells();

      gridState.clear();
      for (const cell of cells) {
        gridState.setCell(cell.x, cell.y, cell);
      }
      return true;
    }

    const buffer = await this.dataProvider.loadRawMaskBuffer();
    if (!buffer) {
      return false;
    }

    const downsampled = this.downsampler.downsampleMask(buffer, 4096, 2048, 4);
    const cells = downsampled.getAllCells();

    gridState.clear();
    for (const cell of cells) {
      gridState.setCell(cell.x, cell.y, cell);
    }

    return true;
  }
}
