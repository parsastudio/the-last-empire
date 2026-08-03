"use client";

import React, {
  useState,
  useRef,
  Suspense,
  useCallback,
  useEffect,
} from "react";
import { useMapGesture } from "@/presentation/hooks/tactical-map/use-map-gesture";
import { useMapDimensions } from "@/presentation/hooks/tactical-map/use-map-dimensions";
import { useMapData } from "@/presentation/hooks/tactical-map/use-map-data";
import { useCanvasRenderer } from "@/presentation/hooks/tactical-map/use-canvas-renderer";
import { useTacticalMapInteraction } from "@/presentation/hooks/tactical-map/use-tactical-map-interaction";
import { useMapCameraFocus } from "@/presentation/hooks/tactical-map/use-map-camera-focus";
import { SidebarContainer } from "@/presentation/components/tactical-map/sidebar/sidebar-container";
import { CountryHoverContainer } from "@/presentation/components/tactical-map/hud/country-hover-container";
import {
  LayerController,
  TacticalLayer,
} from "@/presentation/components/tactical-map/controls/layer-controller";
import { useGeopoliticsGame } from "@/presentation/hooks/game/use-geopolitics-game";
import { useGameResources } from "@/presentation/hooks/game/use-game-resources";
import { useAutoSaveGame } from "@/presentation/hooks/game/use-auto-save-game";
import { CampaignNotFoundModal } from "@/presentation/components/tactical-map/modals/campaign-not-found-modal";
import { MapContextMenu } from "@/presentation/components/tactical-map/context-menu/map-context-menu";
import { TopHudBar } from "@/presentation/components/tactical-map/hud/top-bar/top-hud-bar";
import { StrategicToastContainer } from "@/presentation/components/common/strategic-toast-container";
import { GameOverDialogWrapper } from "@/presentation/components/tactical-map/modals/game-over-dialog-wrapper";

