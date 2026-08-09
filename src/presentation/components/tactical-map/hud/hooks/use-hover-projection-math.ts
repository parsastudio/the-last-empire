import { RefObject, useCallback } from "react";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";

interface UseHoverProjectionMathProps {
  containerRef: RefObject<HTMLDivElement | null>;
  mapWidth: number;
  mapHeight: number;
  scale: number;
  position: { x: number; y: number };
}

export interface MapProjectionResult {
  mapX: number;
  mapY: number;

  provinceId: number;
}

export function useHoverProjectionMath({
  containerRef,
  mapWidth,
  mapHeight,
  scale,
  position,
}: UseHoverProjectionMathProps) {
  const projectCoordinates = useCallback(
    (clientX: number, clientY: number): MapProjectionResult | null => {
      const container = containerRef.current;
      if (!container) return null;

      const rect = container.getBoundingClientRect();
      const relativeX = clientX - rect.left;
      const relativeY = clientY - rect.top;

      const fx = mapWidth / rect.width;
      const fy = mapHeight / rect.height;

      const mapX = Math.floor(((relativeX - position.x) / scale) * fx);
      const mapY = Math.floor(((relativeY - position.y) / scale) * fy);

      if (mapX < 0 || mapX >= mapWidth || mapY < 0 || mapY >= mapHeight) {
        return null;
      }

      const buffer = BitPackedGridState.getInstance().getBuffer();
      const provinceId = buffer.getPixel(mapX, mapY);

      if (provinceId <= 0) {
        return null;
      }

      return { mapX, mapY, provinceId };
    },
    [containerRef, mapWidth, mapHeight, scale, position],
  );

  return { projectCoordinates };
}
