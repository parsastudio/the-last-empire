import { useState, useEffect, useRef } from "react";
import { MapDataApiHelper } from "./map-data-api-helper";
import { CountryMapping } from "./mask-rendering-helper";
import { StaticMapCacheBuilder } from "@/infrastructure/map-preprocessing/shader/static-map-cache-builder";

interface UseMapAssetsLoaderProps {
  apiHelper: MapDataApiHelper;
}

export function useMapAssetsLoader({ apiHelper }: UseMapAssetsLoaderProps) {
  const [countries, setCountries] = useState<CountryMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const maskDataRef = useRef<Uint8Array | null>(null);
  const packed1024Ref = useRef<Uint8Array | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAssets() {
      try {
        setLoading(true);

        const manifestUrl = apiHelper.getManifestUrl();
        const manifestRes = await fetch(manifestUrl);

        const json = await manifestRes.json();
        if (!active) return;

        let countriesData: CountryMapping[] = [];

        if (json.countries) {
          countriesData = json.countries;
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
        }

        setCountries(countriesData);

        const mask1024Url = apiHelper.getMask1024Url();
        try {
          const binRes = await fetch(mask1024Url);
          if (binRes.ok) {
            const arrayBuf = await binRes.arrayBuffer();
            packed1024Ref.current = new Uint8Array(arrayBuf);
          }
        } catch {}

        const mask4KUrl = apiHelper.getMask4KUrl();
        const mask4KRes = await fetch(mask4KUrl);

        if (mask4KRes.ok) {
          const raw4KBuf = await mask4KRes.arrayBuffer();
          maskDataRef.current = new Uint8Array(raw4KBuf);

          const staticCacheBuilder = new StaticMapCacheBuilder();
          staticCacheBuilder.buildOrGetCache(maskDataRef.current, 4096, 2048);

          if (active) {
            setLoading(false);
          }
        } else {
          if (active) {
            setError("خطا در بارگذاری دیتای نقشه");
            setLoading(false);
          }
        }
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
  }, [apiHelper]);

  return {
    countries,
    loading,
    error,
    maskDataRef,
    packed1024Ref,
  };
}
