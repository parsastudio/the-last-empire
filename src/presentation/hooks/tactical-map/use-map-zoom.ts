import { useState } from "react";

export function useMapZoom() {
  const [scale, setScale] = useState<number>(1);

  const calculateZoom = (
    deltaY: number,
    rect: DOMRect,
    clientX: number,
    clientY: number,
    position: { x: number; y: number },
  ) => {
    const mx = clientX - rect.left;
    const my = clientY - rect.top;

    const zoomFactor = deltaY < 0 ? 1.15 : 0.85;
    const nextScale = Math.max(1, Math.min(30, scale * zoomFactor));

    if (nextScale === scale) {
      return { nextScale, nextPosition: position };
    }

    const nextPosition = {
      x: mx - (mx - position.x) * (nextScale / scale),
      y: my - (my - position.y) * (nextScale / scale),
    };

    setScale(nextScale);
    return { nextScale, nextPosition };
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.5, 30));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.5, 1));
  const resetScale = () => setScale(1);

  return {
    scale,
    setScale,
    calculateZoom,
    zoomIn,
    zoomOut,
    resetScale,
  };
}
