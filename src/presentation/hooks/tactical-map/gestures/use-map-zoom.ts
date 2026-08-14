import { useCallback, useEffect, RefObject } from "react";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";

interface UseMapZoomProps {
  containerRef?: RefObject<HTMLDivElement | null>;
  externalPositionRef?: RefObject<CameraPosition>;
  externalScaleRef?: RefObject<number>;
  fallbackPositionRef: RefObject<CameraPosition>;
  fallbackScaleRef: RefObject<number>;
}

export function useMapZoom({
  containerRef,
  externalPositionRef,
  externalScaleRef,
  fallbackPositionRef,
  fallbackScaleRef,
}: UseMapZoomProps) {
  const calculateZoom = useCallback(
    (deltaY: number, rect: DOMRect, clientX: number, clientY: number) => {
      const mx = clientX - rect.left;
      const my = clientY - rect.top;

      const currentScale =
        externalScaleRef?.current ?? fallbackScaleRef.current;
      const currentPos =
        externalPositionRef?.current ?? fallbackPositionRef.current;

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

      if (externalScaleRef) {
        externalScaleRef.current = nextScale;
      } else {
        fallbackScaleRef.current = nextScale;
      }

      if (externalPositionRef) {
        externalPositionRef.current = nextPosition;
      } else {
        fallbackPositionRef.current = nextPosition;
      }
    },
    [
      externalPositionRef,
      externalScaleRef,
      fallbackPositionRef,
      fallbackScaleRef,
    ],
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

  return { handleWheel, calculateZoom };
}
