import { MapShader } from "@/infrastructure/map-preprocessing/map-shader";
import {
  DirtyRegionPatchEngine,
  DirtyBoundingBox,
} from "@/infrastructure/map-preprocessing/shader/dirty-region-patch-engine";
import { FastPaletteSwapEngine } from "@/infrastructure/map-preprocessing/shader/fast-palette-swap-engine";

export interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
}

export class MaskRenderingHelper {
  private patchEngine = new DirtyRegionPatchEngine();
  private paletteSwapEngine = new FastPaletteSwapEngine();

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

  public swapLayerPaletteFast(
    mapWidth: number,
    mapHeight: number,
    canvasShaded: HTMLCanvasElement,
    countriesData: CountryMapping[],
    maskDataRef: { current: Uint8Array | null },
    activeLayer: "political" | "gdp",
    dynamicIds?: Uint16Array | null,
  ): void {
    if (!maskDataRef.current) return;

    this.paletteSwapEngine.swapLayerPalette(
      canvasShaded,
      mapWidth,
      mapHeight,
      maskDataRef.current,
      countriesData,
      activeLayer,
      dynamicIds,
    );
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
