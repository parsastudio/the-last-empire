import { useEffect, RefObject } from "react";

interface UseCanvasRendererProps {
  canvasDestRef: RefObject<HTMLCanvasElement | null>;
  canvasShadedRef: RefObject<HTMLCanvasElement | null>;
  dataLoading: boolean;
  dimensions: { width: number; height: number };
  position: { x: number; y: number };
  scale: number;
  mapWidth: number;
  mapHeight: number;
  activeLayer?: "political" | "gdp";
}

export function useCanvasRenderer({
  canvasDestRef,
  canvasShadedRef,
  dataLoading,
  dimensions,
  position,
  scale,
  mapWidth,
  mapHeight,
  activeLayer = "political",
}: UseCanvasRendererProps) {
  useEffect(() => {
    const canvasDest = canvasDestRef.current;
    const canvasShaded = canvasShadedRef.current;
    if (!canvasDest || !canvasShaded || dataLoading) return;

    const ctxDest = canvasDest.getContext("2d");
    if (!ctxDest) return;

    const dpr = window.devicePixelRatio || 1;

    canvasDest.width = dimensions.width * dpr;
    canvasDest.height = dimensions.height * dpr;

    ctxDest.imageSmoothingEnabled = true;

    const fx = mapWidth / dimensions.width;
    const fy = mapHeight / dimensions.height;

    const sx = (-position.x / scale) * fx;
    const sy = (-position.y / scale) * fy;
    const sWidth = (dimensions.width / scale) * fx;
    const sHeight = (dimensions.height / scale) * fy;

    ctxDest.fillStyle = "rgb(15, 20, 30)";
    ctxDest.fillRect(0, 0, canvasDest.width, canvasDest.height);

    ctxDest.drawImage(
      canvasShaded,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      canvasDest.width,
      canvasDest.height,
    );
  }, [
    scale,
    position,
    dataLoading,
    canvasShadedRef,
    dimensions,
    canvasDestRef,
    mapWidth,
    mapHeight,
    activeLayer,
  ]);
}
