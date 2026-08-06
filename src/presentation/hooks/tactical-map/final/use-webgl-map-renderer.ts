import { useEffect, useRef, RefObject } from "react";
import { WebGLMapRenderer } from "@/presentation/components/tactical-map/final/webgl-map-renderer";
import { WebGLPaletteTextureManager } from "@/presentation/components/tactical-map/final/webgl-palette-texture-manager";
import { CountryMapping } from "@/domain/map/country-mapping.schema";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";

interface UseWebGLMapRendererProps {
  gl: WebGL2RenderingContext | null;
  dimensions: { width: number; height: number };
  positionRef: RefObject<CameraPosition>;
  scaleRef: RefObject<number>;
  countries: CountryMapping[];
  activeLayer?: "political" | "gdp";
}

export function useWebGLMapRenderer({
  gl,
  dimensions,
  positionRef,
  scaleRef,
  countries,
  activeLayer = "political",
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

      const gdpPaletteTex = WebGLPaletteTextureManager.createGdpPaletteTexture(
        gl,
        countries,
      );
      if (gdpPaletteTex) {
        renderer.setGdpPaletteTexture(gdpPaletteTex);
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
        const pos = positionRef.current || { x: 0, y: 0 };
        const scale = scaleRef.current || 1;

        rendererRef.current.render(
          dimensions.width * dpr,
          dimensions.height * dpr,
          pos.x * dpr,
          pos.y * dpr,
          scale * dpr,
          time,
          activeLayer,
        );
      }
      animFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [gl, dimensions, positionRef, scaleRef, activeLayer]);

  return rendererRef;
}
