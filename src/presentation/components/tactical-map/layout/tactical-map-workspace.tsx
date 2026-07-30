"use client";

import React, { useState, useRef, Suspense, useCallback } from "react";
import { useMapGesture } from "@/presentation/hooks/tactical-map/use-map-gesture";
import { useMapDimensions } from "@/presentation/hooks/tactical-map/use-map-dimensions";
import { useMapData } from "@/presentation/hooks/tactical-map/use-map-data";
import { useCanvasRenderer } from "@/presentation/hooks/tactical-map/use-canvas-renderer";
import { useTacticalMapInteraction } from "@/presentation/hooks/tactical-map/use-tactical-map-interaction";
import { useMapCameraFocus } from "@/presentation/hooks/tactical-map/use-map-camera-focus";
import { TacticalViewport } from "./tactical-viewport";
import { SidebarContainer } from "../sidebar/sidebar-container";
import { CountryHoverContainer } from "../hud/country-hover-container";
import { TacticalMapOverlay } from "./tactical-map-overlay";
import { LayerController, TacticalLayer } from "../controls/layer-controller";
import { useGeopoliticsGame } from "@/presentation/hooks/game/use-geopolitics-game";
import { useGameResources } from "@/presentation/hooks/game/use-game-resources";
import { useAutoSaveGame } from "@/presentation/hooks/game/use-auto-save-game";
import { CampaignNotFoundModal } from "../modals/campaign-not-found-modal";

interface TacticalMapWorkspaceProps {
  gameId?: string;
}

function WorkspaceContent({
  gameId = "default_game",
}: TacticalMapWorkspaceProps) {
  const mapWidth = 4096;
  const mapHeight = 2048;

  const [activeMapMode] = useState<"default" | "edited" | "partition">(
    "partition",
  );
  const [activeLayer, setActiveLayer] = useState<TacticalLayer>("political");
  const [isSidebarOpen] = useState<boolean>(true);
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
    canvasSrcRef,
    canvasShadedRef,
    maskDataRef,
    packed1024Ref,
    reRenderLayer,
  } = useMapData({
    mapWidth,
    mapHeight,
    mapMode: activeMapMode,
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
        canvasShadedRef={canvasShadedRef}
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

        <TacticalMapOverlay
          metrics={metrics}
          gameState={gameState}
          contextMenuState={interaction.contextMenuState}
          activeScreenPos={interaction.activeScreenPos}
          attackModalState={interaction.attackModalState}
          onSelectAction={interaction.handleSelectContextAction}
          onCloseContextMenu={interaction.closeContextMenu}
          onCloseAttackModal={interaction.closeAttackModal}
          onOpenPendingDecisions={(tab) =>
            interaction.handleOpenPendingTab(tab)
          }
        />
      </TacticalViewport>

      <LayerController
        activeLayer={activeLayer}
        onChangeLayer={setActiveLayer}
      />

      <SidebarContainer
        isOpen={isSidebarOpen}
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
