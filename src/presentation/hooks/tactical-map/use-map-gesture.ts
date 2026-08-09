import { useRef, useCallback, useEffect, RefObject } from "react";
import { MAP_CONFIG } from "@/domain/map/map.config";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";

export function useMapGesture(
  containerWidth = 1200,
  containerHeight = 600,
  mapWidth: number = MAP_CONFIG.HIGH_RES_WIDTH,
  mapHeight: number = MAP_CONFIG.HIGH_RES_HEIGHT,
  containerRef?: RefObject<HTMLDivElement | null>,
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

  const positionRef = useRef<CameraPosition>(initial.pos);
  const scaleRef = useRef<number>(initial.scale);
  const isDraggingRef = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);

  const dragStart = useRef<CameraPosition>({ x: 0, y: 0 });
  const mouseDownPos = useRef<CameraPosition>({ x: 0, y: 0 });
  const lastDimensionsRef = useRef({ w: containerWidth, h: containerHeight });

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("blur", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("blur", handleGlobalMouseUp);
    };
  }, []);

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
  }, [containerWidth, containerHeight, computeInitial]);

  const calculateZoom = (
    deltaY: number,
    rect: DOMRect,
    clientX: number,
    clientY: number,
  ) => {
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const currentScale = scaleRef.current;
    const currentPos = positionRef.current;

    const zoomFactor = deltaY < 0 ? 1.15 : 0.85;
    const minAllowedScale = 0.05;
    const maxAllowedScale = 35.0;

    const nextScale = Math.max(
      minAllowedScale,
      Math.min(maxAllowedScale, currentScale * zoomFactor),
    );

    if (nextScale === currentScale) {
      return;
    }

    const nextPosition = {
      x: mx - (mx - currentPos.x) * (nextScale / currentScale),
      y: my - (my - currentPos.y) * (nextScale / currentScale),
    };

    scaleRef.current = nextScale;
    positionRef.current = nextPosition;
  };

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
  }, [containerRef]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    calculateZoom(e.deltaY, rect, e.clientX, e.clientY);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
    dragStart.current = {
      x: e.clientX - positionRef.current.x,
      y: e.clientY - positionRef.current.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dist = Math.hypot(
      e.clientX - mouseDownPos.current.x,
      e.clientY - mouseDownPos.current.y,
    );
    if (dist > 5) {
      hasDraggedRef.current = true;
    }
    positionRef.current = {
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const zoomIn = () => {
    scaleRef.current = Math.min(scaleRef.current * 1.25, 35);
  };

  const zoomOut = () => {
    scaleRef.current = Math.max(scaleRef.current * 0.8, 0.05);
  };

  const resetScale = () => {
    const { scale: fitScale, pos } = computeInitial(
      containerWidth,
      containerHeight,
    );
    scaleRef.current = fitScale;
    positionRef.current = pos;
  };

  return {
    positionRef,
    scaleRef,
    isDraggingRef,
    hasDraggedRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    resetScale,
  };
}
