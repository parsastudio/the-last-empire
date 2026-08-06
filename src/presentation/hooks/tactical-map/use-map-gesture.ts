import { useState, useRef, useCallback, useEffect } from "react";
import { MAP_CONFIG } from "@/domain/map/map.config";

export interface MapDragPosition {
  x: number;
  y: number;
}

export function useMapGesture(
  containerWidth = 1200,
  containerHeight = 600,
  mapWidth: number = MAP_CONFIG.HIGH_RES_WIDTH,
  mapHeight: number = MAP_CONFIG.HIGH_RES_HEIGHT,
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

  const [position, setPosition] = useState<MapDragPosition>(
    () => computeInitial(containerWidth, containerHeight).pos,
  );
  const [scale, setScale] = useState<number>(
    () => computeInitial(containerWidth, containerHeight).scale,
  );

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<MapDragPosition>({ x: 0, y: 0 });
  const mouseDownPos = useRef<MapDragPosition>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);

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
      requestAnimationFrame(() => {
        setScale(fitScale);
        setPosition(pos);
      });
    }
  }, [containerWidth, containerHeight, computeInitial]);

  const calculateZoom = (
    deltaY: number,
    rect: DOMRect,
    clientX: number,
    clientY: number,
    currentPos: MapDragPosition,
  ) => {
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const zoomFactor = deltaY < 0 ? 1.15 : 0.85;
    const minAllowedScale = 0.05;
    const maxAllowedScale = 35.0;

    const nextScale = Math.max(
      minAllowedScale,
      Math.min(maxAllowedScale, scale * zoomFactor),
    );

    if (nextScale === scale) {
      return { nextScale, nextPosition: currentPos };
    }

    const nextPosition = {
      x: mx - (mx - currentPos.x) * (nextScale / scale),
      y: my - (my - currentPos.y) * (nextScale / scale),
    };

    setScale(nextScale);
    return { nextScale, nextPosition };
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const { nextPosition } = calculateZoom(
      e.deltaY,
      rect,
      e.clientX,
      e.clientY,
      position,
    );
    setPosition(nextPosition);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    hasDraggedRef.current = false;
    mouseDownPos.current = { x: e.clientX, y: e.clientY };
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dist = Math.hypot(
      e.clientX - mouseDownPos.current.x,
      e.clientY - mouseDownPos.current.y,
    );
    if (dist > 5) {
      hasDraggedRef.current = true;
    }
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const zoomIn = () => setScale((prev) => Math.min(prev * 1.25, 35));
  const zoomOut = () => setScale((prev) => Math.max(prev * 0.8, 0.05));
  const resetScale = () => {
    const { scale: fitScale, pos } = computeInitial(
      containerWidth,
      containerHeight,
    );
    setScale(fitScale);
    setPosition(pos);
  };

  return {
    scale,
    setScale,
    position,
    setPosition,
    isDragging,
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
