import { useEffect, useRef, useCallback } from "react";
import { GridDownsampler } from "@/infrastructure/map-preprocessing/grid-downsampler";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { DirtyBoundingBox } from "@/infrastructure/map-preprocessing/shader/dirty-region-patch-engine";
import { MapDataApiHelper } from "./map-data-api-helper";
import { MaskRenderingHelper, CountryMapping } from "./mask-rendering-helper";
import { useMapAssetsLoader } from "./use-map-assets-loader";

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

  const { countries, loading, error, maskDataRef, packed1024Ref } =
    useMapAssetsLoader({ apiHelper });

  const reRenderLayer = useCallback(() => {
    if (canvasShadedRef.current && countries.length > 0) {
      renderingHelper.renderMask(
        mapWidth,
        mapHeight,
        canvasShadedRef.current,
        countries,
        maskDataRef,
        activeLayer,
      );
    }
  }, [activeLayer, countries, mapHeight, mapWidth, maskDataRef]);

  const patchDirtyRegion = useCallback(
    (dirtyBox: DirtyBoundingBox, dynamicIds?: Uint16Array | null) => {
      if (canvasShadedRef.current && countries.length > 0) {
        renderingHelper.patchMaskRegion(
          mapWidth,
          mapHeight,
          canvasShadedRef.current,
          countries,
          maskDataRef,
          dirtyBox,
          dynamicIds,
          activeLayer,
        );
      }
    },
    [activeLayer, countries, mapHeight, mapWidth, maskDataRef],
  );

  useEffect(() => {
    if (!loading && maskDataRef.current) {
      if (!canvasShadedRef.current) {
        canvasShadedRef.current = document.createElement("canvas");
      }

      reRenderLayer();

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
  }, [loading, mapWidth, mapHeight, maskDataRef, reRenderLayer]);

  return {
    countries,
    loading,
    error,
    canvasShadedRef,
    maskDataRef,
    packed1024Ref,
    reRenderLayer,
    patchDirtyRegion,
  };
}
