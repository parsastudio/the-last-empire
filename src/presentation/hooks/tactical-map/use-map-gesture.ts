import { useState, useRef } from "react";

export interface MapDragPosition {
  x: number;
  y: number;
}

export function useMapGesture() {
  const [position, setPosition] = useState<MapDragPosition>({ x: 0, y: 0 });
  const [scale, setScale] = useState<number>(1);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<MapDragPosition>({ x: 0, y: 0 });
  const mouseDownPos = useRef<MapDragPosition>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);

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
    const nextScale = Math.max(1, Math.min(30, scale * zoomFactor));

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

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.5, 30));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.5, 1));
  const resetScale = () => setScale(1);

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
