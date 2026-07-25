import { useState, useEffect, useRef } from "react";
import { MapShader } from "../engine/map-shader";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
  areaSqKm?: number;
}

interface UseMapDataProps {
  mapWidth: number;
  mapHeight: number;
}

export function useMapData({ mapWidth, mapHeight }: UseMapDataProps) {
  const [countries, setCountries] = useState<CountryMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCached, setIsCached] = useState(false);

  const canvasSrcRef = useRef<HTMLCanvasElement | null>(null);
  const canvasShadedRef = useRef<HTMLCanvasElement | null>(null);
  const maskDataRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    async function fetchMapAndProcess() {
      try {
        const res = await fetch("/api/map-test6");
        const json = await res.json();
        if (!json.success) {
          setError(json.error || "Failed to load map data.");
          setLoading(false);
          return;
        }

        setCountries(json.data.countries);
        setIsCached(!!json.cached);

        const img = new Image();
        img.src = "/test6/world-mask.png";
        img.onload = () => {
          if (typeof window === "undefined") return;

          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = mapWidth;
          tempCanvas.height = mapHeight;

          const tempCtx = tempCanvas.getContext("2d");
          if (tempCtx) {
            tempCtx.drawImage(img, 0, 0);
            const imgData = tempCtx.getImageData(0, 0, mapWidth, mapHeight);
            const raw = new Uint8Array(mapWidth * mapHeight);
            for (let i = 0; i < raw.length; i++) {
              raw[i] = imgData.data[i * 4 + 2] || 0;
            }
            maskDataRef.current = raw;
          }

          if (!canvasSrcRef.current) {
            canvasSrcRef.current = document.createElement("canvas");
          }
          if (!canvasShadedRef.current) {
            canvasShadedRef.current = document.createElement("canvas");
          }

          const canvasSrc = canvasSrcRef.current;
          const canvasShaded = canvasShadedRef.current;

          canvasSrc.width = mapWidth;
          canvasSrc.height = mapHeight;
          canvasShaded.width = mapWidth;
          canvasShaded.height = mapHeight;

          const ctxSrc = canvasSrc.getContext("2d");
          const ctxShaded = canvasShaded.getContext("2d");

          if (ctxSrc && ctxShaded && maskDataRef.current) {
            ctxSrc.imageSmoothingEnabled = false;
            ctxShaded.imageSmoothingEnabled = true;
            ctxSrc.drawImage(img, 0, 0, mapWidth, mapHeight);

            const srcData = ctxSrc.getImageData(0, 0, mapWidth, mapHeight).data;
            const destImage = ctxShaded.createImageData(mapWidth, mapHeight);

            MapShader.applyShading(
              srcData,
              destImage.data,
              mapWidth,
              mapHeight,
              maskDataRef.current,
              json.data.countries,
            );

            ctxShaded.putImageData(destImage, 0, 0);
          }
          setLoading(false);
        };
      } catch {
        setError("Error fetching map test 6 metadata.");
        setLoading(false);
      }
    }

    fetchMapAndProcess();
  }, [mapWidth, mapHeight]);

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
