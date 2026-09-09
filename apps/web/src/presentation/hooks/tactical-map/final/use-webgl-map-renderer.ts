import { useEffect, useRef, useCallback, RefObject } from "react";
import { WebGLMapRenderer } from "@/presentation/components/tactical-map/final/webgl-map-renderer";
import { WebGLPaletteTextureManager } from "@/presentation/components/tactical-map/final/webgl-palette-texture-manager";
import { BitPackedGridState } from "@geopolitics/game-engine";
import { Province, Nation } from "@geopolitics/domain";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";
import { ClientFinalStateLoader } from "@/infrastructure/storage/client-final-state-loader";

interface UseWebGLMapRendererProps {
  gl: WebGL2RenderingContext | null;
  dimensions: { width: number; height: number };
  positionRef: RefObject<CameraPosition>;
  scaleRef: RefObject<number>;
  provincesMap?: Record<string, Province>;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  activeLayer?: "political" | "gdp";
  hoveredGpuIndex?: number;
}

export function useWebGLMapRenderer({
  gl,
  dimensions,
  positionRef,
  scaleRef,
  provincesMap,
  nationsMap,
  humanNationId,
  activeLayer = "political",
  hoveredGpuIndex = 0,
}: UseWebGLMapRendererProps) {
  const rendererRef = useRef<WebGLMapRenderer | null>(null);
  const paletteTextureRef = useRef<WebGLTexture | null>(null);
  const gdpTextureRef = useRef<WebGLTexture | null>(null);
  const diplomaticTextureRef = useRef<WebGLTexture | null>(null);
  const hoveredGpuIndexRef = useRef<number>(hoveredGpuIndex);
  const lastVersionRef = useRef<number>(-1);
  const animFrameIdRef = useRef<number | null>(null);

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
  }, [gl, dimensions, positionRef, scaleRef, activeLayer]);

  const requestRender = useCallback(() => {
    if (animFrameIdRef.current === null) {
      animFrameIdRef.current = requestAnimationFrame(() => {
        animFrameIdRef.current = null;
        renderSingleFrame();
      });
    }
  }, [renderSingleFrame]);

  useEffect(() => {
    hoveredGpuIndexRef.current = hoveredGpuIndex;
    requestRender();
  }, [hoveredGpuIndex, requestRender]);

  useEffect(() => {
    if (!gl) return;

    const renderer = new WebGLMapRenderer(gl);
    rendererRef.current = renderer;

    ClientFinalStateLoader.loadTerrainRawData("map1").then((terrainData) => {
      if (terrainData && rendererRef.current) {
        rendererRef.current.setTerrainData(
          terrainData.indexedGrid,
          terrainData.palette,
          terrainData.width,
          terrainData.height,
        );
        requestRender();
      }
    });

    const paletteTex = WebGLPaletteTextureManager.createPaletteTexture(
      gl,
      provincesMap,
    );
    if (paletteTex) {
      paletteTextureRef.current = paletteTex;
      renderer.setPaletteTexture(paletteTex);
    }

    const dipTex = WebGLPaletteTextureManager.createDiplomaticTexture(
      gl,
      provincesMap,
      nationsMap,
      humanNationId,
    );
    if (dipTex) {
      diplomaticTextureRef.current = dipTex;
      renderer.setDiplomaticPaletteTexture(dipTex);
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
  }, [gl, provincesMap, nationsMap, humanNationId, requestRender]);

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
    if (!gl || !diplomaticTextureRef.current) return;
    WebGLPaletteTextureManager.updateDiplomaticTexture(
      gl,
      diplomaticTextureRef.current,
      provincesMap,
      nationsMap,
      humanNationId,
    );
    requestRender();
  }, [gl, provincesMap, nationsMap, humanNationId, requestRender]);

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
