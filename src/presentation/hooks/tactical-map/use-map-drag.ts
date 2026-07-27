import { useState, useRef } from "react";

export function useMapDrag(
  position: { x: number; y: number },
  setPosition: (pos: { x: number; y: number }) => void,
) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    dragStart.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  };

  const handleMouseMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    setPosition({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
