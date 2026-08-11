import { useEffect, useRef, RefObject } from "react";
import { WebGLMapRenderer } from "@/presentation/components/tactical-map/final/webgl-map-renderer";
import { WebGLPaletteTextureManager } from "@/presentation/components/tactical-map/final/webgl-palette-texture-manager";
import { BitPackedGridState } from "@/engine/combat/final/bit-packed-grid-state";
import { MapPathResolver } from "@/infrastructure/map-preprocessing/map-path-resolver";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";
import { Province } from "@/domain/province/province.schema";
import { Nation } from "@/domain/nation/nation.schema";

interface UseWebGLMapRendererProps {
  gl: WebGL2RenderingContext | null;
  dimensions: { width: number; height: number };
  positionRef: RefObject<CameraPosition>;
  scaleRef: RefObject<number>;
  provincesMap?: Record<string, Province>;
  nationsMap?: Record<string, Nation>;
  activeLayer?: "political" | "gdp";
}

export function useWebGLMapRenderer({
  gl,
  dimensions,
  positionRef,
  scaleRef,
  provincesMap,
  nationsMap,
  activeLayer = "political",
}: UseWebGLMapRendererProps) {
  const rendererRef = useRef<WebGLMapRenderer | null>(null);
  const paletteTextureRef = useRef<WebGLTexture | null>(null);
  const gdpTextureRef = useRef<WebGLTexture | null>(null);

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

    const paletteTex = WebGLPaletteTextureManager.createPaletteTexture(
      gl,
      provincesMap,
    );
    if (paletteTex) {
      paletteTextureRef.current = paletteTex;
      renderer.setPaletteTexture(paletteTex);
    }

    const gdpPaletteTex = WebGLPaletteTextureManager.createGdpPaletteTexture(
      gl,
      provincesMap,
      nationsMap,
    );
    if (gdpPaletteTex) {
      gdpTextureRef.current = gdpPaletteTex;
      renderer.setGdpPaletteTexture(gdpPaletteTex);
    }

    const gridState = BitPackedGridState.getInstance();
    const rawBuffer = gridState.getBuffer().getRawBuffer();
    renderer.updateLiveStateTexture(rawBuffer);
  }, [gl]);

  useEffect(() => {
    if (!gl || !paletteTextureRef.current) return;
    WebGLPaletteTextureManager.updatePaletteTexture(
      gl,
      paletteTextureRef.current,
      provincesMap,
    );
  }, [gl, provincesMap]);

  useEffect(() => {
    if (!gl || !gdpTextureRef.current) return;
    WebGLPaletteTextureManager.updateGdpPaletteTexture(
      gl,
      gdpTextureRef.current,
      provincesMap,
      nationsMap,
    );
  }, [gl, provincesMap, nationsMap]);

  useEffect(() => {
    let animFrameId: number;
    const startTime = performance.now();
    let lastVersion = -1;

    const renderLoop = () => {
      if (rendererRef.current && gl) {
        const gridState = BitPackedGridState.getInstance();
        const currentVersion = gridState.getVersion();

        if (currentVersion !== lastVersion) {
          rendererRef.current.updateLiveStateTexture(
            gridState.getBuffer().getRawBuffer(),
          );
          lastVersion = currentVersion;
        }

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
