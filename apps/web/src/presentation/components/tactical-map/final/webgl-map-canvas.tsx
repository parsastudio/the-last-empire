import React, { useRef, useCallback, useEffect } from "react";
import { useWebGLContext } from "@/presentation/hooks/tactical-map/final/use-webgl-context";
import { useWebGLMapRenderer } from "@/presentation/hooks/tactical-map/final/use-webgl-map-renderer";
import { useMapDimensions } from "@/presentation/hooks/tactical-map/use-map-dimensions";
import { useMapGesture } from "@/presentation/hooks/tactical-map/use-map-gesture";
import { WebGLHoverHud } from "@/presentation/components/tactical-map/final/hud/webgl-hover-hud";
import { WebGLContextMenuWrapper } from "@/presentation/components/tactical-map/final/hud/webgl-context-menu-wrapper";
import { useWebGLInteraction } from "@/presentation/hooks/tactical-map/final/use-webgl-interaction";
import { ContextActionType } from "@/presentation/components/tactical-map/context-menu/map-context-menu";
import { Nation } from "@/domain/nation/nation.schema";
import { Province } from "@/domain/province/province.schema";
import { CameraPosition } from "@/presentation/hooks/tactical-map/final/map-camera-transform";

interface WebGLMapCanvasProps {
  provincesMap?: Record<string, Province>;
  nationsMap?: Record<string, Nation>;
  humanNationId?: string;
  activeLayer?: "political" | "gdp";
  positionRef?: React.RefObject<CameraPosition>;
  scaleRef?: React.RefObject<number>;
  onSelectCountryContext?: (iso3: string) => void;
  onSelectCountryAttackContext?: (iso3: string, provinceId?: number) => void;
  onSelectBuyProvinceContext?: (iso3: string, provinceId?: number) => void;
}

export function WebGLMapCanvas({
  provincesMap,
  nationsMap,
  humanNationId,
  activeLayer = "political",
  positionRef: externalPositionRef,
  scaleRef: externalScaleRef,
  onSelectCountryContext,
  onSelectCountryAttackContext,
  onSelectBuyProvinceContext,
}: WebGLMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRenderRef = useRef<() => void>(() => {});

  const dimensions = useMapDimensions(containerRef);
  const gl = useWebGLContext(canvasRef, dimensions);

  const closeContextMenuRef = useRef<() => void>(() => {});

  const handleDragStart = useCallback(() => {
    closeContextMenuRef.current();
  }, []);

  const handleTransformChange = useCallback(() => {
    requestRenderRef.current();
  }, []);

  const {
    scaleRef,
    positionRef,
    isDraggingRef,
    hasDraggedRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useMapGesture(
    dimensions.width,
    dimensions.height,
    4096,
    2048,
    containerRef,
    externalPositionRef,
    externalScaleRef,
    handleDragStart,
    handleTransformChange,
  );

  const {
    hoverPos,
    hoverData,
    hoveredGpuIndex,
    contextMenuState,
    handlePointerMove,
    handlePointerLeave,
    handleMapClick,
    closeContextMenu,
  } = useWebGLInteraction({
    containerRef,
    positionRef,
    scaleRef,
    isDraggingRef,
    hasDraggedRef,
    provincesMap,
    nationsMap,
    humanNationId,
    onRequestRender: handleTransformChange,
  });

  useEffect(() => {
    closeContextMenuRef.current = closeContextMenu;
  }, [closeContextMenu]);

  const { requestRender } = useWebGLMapRenderer({
    gl,
    dimensions,
    positionRef,
    scaleRef,
    provincesMap,
    activeLayer,
    hoveredGpuIndex,
  });

  useEffect(() => {
    requestRenderRef.current = requestRender;
  }, [requestRender]);

  const onMouseMoveCombined = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMouseMove(e);
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleSelectContext = useCallback(
    (action: ContextActionType, iso3: string, provinceId?: number) => {
      closeContextMenu();
      if (action === "profile" && onSelectCountryContext) {
        onSelectCountryContext(iso3);
      } else if (action === "attack" && onSelectCountryAttackContext) {
        onSelectCountryAttackContext(iso3, provinceId);
      } else if (action === "buy_province" && onSelectBuyProvinceContext) {
        onSelectBuyProvinceContext(iso3, provinceId);
      }
    },
    [
      closeContextMenu,
      onSelectCountryContext,
      onSelectCountryAttackContext,
      onSelectBuyProvinceContext,
    ],
  );

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen absolute inset-0 bg-slate-950 overflow-hidden cursor-crosshair select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={onMouseMoveCombined}
      onMouseUp={handleMouseUp}
      onMouseLeave={handlePointerLeave}
      onClick={handleMapClick}
    >
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full block"
      />
      <WebGLHoverHud hoverPos={hoverPos} hoverData={hoverData} />
      <WebGLContextMenuWrapper
        contextMenuState={contextMenuState}
        onSelectAction={handleSelectContext}
      />
    </div>
  );
}
