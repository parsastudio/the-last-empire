import React, { useRef } from "react";
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
  onSelectCountryContext?: (code: string) => void;
  onSelectCountryAttackContext?: (code: string, provinceId?: number) => void;
}

export function WebGLMapCanvas({
  provincesMap,
  nationsMap,
  activeLayer = "political",
  positionRef: externalPositionRef,
  scaleRef: externalScaleRef,
  onSelectCountryContext,
  onSelectCountryAttackContext,
}: WebGLMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const dimensions = useMapDimensions(containerRef);
  const gl = useWebGLContext(canvasRef, dimensions);

  const {
    scaleRef,
    positionRef,
    handleWheel,
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
  );

  useWebGLMapRenderer({
    gl,
    dimensions,
    positionRef,
    scaleRef,
    provincesMap,
    nationsMap,
    activeLayer,
  });

  const {
    hoverPos,
    hoverData,
    contextMenuState,
    handlePointerMove,
    handlePointerLeave,
    handleMapClick,
    closeContextMenu,
  } = useWebGLInteraction({
    containerRef,
    positionRef,
    scaleRef,
    isDraggingRef: useRef(false),
    hasDraggedRef: useRef(false),
    provincesMap,
    nationsMap,
  });

  const onWheelCombined = (e: React.WheelEvent<HTMLDivElement>) => {
    closeContextMenu();
    handleWheel(e);
  };

  const onMouseMoveCombined = (e: React.MouseEvent<HTMLDivElement>) => {
    handleMouseMove(e);
    handlePointerMove(e.clientX, e.clientY);
  };

  const handleSelectContext = (
    action: ContextActionType,
    code: string,
    provinceId?: number,
  ) => {
    closeContextMenu();
    if (action === "profile" && onSelectCountryContext) {
      onSelectCountryContext(code);
    } else if (action === "attack" && onSelectCountryAttackContext) {
      onSelectCountryAttackContext(code, provinceId);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen absolute inset-0 bg-slate-950 overflow-hidden cursor-crosshair select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={onMouseMoveCombined}
      onMouseUp={handleMouseUp}
      onMouseLeave={handlePointerLeave}
      onWheel={onWheelCombined}
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
        onClose={closeContextMenu}
      />
    </div>
  );
}
