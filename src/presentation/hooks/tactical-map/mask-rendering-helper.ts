import { MapShader } from "@/infrastructure/map-preprocessing/map-shader";

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

      ctxShaded.putImageData(this.persistentImageData, 0, 0);
    }
  }
}
