import { MapShader } from "@/infrastructure/map-preprocessing/map-shader";
import { TacticalMapProfiler } from "@/presentation/utils/tactical-map-profiler";

export interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
}

export class MaskRenderingHelper {
  private persistentImageData: ImageData | null = null;

  public renderMask(
    mapWidth: number,
    mapHeight: number,
    canvasShaded: HTMLCanvasElement,
    countriesData: CountryMapping[],
    maskDataRef: { current: Uint8Array | null },
    activeLayer: "political" | "gdp" = "political",
  ): void {
    if (!maskDataRef.current) return;

    TacticalMapProfiler.start();

    if (canvasShaded.width !== mapWidth || canvasShaded.height !== mapHeight) {
      canvasShaded.width = mapWidth;
      canvasShaded.height = mapHeight;
      this.persistentImageData = null;
    }

    const ctxShaded = canvasShaded.getContext("2d");

    if (ctxShaded) {
      ctxShaded.imageSmoothingEnabled = true;

      if (!this.persistentImageData) {
        this.persistentImageData = ctxShaded.createImageData(
          mapWidth,
          mapHeight,
        );
      }

      MapShader.applyShading(
        this.persistentImageData.data,
        mapWidth,
        mapHeight,
        maskDataRef.current,
        countriesData,
        activeLayer,
      );

      TacticalMapProfiler.markSub("6.ImageDataUpload");
      ctxShaded.putImageData(this.persistentImageData, 0, 0);
    }

    TacticalMapProfiler.end("Map Layer Shading", `Layer: ${activeLayer}`);
  }
}
