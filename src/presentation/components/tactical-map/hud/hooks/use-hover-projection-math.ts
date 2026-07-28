import { RefObject } from "react";

interface UseHoverProjectionMathProps {
  containerRef: RefObject<HTMLDivElement | null>;
  maskDataRef: RefObject<Uint8Array | null>;
  packed1024Ref?: RefObject<Uint8Array | null>;
  mapWidth: number;
  mapHeight: number;
  scale: number;
  position: { x: number; y: number };
}

export interface MapProjectionResult {
  mapX: number;
  mapY: number;
  nationIdNumber: number;
  greenChannelVal: number;
}

export function useHoverProjectionMath({
  containerRef,
  maskDataRef,
  packed1024Ref,
  mapWidth,
  mapHeight,
  scale,
  position,
}: UseHoverProjectionMathProps) {
  const projectCoordinates = (
    clientX: number,
    clientY: number,
  ): MapProjectionResult | null => {
    const container = containerRef.current;
    if (!container || !maskDataRef.current) return null;

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

    const pixelIndex = mapY * mapWidth + mapX;
    const nationIdNumber = maskDataRef.current[pixelIndex] || 0;

    if (!nationIdNumber || nationIdNumber < 11 || nationIdNumber >= 250) {
      return null;
    }

    let greenChannelVal = 0;
    if (
      packed1024Ref?.current &&
      packed1024Ref.current.length === 1024 * 512 * 2
    ) {
      const gx = Math.floor((mapX / mapWidth) * 1024);
      const gy = Math.floor((mapY / mapHeight) * 512);
      const pIdx = (gy * 1024 + gx) * 2;
      const geoByte = packed1024Ref.current[pIdx] || 0;
      greenChannelVal = geoByte >> 2;
    }

    return { mapX, mapY, nationIdNumber, greenChannelVal };
  };

  return { projectCoordinates };
}
