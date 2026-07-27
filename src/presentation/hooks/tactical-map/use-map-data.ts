import { useState, useEffect, useRef } from "react";
import { GridDownsampler } from "@/application/map-rendering/grid-downsampler";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { MapDataApiHelper } from "./map-data-api-helper";
import { MaskRenderingHelper, CountryMapping } from "./mask-rendering-helper";

export type { CountryMapping };

interface UseMapDataProps {
  mapWidth: number;
  mapHeight: number;
  mapMode?: "default" | "edited" | "partition";
}

export function useMapData({
  mapWidth,
  mapHeight,
  mapMode = "default",
}: UseMapDataProps) {
  const [countries, setCountries] = useState<CountryMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const canvasSrcRef = useRef<HTMLCanvasElement | null>(null);
  const canvasShadedRef = useRef<HTMLCanvasElement | null>(null);
  const maskDataRef = useRef<Uint8Array | null>(null);

  const apiHelper = new MapDataApiHelper();
  const renderingHelper = new MaskRenderingHelper();

  useEffect(() => {
    let active = true;
    async function fetchMapAndProcess() {
      try {
        const apiPath = apiHelper.getApiPath(mapMode);
        const res = await fetch(apiPath);
        const json = await res.json();
        if (!active) return;

        let countriesData: CountryMapping[] = [];
        let cachedStatus = false;

        if (mapMode === "partition") {
          countriesData = json.countries || [];
          cachedStatus = true;
        } else {
          if (!json.success) {
            setError(json.error || "Failed to load map data.");
            setLoading(false);
            return;
          }
          countriesData = json.data.countries || [];
          cachedStatus = !!json.cached;
        }

        setCountries(countriesData);
        setIsCached(cachedStatus);

        const img = new Image();
        img.src = apiHelper.getImageSource(mapMode);

        img.onload = () => {
          if (typeof window === "undefined" || !active) return;

          if (!canvasSrcRef.current) {
            canvasSrcRef.current = document.createElement("canvas");
          }
          if (!canvasShadedRef.current) {
            canvasShadedRef.current = document.createElement("canvas");
          }

          renderingHelper.renderMask(
            img,
            mapWidth,
            mapHeight,
            canvasSrcRef.current,
            canvasShadedRef.current,
            countriesData,
            maskDataRef,
          );

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

          setLoading(false);
        };
      } catch {
        if (active) {
          setError("Error fetching map metadata.");
          setLoading(false);
        }
      }
    }

    fetchMapAndProcess();
    return () => {
      active = false;
    };
  }, [mapWidth, mapHeight, mapMode]);

  return {
    countries,
    loading,
    error,
    isCached,
    canvasSrcRef,
    canvasShadedRef,
    maskDataRef,
  };
}
