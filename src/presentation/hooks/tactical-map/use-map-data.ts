import { useEffect, useRef, useCallback, useState } from "react";
import { ALL_COUNTRY_PROFILES } from "@/domain/data/countries";
import { FinalStateLoader } from "@/infrastructure/storage/final-state-loader";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
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
    return "/api/map-preprocessing/final-manifest";
  }

  public getMask4KUrl(): string {
    return MapPathResolver.getMapFinalClientUrl("map1", "live-state.bin");
  }

  public getMask1024Url(): string {
    return MapPathResolver.getMapFinalClientUrl("map1", "live-state.bin");
  }
}

export function useMapData() {
  const canvasShadedRef = useRef<HTMLCanvasElement | null>(null);
  const [isLayerRendering, setIsLayerRendering] = useState<boolean>(false);
  const [renderVersion, setRenderVersion] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const maskDataRef = useRef<Uint8Array | null>(null);
  const packed1024Ref = useRef<Uint8Array | null>(null);

  const countries: CountryMapping[] = ALL_COUNTRY_PROFILES.map((p) => ({
    id: p.id ?? 0,
    code: p.code,
    name: p.nameFa,
    color: [0, 0, p.id ?? 0] as [number, number, number],
  }));

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const bitBuffer = await FinalStateLoader.loadLiveStateBuffer("map1");
        if (bitBuffer && active) {
          const gridState = BitPackedGridState.getInstance();
          gridState.getBuffer().getRawBuffer().set(bitBuffer.getRawBuffer());
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const reRenderLayer = useCallback(() => {
    setIsLayerRendering(true);
    setTimeout(() => {
      setRenderVersion((v) => v + 1);
      setIsLayerRendering(false);
    }, 16);
  }, []);

  return {
    countries,
    loading,
    error: null,
    isLayerRendering,
    renderVersion,
    canvasShadedRef,
    maskDataRef,
    packed1024Ref,
    reRenderLayer,
  };
}
