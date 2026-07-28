import { useState, useRef } from "react";

export function useMapDrag(
  position: { x: number; y: number },
  setPosition: (pos: { x: number; y: number }) => void,
) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseDownPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasDraggedRef = useRef<boolean>(false);

  const handleMouseDown = (clientX: number, clientY: number) => {
    setIsDragging(true);
    hasDraggedRef.current = false;
    mouseDownPos.current = { x: clientX, y: clientY };
    dragStart.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    };
  };

  const handleMouseMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const dist = Math.hypot(
      clientX - mouseDownPos.current.x,
      clientY - mouseDownPos.current.y,
    );
    if (dist > 5) {
      hasDraggedRef.current = true;
    }
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
    hasDraggedRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
