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

    TacticalMapProfiler.end("Map Layer Shading", `Layer: ${activeLayer}`);
  }
}
