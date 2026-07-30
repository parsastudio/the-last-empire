import { MapShader } from "@/infrastructure/map-preprocessing/map-shader";
import {
  DirtyRegionPatchEngine,
  DirtyBoundingBox,
} from "@/infrastructure/map-preprocessing/shader/dirty-region-patch-engine";

export interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
}

export class MaskRenderingHelper {
  private patchEngine = new DirtyRegionPatchEngine();

  public renderMask(
    mapWidth: number,
    mapHeight: number,
    canvasShaded: HTMLCanvasElement,
    countriesData: CountryMapping[],
    maskDataRef: { current: Uint8Array | null },
    activeLayer: "political" | "gdp" = "political",
  ): void {
    if (!maskDataRef.current) return;

    canvasShaded.width = mapWidth;
    canvasShaded.height = mapHeight;

    const ctxShaded = canvasShaded.getContext("2d");

    if (ctxShaded) {
      ctxShaded.imageSmoothingEnabled = true;
      const destImage = ctxShaded.createImageData(mapWidth, mapHeight);

      MapShader.applyShading(
        destImage.data,
        mapWidth,
        mapHeight,
        maskDataRef.current,
        countriesData,
        activeLayer,
      );

      ctxShaded.putImageData(destImage, 0, 0);
    }
  }

  public patchMaskRegion(
    mapWidth: number,
    mapHeight: number,
    canvasShaded: HTMLCanvasElement,
    countriesData: CountryMapping[],
    maskDataRef: { current: Uint8Array | null },
    dirtyBox: DirtyBoundingBox,
    dynamicIds?: Uint16Array | null,
    activeLayer: "political" | "gdp" = "political",
  ): void {
    if (!maskDataRef.current) return;

    this.patchEngine.patchCanvasRegion(
      canvasShaded,
      mapWidth,
      mapHeight,
      maskDataRef.current,
      countriesData,
      dirtyBox,
      dynamicIds,
      activeLayer,
    );
  }
}
