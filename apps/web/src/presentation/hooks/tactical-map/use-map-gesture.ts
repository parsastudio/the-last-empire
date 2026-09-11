import { useRef, useCallback, useEffect, RefObject } from "react";
import { MAP_CONFIG } from "@/domain/map/map.config";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";

interface WorldPoint {
  x: number;
  y: number;
}

export function useMapGesture(
  containerWidth = 1200,
  containerHeight = 600,
  mapWidth: number = MAP_CONFIG.HIGH_RES_WIDTH,
  mapHeight: number = MAP_CONFIG.HIGH_RES_HEIGHT,
  containerRef?: RefObject<HTMLDivElement | null>,
  externalPositionRef?: RefObject<CameraPosition>,
  externalScaleRef?: RefObject<number>,
  onDragStart?: () => void,
  onTransformChange?: () => void,
  onTap?: (clientX: number, clientY: number) => void,
  externalIsDraggingRef?: RefObject<boolean>,
  externalHasDraggedRef?: RefObject<boolean>,
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

  const fallbackIsDraggingRef = useRef<boolean>(false);
  const fallbackHasDraggedRef = useRef<boolean>(false);

  const isDraggingRef = externalIsDraggingRef ?? fallbackIsDraggingRef;
  const hasDraggedRef = externalHasDraggedRef ?? fallbackHasDraggedRef;

  const dragStart = useRef<CameraPosition>({ x: 0, y: 0 });
  const mouseDownPos = useRef<CameraPosition>({ x: 0, y: 0 });

  const touchStateRef = useRef<{
    mode: "NONE" | "PAN" | "PINCH";
    initialDist: number;
    initialScale: number;
    initialAnchor: WorldPoint;
    singleStartClient: CameraPosition;
    singleStartMapPos: CameraPosition;
    startTime: number;
  }>({
    mode: "NONE",
    initialDist: 0,
    initialScale: 1,
    initialAnchor: { x: 0, y: 0 },
    singleStartClient: { x: 0, y: 0 },
    singleStartMapPos: { x: 0, y: 0 },
    startTime: 0,
  });

  const minAllowedScale = 0.05;
  const maxAllowedScale = 35.0;

  const positionRef = externalPositionRef ?? fallbackPositionRef;
  const scaleRef = externalScaleRef ?? fallbackScaleRef;

  const updatePosition = useCallback(
    (nextPos: CameraPosition) => {
      if (externalPositionRef) {
        externalPositionRef.current = nextPos;
      } else {
        fallbackPositionRef.current = nextPos;
      }
      if (onTransformChange) {
        onTransformChange();
      }
    },
    [externalPositionRef, onTransformChange],
  );

  const updateScaleAndPosition = useCallback(
    (nextScale: number, nextPos: CameraPosition) => {
      if (externalScaleRef) {
        externalScaleRef.current = nextScale;
      } else {
        fallbackScaleRef.current = nextScale;
      }

      if (externalPositionRef) {
        externalPositionRef.current = nextPos;
      } else {
        fallbackPositionRef.current = nextPos;
      }

      if (onTransformChange) {
        onTransformChange();
      }
    },
    [externalPositionRef, externalScaleRef, onTransformChange],
  );

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

      updateScaleAndPosition(fitScale, pos);
    }
  }, [containerWidth, containerHeight, computeInitial, updateScaleAndPosition]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 150);
    };

    window.addEventListener("mouseup", handleGlobalMouseUp);
    window.addEventListener("blur", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
      window.removeEventListener("blur", handleGlobalMouseUp);
    };
  }, [isDraggingRef, hasDraggedRef]);

  const calculateZoom = useCallback(
    (deltaY: number, rect: DOMRect, clientX: number, clientY: number) => {
      const mx = clientX - rect.left;
      const my = clientY - rect.top;

      const currentScale = scaleRef.current;
      const currentPos = positionRef.current;

      const zoomFactor = deltaY < 0 ? 1.15 : 0.85;

      const nextScale = Math.max(
        minAllowedScale,
        Math.min(maxAllowedScale, currentScale * zoomFactor),
      );

      if (nextScale === currentScale) return;

      const nextPosition = {
        x: mx - (mx - currentPos.x) * (nextScale / currentScale),
        y: my - (my - currentPos.y) * (nextScale / currentScale),
      };

      updateScaleAndPosition(nextScale, nextPosition);
    },
    [positionRef, scaleRef, updateScaleAndPosition],
  );

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (onDragStart) {
        onDragStart();
      }

      const rect = container.getBoundingClientRect();
      calculateZoom(e.deltaY, rect, e.clientX, e.clientY);
    };

    container.addEventListener("wheel", onNativeWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", onNativeWheel);
    };
  }, [containerRef, calculateZoom, onDragStart]);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const preventGesture = (e: Event) => e.preventDefault();
    container.addEventListener("gesturestart", preventGesture);
    container.addEventListener("gesturechange", preventGesture);
    container.addEventListener("gestureend", preventGesture);

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0]!;
        isDraggingRef.current = true;
        hasDraggedRef.current = false;

        touchStateRef.current.mode = "PAN";
        touchStateRef.current.startTime = Date.now();
        touchStateRef.current.singleStartClient = {
          x: touch.clientX,
          y: touch.clientY,
        };
        touchStateRef.current.singleStartMapPos = {
          x: positionRef.current.x,
          y: positionRef.current.y,
        };
      } else if (e.touches.length >= 2) {
        if (onDragStart) {
          onDragStart();
        }

        const t1 = e.touches[0]!;
        const t2 = e.touches[1]!;

        const dist = Math.hypot(
          t2.clientX - t1.clientX,
          t2.clientY - t1.clientY,
        );
        const rect = container.getBoundingClientRect();
        const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
        const midY = (t1.clientY + t2.clientY) / 2 - rect.top;

        const currentScale = scaleRef.current;
        const currentPos = positionRef.current;

        touchStateRef.current.mode = "PINCH";
        touchStateRef.current.initialDist = Math.max(10, dist);
        touchStateRef.current.initialScale = currentScale;
        touchStateRef.current.initialAnchor = {
          x: (midX - currentPos.x) / currentScale,
          y: (midY - currentPos.y) / currentScale,
        };

        isDraggingRef.current = true;
        hasDraggedRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;

      if (e.touches.length === 1 && touchStateRef.current.mode === "PAN") {
        const touch = e.touches[0]!;
        const dx = touch.clientX - touchStateRef.current.singleStartClient.x;
        const dy = touch.clientY - touchStateRef.current.singleStartClient.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 6) {
          if (e.cancelable) {
            e.preventDefault();
          }

          if (!hasDraggedRef.current && onDragStart) {
            onDragStart();
          }
          hasDraggedRef.current = true;

          const nextPos = {
            x: touchStateRef.current.singleStartMapPos.x + dx,
            y: touchStateRef.current.singleStartMapPos.y + dy,
          };

          updatePosition(nextPos);
        }
      } else if (e.touches.length >= 2) {
        if (e.cancelable) {
          e.preventDefault();
        }

        if (!hasDraggedRef.current && onDragStart) {
          onDragStart();
        }

        const t1 = e.touches[0]!;
        const t2 = e.touches[1]!;

        const dist = Math.hypot(
          t2.clientX - t1.clientX,
          t2.clientY - t1.clientY,
        );
        const ratio = dist / touchStateRef.current.initialDist;

        const nextScale = Math.max(
          minAllowedScale,
          Math.min(maxAllowedScale, touchStateRef.current.initialScale * ratio),
        );

        const rect = container.getBoundingClientRect();
        const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
        const midY = (t1.clientY + t2.clientY) / 2 - rect.top;

        const anchor = touchStateRef.current.initialAnchor;
        const nextPos = {
          x: midX - anchor.x * nextScale,
          y: midY - anchor.y * nextScale,
        };

        hasDraggedRef.current = true;
        updateScaleAndPosition(nextScale, nextPos);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        const wasPan = touchStateRef.current.mode === "PAN";
        const wasNotDragged = !hasDraggedRef.current;
        const elapsed = Date.now() - touchStateRef.current.startTime;

        if (wasPan && wasNotDragged && elapsed < 400 && onTap) {
          const client = touchStateRef.current.singleStartClient;
          onTap(client.x, client.y);
        }

        touchStateRef.current.mode = "NONE";
        isDraggingRef.current = false;
        setTimeout(() => {
          hasDraggedRef.current = false;
        }, 150);
      } else if (e.touches.length === 1) {
        const touch = e.touches[0]!;
        touchStateRef.current.mode = "PAN";
        touchStateRef.current.singleStartClient = {
          x: touch.clientX,
          y: touch.clientY,
        };
        touchStateRef.current.singleStartMapPos = {
          x: positionRef.current.x,
          y: positionRef.current.y,
        };
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, {
      passive: true,
    });

    return () => {
      container.removeEventListener("gesturestart", preventGesture);
      container.removeEventListener("gesturechange", preventGesture);
      container.removeEventListener("gestureend", preventGesture);

      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [
    containerRef,
    positionRef,
    scaleRef,
    isDraggingRef,
    hasDraggedRef,
    onDragStart,
    updatePosition,
    updateScaleAndPosition,
    onTap,
  ]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      mouseDownPos.current = { x: e.clientX, y: e.clientY };

      const currentPos = positionRef.current;

      dragStart.current = {
        x: e.clientX - currentPos.x,
        y: e.clientY - currentPos.y,
      };
    },
    [positionRef, isDraggingRef, hasDraggedRef],
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

      const nextPos = {
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      };

      updatePosition(nextPos);
    },
    [onDragStart, updatePosition, isDraggingRef, hasDraggedRef],
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 150);
  }, [isDraggingRef, hasDraggedRef]);

  return {
    positionRef,
    scaleRef,
    isDraggingRef,
    hasDraggedRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
