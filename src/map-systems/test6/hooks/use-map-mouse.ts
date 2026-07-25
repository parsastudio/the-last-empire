import { useState, useCallback } from "react";

interface CountryMapping {
  id: number;
  code: string;
  name: string;
  color: [number, number, number];
}

interface UseMapMouseProps {
  canvasDestRef: React.RefObject<HTMLCanvasElement | null>;
  maskDataRef: React.RefObject<Uint8Array | null>;
  countries: CountryMapping[];
  position: { x: number; y: number };
  scale: number;
  mapWidth: number;
  mapHeight: number;
}

export function useMapMouse({
  canvasDestRef,
  maskDataRef,
  countries,
  position,
  scale,
  mapWidth,
  mapHeight,
}: UseMapMouseProps) {
  const [hoveredCountry, setHoveredCountry] = useState<CountryMapping | null>(
    null,
  );

  const handlePointerMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const canvasDest = canvasDestRef.current;
      const maskData = maskDataRef.current;
      if (!canvasDest || !maskData) return;

      const rect = canvasDest.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      const fx = mapWidth / rect.width;
      const fy = mapHeight / rect.height;

      const mapX = Math.floor(((clientX - position.x) / scale) * fx);
      const mapY = Math.floor(((clientY - position.y) / scale) * fy);

      if (mapX >= 0 && mapX < mapWidth && mapY >= 0 && mapY < mapHeight) {
        const id = maskData[mapY * mapWidth + mapX];
        if (id !== undefined && id >= 11) {
          const matched = countries.find((c) => c.id === id);
          if (matched) {
            setHoveredCountry(matched);
            return;
          }
        }
      }
      setHoveredCountry(null);
    },
    [
      canvasDestRef,
      maskDataRef,
      countries,
      position,
      scale,
      mapWidth,
      mapHeight,
    ],
  );

  return {
    hoveredCountry,
    handlePointerMove,
    setHoveredCountry,
  };
}
