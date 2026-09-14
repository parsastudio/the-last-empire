import { useState, useEffect, RefObject } from "react";

export function useWebGLContext(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  dimensions: { width: number; height: number },
) {
  const [gl, setGl] = useState<WebGL2RenderingContext | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2.0);
    canvas.width = Math.round(dimensions.width * dpr);
    canvas.height = Math.round(dimensions.height * dpr);

    const context = canvas.getContext("webgl2", {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: true,
      preserveDrawingBuffer: false,
    });

    if (context) {
      context.viewport(0, 0, canvas.width, canvas.height);
      setGl(context);
    }
  }, [canvasRef, dimensions]);

  return gl;
}
