import { useState, useEffect, useRef } from "react";
import { MapDataApiHelper } from "./map-data-api-helper";
import { CountryMapping } from "./mask-rendering-helper";
import { MapPathResolver } from "@/application/map-rendering/map-path-resolver";

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

        try {
          await fetch(`/api/map-preprocessing/manifest?mode=${mapMode}`);
        } catch {}

        let apiPath = apiHelper.getApiPath(mapMode);
        let res = await fetch(apiPath);

        if (!res.ok) {
          apiPath = MapPathResolver.getMapClientUrl(
            "map1",
            "default",
            "default-mappings.json",
          );
          res = await fetch(apiPath);
        }

        const json = await res.json();
        if (!active) return;

        let countriesData: CountryMapping[] = [];
        let cachedStatus = false;

        if (json.countries) {
          countriesData = json.countries;
          cachedStatus = true;
        } else if (json.data && json.data.countries) {
          countriesData = json.data.countries;
          cachedStatus = !!json.cached;
        } else if (json.nations) {
          countriesData = json.nations.map(
            (n: {
              numericId: number;
              code: string;
              nameFa: string;
              territorySize: number;
            }) => ({
              id: n.numericId,
              code: n.code,
              name: n.nameFa,
              color: [0, 0, n.numericId],
              areaSqKm: n.territorySize,
            }),
          );
          cachedStatus = true;
        }

        setCountries(countriesData);
        setIsCached(cachedStatus);

        const binFileName =
          mapMode === "partition"
            ? "partition-mask-1024.bin"
            : mapMode === "edited"
              ? "edited-mask-1024.bin"
              : "default-mask-1024.bin";

        let binPath = MapPathResolver.getMapClientUrl(
          "map1",
          mapMode,
          binFileName,
        );

        try {
          let binRes = await fetch(binPath);
          if (!binRes.ok) {
            binPath = MapPathResolver.getMapClientUrl(
              "map1",
              "default",
              "default-mask-1024.bin",
            );
            binRes = await fetch(binPath);
          }
          if (binRes.ok) {
            const arrayBuf = await binRes.arrayBuffer();
            packed1024Ref.current = new Uint8Array(arrayBuf);
          }
        } catch {}

        const img = new Image();
        const imgSrc = apiHelper.getImageSource(mapMode);

        img.onload = () => {
          if (typeof window === "undefined" || !active) return;
          loadedImgRef.current = img;
          setLoading(false);
        };

        img.onerror = () => {
          if (!active) return;
          const fallbackImg = new Image();
          fallbackImg.src = MapPathResolver.getMapClientUrl(
            "map1",
            "default",
            "default-mask.png",
          );
          fallbackImg.onload = () => {
            if (typeof window === "undefined" || !active) return;
            loadedImgRef.current = fallbackImg;
            setLoading(false);
          };
          fallbackImg.onerror = () => {
            if (active) {
              setError("خطا در بارگذاری تصویر نقشه");
              setLoading(false);
            }
          };
        };

        img.src = imgSrc;
      } catch {
        if (active) {
          setError("خطا در دریافت داده‌های نقشه");
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
