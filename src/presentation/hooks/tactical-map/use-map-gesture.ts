import { useState } from "react";
import { useMapZoom } from "./use-map-zoom";
import { useMapDrag } from "./use-map-drag";

export function useMapGesture() {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const { scale, calculateZoom, zoomIn, zoomOut, resetScale } = useMapZoom();

  const {
    isDragging,
    hasDraggedRef,
    handleMouseDown: dragMouseDown,
    handleMouseMove: dragMouseMove,
    handleMouseUp: dragMouseUp,
  } = useMapDrag(position, setPosition);

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
    dragMouseDown(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    dragMouseMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    dragMouseUp();
  };

  const resetView = () => {
    resetScale();
    setPosition({ x: 0, y: 0 });
  };

  return {
    scale,
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
    resetView,
    handleResetView: resetView,
  };
}
