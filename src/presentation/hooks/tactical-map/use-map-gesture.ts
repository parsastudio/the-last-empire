import { useRef, useCallback, useEffect, RefObject } from "react";
import { MAP_CONFIG } from "@/domain/map/map.config";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";
import { useMapZoom } from "@/presentation/hooks/tactical-map/gestures/use-map-zoom";
import { useMapPan } from "@/presentation/hooks/tactical-map/gestures/use-map-pan";

export function useMapGesture(
  containerWidth = 1200,
  containerHeight = 600,
  mapWidth: number = MAP_CONFIG.HIGH_RES_WIDTH,
  mapHeight: number = MAP_CONFIG.HIGH_RES_HEIGHT,
  containerRef?: RefObject<HTMLDivElement | null>,
  externalPositionRef?: RefObject<CameraPosition>,
  externalScaleRef?: RefObject<number>,
  onDragStart?: () => void,
) {
  const computeInitial = useCallback(
    (w: number, h: number) => {
      if (w <= 0 || h <= 0) {
        return { scale: 0.5, pos: { x: 0, y: 0 } };
      }
      const scaleX = w / mapWidth;
      const scaleY = h / mapHeight;
      const fitScale = Math.min(scaleX, scaleY);
      const initialX = (w - mapWidth * fitScale) / 2;
      const initialY = (h - mapHeight * fitScale) / 2;
      return { scale: fitScale, pos: { x: initialX, y: initialY } };
    },
    [mapWidth, mapHeight],
  );

  const initial = computeInitial(containerWidth, containerHeight);

  const fallbackPositionRef = useRef<CameraPosition>(initial.pos);
  const fallbackScaleRef = useRef<number>(initial.scale);
  const lastDimensionsRef = useRef({ w: containerWidth, h: containerHeight });

  useEffect(() => {
    if (
      containerWidth > 0 &&
      containerHeight > 0 &&
      (lastDimensionsRef.current.w !== containerWidth ||
        lastDimensionsRef.current.h !== containerHeight)
    ) {
      lastDimensionsRef.current = { w: containerWidth, h: containerHeight };
      const { scale: fitScale, pos } = computeInitial(
        containerWidth,
        containerHeight,
      );

      if (externalScaleRef) {
        externalScaleRef.current = fitScale;
      } else {
        fallbackScaleRef.current = fitScale;
      }

      if (externalPositionRef) {
        externalPositionRef.current = pos;
      } else {
        fallbackPositionRef.current = pos;
      }
    }
  }, [
    containerWidth,
    containerHeight,
    computeInitial,
    externalPositionRef,
    externalScaleRef,
  ]);

  const { handleWheel } = useMapZoom({
    containerRef,
    externalPositionRef,
    externalScaleRef,
    fallbackPositionRef,
    fallbackScaleRef,
  });

  const {
    isDraggingRef,
    hasDraggedRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useMapPan({
    externalPositionRef,
    fallbackPositionRef,
    onDragStart,
  });

  const positionRef = externalPositionRef ?? fallbackPositionRef;
  const scaleRef = externalScaleRef ?? fallbackScaleRef;

  return {
    positionRef,
    scaleRef,
    isDraggingRef,
    hasDraggedRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
