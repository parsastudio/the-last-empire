import { useEffect, useRef } from "react";
import { WebGLMapRenderer } from "@/presentation/components/tactical-map/final/webgl-map-renderer";
import { WebGLPaletteTextureManager } from "@/presentation/components/tactical-map/final/webgl-palette-texture-manager";
import { CountryMapping } from "@/presentation/hooks/tactical-map/use-map-data";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";

interface UseWebGLMapRendererProps {
  gl: WebGL2RenderingContext | null;
  dimensions: { width: number; height: number };
  position: { x: number; y: number };
  scale: number;
  countries: CountryMapping[];
}

export function useWebGLMapRenderer({
  gl,
  dimensions,
  position,
  scale,
  countries,
}: UseWebGLMapRendererProps) {
  const rendererRef = useRef<WebGLMapRenderer | null>(null);

  useEffect(() => {
    if (!gl) return;

    const renderer = new WebGLMapRenderer(gl);
    rendererRef.current = renderer;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = MapPathResolver.getMapFinalClientUrl(
      "map1",
      "base_map_terrain.png",
    );
    img.onload = () => {
      renderer.setTerrainImage(img);
    };

    if (countries.length > 0) {
      const paletteTex = WebGLPaletteTextureManager.createPaletteTexture(
        gl,
        countries,
      );
      if (paletteTex) {
        renderer.setPaletteTexture(paletteTex);
      }
    }

    const gridState = BitPackedGridState.getInstance();
    const rawBuffer = gridState.getBuffer().getRawBuffer();
    renderer.updateLiveStateTexture(rawBuffer);
  }, [gl, countries]);

  useEffect(() => {
    let animFrameId: number;
    const startTime = performance.now();

    const renderLoop = () => {
      if (rendererRef.current && gl) {
        const time = (performance.now() - startTime) / 1000;
        const dpr = window.devicePixelRatio || 1;

        rendererRef.current.render(
          dimensions.width * dpr,
          dimensions.height * dpr,
          { x: position.x * dpr, y: position.y * dpr },
          scale * dpr,
          time,
        );
      }
      animFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [gl, dimensions, position, scale]);

  return rendererRef;
}
