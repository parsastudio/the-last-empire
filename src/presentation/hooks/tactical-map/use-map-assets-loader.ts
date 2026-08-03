import { useState, useEffect, useRef } from "react";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import { FinalStateLoader } from "@/infrastructure/storage/final-state-loader";

export function useMapAssetsLoader() {
  const [countries] = useState<CountryMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  const maskDataRef = useRef<Uint8Array | null>(null);
  const packed1024Ref = useRef<Uint8Array | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAssets() {
      try {
        setLoading(true);
        const bitBuffer = await FinalStateLoader.loadLiveStateBuffer("map1");
        if (bitBuffer && active) {
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    }

    loadAssets();

    return () => {
      active = false;
    };
  }, []);

  return {
    countries,
    loading,
    error,
    maskDataRef,
    packed1024Ref,
  };
}
