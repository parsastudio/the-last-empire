import { useEffect, useRef, useCallback, useState } from "react";
import { GridDownsampler } from "@/infrastructure/map-preprocessing/grid-downsampler";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { useMapAssetsLoader } from "@/presentation/hooks/tactical-map/use-map-assets-loader";
import { MapShader } from "@/infrastructure/map-preprocessing/map-shader";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";

export interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
}

export class MapDataApiHelper {
  public getManifestUrl(): string {
    return "/api/map-preprocessing/manifest";
  }

  public getMask4KUrl(): string {
    return MapPathResolver.getMapClientUrl("map1", "mask-4k.bin");
  }

  public getMask1024Url(): string {
    return MapPathResolver.getMapClientUrl("map1", "mask-1024.bin");
  }
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

interface UseMapDataProps {
  mapWidth: number;
  mapHeight: number;
  activeLayer?: "political" | "gdp";
}

const apiHelper = new MapDataApiHelper();
const renderingHelper = new MaskRenderingHelper();

export function useMapData({
  mapWidth,
  mapHeight,
  activeLayer = "political",
}: UseMapDataProps) {
  const canvasShadedRef = useRef<HTMLCanvasElement | null>(null);
  const hasDownsampledRef = useRef<boolean>(false);
  const [isLayerRendering, setIsLayerRendering] = useState<boolean>(false);
  const [renderVersion, setRenderVersion] = useState<number>(0);

  const { countries, loading, error, maskDataRef, packed1024Ref } =
    useMapAssetsLoader({ apiHelper });

  const reRenderLayer = useCallback(() => {
    if (canvasShadedRef.current && countries.length > 0) {
      setIsLayerRendering(true);

      setTimeout(() => {
        requestAnimationFrame(() => {
          if (canvasShadedRef.current) {
            renderingHelper.renderMask(
              mapWidth,
              mapHeight,
              canvasShadedRef.current,
              countries,
              maskDataRef,
              activeLayer,
            );
            setRenderVersion((v) => v + 1);
          }
          setIsLayerRendering(false);
        });
      }, 16);
    }
  }, [activeLayer, countries, mapHeight, mapWidth, maskDataRef]);

  useEffect(() => {
    if (!loading && maskDataRef.current && !hasDownsampledRef.current) {
      hasDownsampledRef.current = true;

      if (!canvasShadedRef.current) {
        canvasShadedRef.current = document.createElement("canvas");
      }

      const downsampler = new GridDownsampler();
      const localGridState = downsampler.downsampleMask(
        maskDataRef.current,
        mapWidth,
        mapHeight,
        4,
      );
      const globalGridState = GridStateProvider.getInstance();
      globalGridState.clear();
      for (const cell of localGridState.getAllCells()) {
        globalGridState.setCell(cell.x, cell.y, cell);
      }
    }
  }, [loading, mapWidth, mapHeight, maskDataRef]);

  useEffect(() => {
    if (!loading && maskDataRef.current) {
      reRenderLayer();
    }
  }, [loading, maskDataRef, reRenderLayer]);

  return {
    countries,
    loading,
    error,
    isLayerRendering,
    renderVersion,
    canvasShadedRef,
    maskDataRef,
    packed1024Ref,
    reRenderLayer,
  };
}
