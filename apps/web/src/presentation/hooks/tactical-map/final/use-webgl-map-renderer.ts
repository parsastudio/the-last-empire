import { useEffect, useRef, useCallback, RefObject } from "react";
import { WebGLMapRenderer } from "@/presentation/components/tactical-map/final/webgl-map-renderer";
import { WebGLPaletteTextureManager } from "@/presentation/components/tactical-map/final/webgl-palette-texture-manager";
import { BitPackedGridState } from "@geopolitics/game-engine";
import { ClientMapPathResolver, Province } from "@geopolitics/domain";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";

interface UseWebGLMapRendererProps {
  gl: WebGL2RenderingContext | null;
  dimensions: { width: number; height: number };
  positionRef: RefObject<CameraPosition>;
  scaleRef: RefObject<number>;
  provincesMap?: Record<string, Province>;
  activeLayer?: "political" | "gdp";
  hoveredGpuIndex?: number;
}

export function useWebGLMapRenderer({
  gl,
  dimensions,
  positionRef,
  scaleRef,
  provincesMap,
  activeLayer = "political",
  hoveredGpuIndex = 0,
}: UseWebGLMapRendererProps) {
  const rendererRef = useRef<WebGLMapRenderer | null>(null);
  const paletteTextureRef = useRef<WebGLTexture | null>(null);
  const gdpTextureRef = useRef<WebGLTexture | null>(null);
  const hoveredGpuIndexRef = useRef<number>(hoveredGpuIndex);
  const isDirtyRef = useRef<boolean>(true);
  const lastVersionRef = useRef<number>(-1);
  const animFrameIdRef = useRef<number | null>(null);

  const lastRenderedStateRef = useRef({
    posX: 0,
    posY: 0,
    scale: 0,
    width: 0,
    height: 0,
    layer: activeLayer,
    hoveredGpuIndex: 0,
  });

  const requestRender = useCallback(() => {
    isDirtyRef.current = true;
    if (animFrameIdRef.current === null) {
      animFrameIdRef.current = requestAnimationFrame(() => {
        animFrameIdRef.current = null;
        renderSingleFrame();
      });
    }
  }, []);

  const renderSingleFrame = useCallback(() => {
    if (!rendererRef.current || !gl) return;

    const gridState = BitPackedGridState.getInstance();
    const currentVersion = gridState.getVersion();

    if (currentVersion !== lastVersionRef.current) {
      rendererRef.current.updateLiveStateTexture(
        gridState.getBuffer().getRawBuffer(),
      );
      lastVersionRef.current = currentVersion;
    }

    const dpr = window.devicePixelRatio || 1;
    const pos = positionRef.current || { x: 0, y: 0 };
    const scale = scaleRef.current || 1;

    rendererRef.current.render(
      dimensions.width * dpr,
      dimensions.height * dpr,
      pos.x * dpr,
      pos.y * dpr,
      scale * dpr,
      activeLayer,
      hoveredGpuIndexRef.current,
    );

    lastRenderedStateRef.current = {
      posX: pos.x,
      posY: pos.y,
      scale,
      width: dimensions.width,
      height: dimensions.height,
      layer: activeLayer,
      hoveredGpuIndex: hoveredGpuIndexRef.current,
    };

    isDirtyRef.current = false;
  }, [gl, dimensions, positionRef, scaleRef, activeLayer]);

  useEffect(() => {
    hoveredGpuIndexRef.current = hoveredGpuIndex;
    requestRender();
  }, [hoveredGpuIndex, requestRender]);

  useEffect(() => {
    if (!gl) return;

    const renderer = new WebGLMapRenderer(gl);
    rendererRef.current = renderer;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = ClientMapPathResolver.getMapVisualClientUrl(
      "map1",
      "tactical_map_terrain.png",
    );
    img.onload = () => {
      renderer.setTerrainImage(img);
      requestRender();
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
    );
    if (gdpPaletteTex) {
      gdpTextureRef.current = gdpPaletteTex;
      renderer.setGdpPaletteTexture(gdpPaletteTex);
    }

    const gridState = BitPackedGridState.getInstance();
    const rawBuffer = gridState.getBuffer().getRawBuffer();
    renderer.updateLiveStateTexture(rawBuffer);
    lastVersionRef.current = gridState.getVersion();

    requestRender();
  }, [gl, requestRender]);

  useEffect(() => {
    if (!gl || !paletteTextureRef.current) return;
    WebGLPaletteTextureManager.updatePaletteTexture(
      gl,
      paletteTextureRef.current,
      provincesMap,
    );
    requestRender();
  }, [gl, provincesMap, requestRender]);

  useEffect(() => {
    if (!gl || !gdpTextureRef.current) return;
    WebGLPaletteTextureManager.updateGdpPaletteTexture(
      gl,
      gdpTextureRef.current,
      provincesMap,
    );
    requestRender();
  }, [gl, provincesMap, requestRender]);

  useEffect(() => {
    requestRender();
  }, [dimensions, activeLayer, requestRender]);

  useEffect(() => {
    return () => {
      if (animFrameIdRef.current !== null) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, []);

  return { rendererRef, requestRender };
}
