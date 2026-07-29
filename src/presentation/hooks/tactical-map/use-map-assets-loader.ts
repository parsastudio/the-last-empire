import { useState, useEffect, useRef } from "react";
import { MapDataApiHelper } from "./map-data-api-helper";
import { CountryMapping } from "./mask-rendering-helper";

interface UseMapAssetsLoaderProps {
  mapMode: "default" | "edited" | "partition";
  apiHelper: MapDataApiHelper;
}

export function useMapAssetsLoader({
  mapMode,
  apiHelper,
}: UseMapAssetsLoaderProps) {
  const [countries, setCountries] = useState<CountryMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const packed1024Ref = useRef<Uint8Array | null>(null);
  const loadedImgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAssets() {
      try {
        setLoading(true);
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

        const binPath =
          mapMode === "partition"
            ? "/maps/map1/partition-mask-1024.bin"
            : mapMode === "edited"
              ? "/maps/map1/edited-mask-1024.bin"
              : "/maps/map1/default-mask-1024.bin";

        try {
          const binRes = await fetch(binPath);
          if (binRes.ok) {
            const arrayBuf = await binRes.arrayBuffer();
            packed1024Ref.current = new Uint8Array(arrayBuf);
          }
        } catch {}

        const img = new Image();
        img.src = apiHelper.getImageSource(mapMode);

        img.onload = () => {
          if (typeof window === "undefined" || !active) return;
          loadedImgRef.current = img;
          setLoading(false);
        };
      } catch {
        if (active) {
          setError("Error fetching map metadata.");
          setLoading(false);
        }
      }
    }

    loadAssets();

    return () => {
      active = false;
    };
  }, [mapMode, apiHelper]);

  return {
    countries,
    loading,
    error,
    isCached,
    packed1024Ref,
    loadedImgRef,
  };
}
