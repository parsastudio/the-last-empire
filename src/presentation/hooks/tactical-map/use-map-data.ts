import { useEffect, useRef, useCallback, useState } from "react";
import { GridDownsampler } from "@/infrastructure/map-preprocessing/grid-downsampler";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { MapDataApiHelper } from "@/presentation/hooks/tactical-map/map-data-api-helper";
import {
  MaskRenderingHelper,
  CountryMapping,
} from "@/presentation/hooks/tactical-map/mask-rendering-helper";
import { useMapAssetsLoader } from "@/presentation/hooks/tactical-map/use-map-assets-loader";

export type { CountryMapping };

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
  }, [loading, reRenderLayer]);

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
