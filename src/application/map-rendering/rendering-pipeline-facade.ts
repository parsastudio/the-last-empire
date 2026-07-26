import { GridCell } from "@/domain/map/grid-cell.schema";
import { EnclaveOverlayShader } from "./enclave-overlay-shader";
import { ConquestShadingEffects } from "./conquest-shading-effects";
import { GdpHeatmapShader } from "./gdp-heatmap-shader";

export class RenderingPipelineFacade {
  private enclaveShader = new EnclaveOverlayShader();
  private conquestShader = new ConquestShadingEffects();
  private gdpShader = new GdpHeatmapShader();

  public compositeFinalMap(
    destData: Uint8ClampedArray,
    width: number,
    height: number,
    cells: GridCell[],
    scaleFactor = 4,
    showHeatmap = false,
  ): void {
    this.enclaveShader.applyEnclaveOverlay(
      destData,
      width,
      height,
      cells,
      scaleFactor,
    );
    this.conquestShader.applySiegeEffects(
      destData,
      width,
      height,
      cells,
      scaleFactor,
    );

    if (showHeatmap) {
      this.gdpShader.applyHeatmapOverlay(
        destData,
        width,
        height,
        cells,
        scaleFactor,
      );
    }
  }
}