function TacticalViewport({
  containerRef,
  canvasDestRef,
  isDragging,
  isHoveringCountry = false,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onClick,
  children,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  canvasDestRef: React.RefObject<HTMLCanvasElement | null>;
  isDragging: boolean;
  isHoveringCountry?: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseUp: () => void;
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  children?: React.ReactNode;
}) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleNonPassiveWheel = (e: WheelEvent) => {
      e.preventDefault();
      const syntheticEvent = e as unknown as React.WheelEvent<HTMLDivElement>;
      onWheel(syntheticEvent);
    };

    container.addEventListener("wheel", handleNonPassiveWheel, {
      passive: false,
    });

    return () => {
      container.removeEventListener("wheel", handleNonPassiveWheel);
    };
  }, [containerRef, onWheel]);

  const getCursorClass = () => {
    if (isDragging) return "cursor-grabbing";
    if (isHoveringCountry) return "cursor-pointer";
    return "cursor-default";
  };

  return (
    <div
      ref={containerRef}
      className={`w-screen h-screen absolute inset-0 bg-slate-950 overflow-hidden ${getCursorClass()}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onClick={onClick}
    >
      <canvas
        ref={canvasDestRef}
        className="pointer-events-none absolute inset-0 w-full h-full block"
      />
      {children}
    </div>
  );
}

interface TacticalMapWorkspaceProps {
  gameId?: string;
}

function WorkspaceContent({
  gameId = "default_game",
}: TacticalMapWorkspaceProps) {
  const mapWidth = 4096;
  const mapHeight = 2048;

  const [activeLayer, setActiveLayer] = useState<TacticalLayer>("political");
  const [isHoveringCountry, setIsHoveringCountry] = useState<boolean>(false);

  const canvasDestRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const dimensions = useMapDimensions(containerRef);
  const {
    gameState,
    advanceNextTurn: baseAdvanceTurn,
    loading: isGameLoading,
    error,
  } = useGeopoliticsGame(gameId);

  const metrics = useGameResources(gameState);

  useAutoSaveGame(gameId, gameState);

  const {
    scale,
    position,
    setPosition,
    isDragging,
    hasDraggedRef,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  } = useMapGesture();

  const {
    countries,
    loading: dataLoading,
    isLayerRendering,
    renderVersion,
    canvasShadedRef,
    maskDataRef,
    packed1024Ref,
    reRenderLayer,
  } = useMapData({
    mapWidth,
    mapHeight,
    activeLayer,
  });

  const advanceNextTurn = useCallback(async () => {
    const nextState = await baseAdvanceTurn();
    if (nextState) {
      reRenderLayer();
    }
    return nextState;
  }, [baseAdvanceTurn, reRenderLayer]);

  const { focusOnCountry } = useMapCameraFocus({
    mapWidth,
    mapHeight,
    dimensions,
    scale,
    countries,
    maskDataRef,
    setPosition,
  });

  const interaction = useTacticalMapInteraction({
    mapWidth,
    mapHeight,
    countries,
    maskDataRef,
    containerRef,
    dimensions,
    scale,
    position,
    isDragging,
    hasDraggedRef,
  });

  useCanvasRenderer({
    canvasDestRef,
    canvasShadedRef,
    dataLoading,
    dimensions,
    position,
    scale,
    mapWidth,
    mapHeight,
    activeLayer,
    renderVersion,
  });

  const isNotFound = !isGameLoading && (error !== null || !gameState);

  return (
    <div
      className="w-screen h-screen bg-background overflow-hidden relative"
      dir="rtl"
    >
      <TacticalViewport
        containerRef={containerRef}
        canvasDestRef={canvasDestRef}
        isDragging={isDragging}
        isHoveringCountry={isHoveringCountry}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onClick={interaction.handleMapClick}
      >
        <CountryHoverContainer
          countries={countries}
          maskDataRef={maskDataRef}
          packed1024Ref={packed1024Ref}
          mapWidth={mapWidth}
          mapHeight={mapHeight}
          containerRef={containerRef}
          scale={scale}
          position={position}
          nationsMap={gameState?.nations}
          humanNationId={gameState?.humanNationId}
          isDragging={isDragging}
          onHoverStateChange={setIsHoveringCountry}
        />

        <TopHudBar metrics={metrics} />

        <StrategicToastContainer />

        <GameOverDialogWrapper gameState={gameState} />

        {interaction.contextMenuState && (
          <div
            className="absolute pointer-events-none z-40 w-5 h-5 rounded-full bg-military/60 border-2 border-military shadow-lg animate-ping -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${interaction.activeScreenPos.x}px`,
              top: `${interaction.activeScreenPos.y}px`,
            }}
          />
        )}

        {interaction.contextMenuState && (
          <MapContextMenu
            position={interaction.activeScreenPos}
            countryName={interaction.contextMenuState.countryName}
            countryCode={interaction.contextMenuState.countryCode}
            onSelectAction={interaction.handleSelectContextAction}
            onClose={interaction.closeContextMenu}
          />
        )}
      </TacticalViewport>

      <LayerController
        activeLayer={activeLayer}
        isRendering={isLayerRendering}
        onChangeLayer={setActiveLayer}
      />

      <SidebarContainer
        isOpen={true}
        gameId={gameId}
        gameState={gameState}
        advanceNextTurn={advanceNextTurn}
        externalActiveTab={interaction.externalSidebarTab}
        selectedTargetCode={interaction.selectedTargetCode}
        onClearExternalTab={interaction.clearExternalTab}
        onFocusCountry={focusOnCountry}
      />

      <CampaignNotFoundModal isOpen={isNotFound} gameId={gameId} />

      {dataLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background z-50">
          <div className="w-12 h-12 border-4 border-gdp border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium font-sans">
            در حال بارگذاری نقشه تاکتیکی...
          </p>
        </div>
      )}
    </div>
  );
}

export function TacticalMapWorkspace(props: TacticalMapWorkspaceProps) {
  return (
    <Suspense
      fallback={
        <div className="w-screen h-screen bg-background flex items-center justify-center text-muted-foreground text-xs font-mono">
          در حال راه‌اندازی سیستم ناوبری...
        </div>
      }
    >
      <WorkspaceContent {...props} />
    </Suspense>
  );
}
