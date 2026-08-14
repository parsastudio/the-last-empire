import { useRef, useCallback, useEffect, RefObject } from "react";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";

interface UseMapPanProps {
  externalPositionRef?: RefObject<CameraPosition>;
  fallbackPositionRef: RefObject<CameraPosition>;
  onDragStart?: () => void;
}

export function useMapPan({
  externalPositionRef,
  fallbackPositionRef,
  onDragStart,
}: UseMapPanProps) {
  const isDraggingRef = useRef<boolean>(false);
  const hasDraggedRef = useRef<boolean>(false);
  const dragStart = useRef<CameraPosition>({ x: 0, y: 0 });
  const mouseDownPos = useRef<CameraPosition>({ x: 0, y: 0 });

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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.button !== 0) return;
      isDraggingRef.current = true;
      hasDraggedRef.current = false;
      mouseDownPos.current = { x: e.clientX, y: e.clientY };

      const currentPos =
        externalPositionRef?.current ?? fallbackPositionRef.current;

      dragStart.current = {
        x: e.clientX - currentPos.x,
        y: e.clientY - currentPos.y,
      };
    },
    [externalPositionRef, fallbackPositionRef],
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

      if (externalPositionRef) {
        externalPositionRef.current = nextPos;
      } else {
        fallbackPositionRef.current = nextPos;
      }
    },
    [externalPositionRef, fallbackPositionRef, onDragStart],
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 50);
  }, []);

  return {
    isDraggingRef,
    hasDraggedRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  };
}
