import { useEffect, useRef, useCallback } from "react";
import { GridDownsampler } from "@/application/map-rendering/grid-downsampler";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { MapDataApiHelper } from "./map-data-api-helper";
import { MaskRenderingHelper, CountryMapping } from "./mask-rendering-helper";
import { useMapAssetsLoader } from "./use-map-assets-loader";

export type { CountryMapping };

interface UseMapDataProps {
  mapWidth: number;
  mapHeight: number;
  mapMode?: "default" | "edited" | "partition";
  activeLayer?: "political" | "gdp" | "military";
}

const apiHelper = new MapDataApiHelper();
const renderingHelper = new MaskRenderingHelper();

export function useMapData({
  mapWidth,
  mapHeight,
  mapMode = "default",
  activeLayer = "political",
}: UseMapDataProps) {
  const canvasSrcRef = useRef<HTMLCanvasElement | null>(null);
  const canvasShadedRef = useRef<HTMLCanvasElement | null>(null);
  const maskDataRef = useRef<Uint8Array | null>(null);

  const { countries, loading, error, isCached, packed1024Ref, loadedImgRef } =
    useMapAssetsLoader({ mapMode, apiHelper });

  const reRenderLayer = useCallback(() => {
    if (
      loadedImgRef.current &&
      canvasSrcRef.current &&
      canvasShadedRef.current &&
      countries.length > 0
    ) {
      renderingHelper.renderMask(
        loadedImgRef.current,
        mapWidth,
        mapHeight,
        canvasSrcRef.current,
        canvasShadedRef.current,
        countries,
        maskDataRef,
        activeLayer,
      );
    }
  }, [activeLayer, countries, loadedImgRef, mapHeight, mapWidth]);

  const updateConqueredPixelsOnCanvas = useCallback(
    (conqueredNumericId: number, targetNumericId: number) => {
      if (!maskDataRef.current) return;
      const mask = maskDataRef.current;
      const totalPixels = mapWidth * mapHeight;

      let changedCount = 0;
      for (let i = 0; i < totalPixels; i++) {
        if (mask[i] === targetNumericId) {
          mask[i] = conqueredNumericId;
          changedCount++;
          if (changedCount >= 1200) break;
        }
      }

      if (changedCount > 0) {
        reRenderLayer();
      }
    },
    [mapHeight, mapWidth, reRenderLayer],
  );

  useEffect(() => {
    if (!loading && loadedImgRef.current) {
      if (!canvasSrcRef.current) {
        canvasSrcRef.current = document.createElement("canvas");
      }
      if (!canvasShadedRef.current) {
        canvasShadedRef.current = document.createElement("canvas");
      }

      reRenderLayer();

      if (maskDataRef.current) {
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
    }
  }, [loading, loadedImgRef, mapWidth, mapHeight, reRenderLayer]);

  return {
    countries,
    loading,
    error,
    isCached,
    canvasSrcRef,
    canvasShadedRef,
    maskDataRef,
    packed1024Ref,
    reRenderLayer,
    updateConqueredPixelsOnCanvas,
  };
}
