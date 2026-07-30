import { RefObject, useCallback } from "react";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";

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

      let nationIdNumber = 0;
      let greenChannelVal = 0;

      const gx = Math.floor((mapX / mapWidth) * 1024);
      const gy = Math.floor((mapY / mapHeight) * 512);

      const gridState = GridStateProvider.getInstance();
      const dynamicCell = gridState.getCell(gx, gy);

      if (dynamicCell && dynamicCell.ownerId.startsWith("NATION_")) {
        const parsedId = parseInt(
          dynamicCell.ownerId.replace("NATION_", ""),
          10,
        );
        if (!isNaN(parsedId) && parsedId >= 11) {
          nationIdNumber = parsedId;
          greenChannelVal = dynamicCell.enclaveId;
        }
      }

      if (
        !nationIdNumber &&
        packed1024Ref?.current &&
        packed1024Ref.current.length === 1024 * 512 * 2
      ) {
        const pIdx = (gy * 1024 + gx) * 2;
        const geoByte = packed1024Ref.current[pIdx] || 0;
        nationIdNumber = packed1024Ref.current[pIdx + 1] || 0;
        greenChannelVal = geoByte >> 2;
      }

      if (
        (!nationIdNumber || nationIdNumber < 11) &&
        maskDataRef?.current &&
        maskDataRef.current.length === mapWidth * mapHeight
      ) {
        const pixelIndex = mapY * mapWidth + mapX;
        nationIdNumber = maskDataRef.current[pixelIndex] || 0;
      }

      if (!nationIdNumber || nationIdNumber < 11 || nationIdNumber >= 250) {
        return null;
      }

      return { mapX, mapY, nationIdNumber, greenChannelVal };
    },
    [
      containerRef,
      maskDataRef,
      packed1024Ref,
      mapWidth,
      mapHeight,
      scale,
      position,
    ],
  );

  return { projectCoordinates };
}
