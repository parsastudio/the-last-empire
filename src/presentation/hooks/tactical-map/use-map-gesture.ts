import { useRef, useCallback, useEffect, RefObject } from "react";
import { MAP_CONFIG } from "@/domain/map/map.config";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";

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
      return {
        scale: fitScale,
        pos: {
          x: (w - mapWidth * fitScale) / 2,
          y: (h - mapHeight * fitScale) / 2,
        },
      };
    },
    [mapWidth, mapHeight],
  );

  const initial = computeInitial(containerWidth, containerHeight);
  const fallbackPositionRef = useRef<CameraPosition>(initial.pos);
  const fallbackScaleRef = useRef<number>(initial.scale);
  const lastDimensionsRef = useRef({ w: containerWidth, h: containerHeight });

  const positionRef = externalPositionRef ?? fallbackPositionRef;
  const scaleRef = externalScaleRef ?? fallbackScaleRef;

  const isDraggingRef = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);
  const dragStart = useRef<CameraPosition>({ x: 0, y: 0 });
  const mouseDownPos = useRef<CameraPosition>({ x: 0, y: 0 });

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
      scaleRef.current = fitScale;
      positionRef.current = pos;
    }
  }, [containerWidth, containerHeight, computeInitial, scaleRef, positionRef]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 50);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("blur", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("blur", handleGlobalMouseUp);
    };
  }, []);

  const calculateZoom = useCallback(
    (deltaY: number, rect: DOMRect, clientX: number, clientY: number) => {
      const mx = clientX - rect.left;
      const my = clientY - rect.top;
      const currentScale = scaleRef.current || 1;
      const currentPos = positionRef.current || { x: 0, y: 0 };

      const zoomFactor = deltaY < 0 ? 1.15 : 0.85;
      const nextScale = Math.max(
        0.05,
        Math.min(35.0, currentScale * zoomFactor),
      );

      if (nextScale === currentScale) return;

      const nextPosition = {
        x: mx - (mx - currentPos.x) * (nextScale / currentScale),
        y: my - (my - currentPos.y) * (nextScale / currentScale),
      };

      scaleRef.current = nextScale;
      positionRef.current = nextPosition;
    },
    [scaleRef, positionRef],
  );

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      calculateZoom(e.deltaY, rect, e.clientX, e.clientY);
    };

    container.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onNativeWheel);
    };
  }, [containerRef, calculateZoom]);

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      calculateZoom(e.deltaY, rect, e.clientX, e.clientY);
    },
    [calculateZoom],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      mouseDownPos.current = { x: e.clientX, y: e.clientY };

      const currentPos = positionRef.current || { x: 0, y: 0 };
      dragStart.current = {
        x: e.clientX - currentPos.x,
        y: e.clientY - currentPos.y,
      };
    },
    [positionRef],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      const dist = Math.hypot(
        e.clientX - mouseDownPos.current.x,
        e.clientY - mouseDownPos.current.y,
      );
      if (dist > 5) {
        if (!hasDraggedRef.current && onDragStart) {
          onDragStart();
        }
        hasDraggedRef.current = true;
      }

      positionRef.current = {
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      };
    },
    [positionRef, onDragStart],
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 50);
  }, []);

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
