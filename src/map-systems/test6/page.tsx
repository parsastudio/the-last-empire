"use client";

import React, { useState, useMemo, useRef } from "react";
import { useMapGesture } from "./hooks/use-map-gesture";
import { MapControls } from "./components/map-controls";
import { useMapData } from "./hooks/use-map-data";
import { useMapMouse } from "./hooks/use-map-mouse";
import { MapHeader } from "./components/map-header";
import { useMapGridRenderer } from "./hooks/use-map-grid-renderer";
import { SelectionModal } from "./components/selection-modal";
import { TacticalSidePanel } from "./components/tactical-side-panel";
import { SovereignControlSidebar } from "./components/sovereign-control-sidebar";
import { TurnLogsTerminal } from "./components/turn-logs-terminal";
import { GlobalRankingSidebar } from "./components/global-ranking-sidebar";
import { useTacticalSimulationState } from "./hooks/use-tactical-simulation-state";
import { useMapDimensions } from "./hooks/use-map-dimensions";
import { MapCanvasContainer } from "./components/map-canvas-container";
import { TacticalActionBar } from "./components/tactical-action-bar";
import { GridCombatBridge } from "./engine/grid-combat-bridge";
import { MapCanvasOverlays } from "./components/map-canvas-overlays";
import { useCanvasRenderer } from "./hooks/use-canvas-renderer";
import { useCanvasClickHandler } from "./hooks/use-canvas-click-handler";

export default function MapTest6Page() {
  const mapWidth = 4096;
  const mapHeight = 2048;

  const [showHeatmap, setShowHeatmap] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const canvasDestRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const bridge = useMemo(() => new GridCombatBridge(), []);
  const dimensions = useMapDimensions(containerRef);

  const {
    scale,
    position,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    zoomIn,
    zoomOut,
    handleResetView,
  } = useMapGesture();

  const {
    countries,
    loading: dataLoading,
    error,
    isCached,
    canvasSrcRef,
    canvasShadedRef,
    maskDataRef,
  } = useMapData({ mapWidth, mapHeight });

  const { hoveredCountry, handlePointerMove } = useMapMouse({
    canvasDestRef,
    maskDataRef,
    countries,
    position,
    scale,
    mapWidth,
    mapHeight,
  });

  const {
    playerNationId,
    resetSession,
    gameState,
    gridState,
    buyResource,
    recruitUnits,
    updateTaxRate,
    proposeDiplomacy,
    declareWarDirectly,
    upgradeInfrastructure,
    upgradeIndustrialLevel,
    unlockDoctrineType,
    forceSuccess,
    toggleForceSuccess,
    rankings,
    filteredLogs,
    selectNation,
    executeAttack,
    isAttacking,
    advanceTurn,
    isAdvancing,
    humanNation,
  } = useTacticalSimulationState(setPendingSelection);

  useMapGridRenderer(canvasDestRef, gridState, dataLoading, showHeatmap);

  useCanvasRenderer({
    canvasDestRef,
    canvasShadedRef,
    dataLoading,
    dimensions,
    position,
    scale,
    mapWidth,
    mapHeight,
  });

  const handleCanvasClick = useCanvasClickHandler({
    isDragging,
    hoveredCountry,
    dataLoading,
    canvasDestRef,
    position,
    scale,
    mapWidth,
    mapHeight,
    playerNationId,
    bridge,
    onSelectPending: setPendingSelection,
    onExecuteAttack: executeAttack,
  });

  return (
    <div className="w-screen h-screen bg-slate-950 text-white flex flex-row overflow-hidden select-none font-sans text-left">
      {dataLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-slate-950 z-50">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">
            Generating High-Fidelity 4K Tactical Map...
          </p>
        </div>
      )}

      {error && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 p-4 bg-red-950/80 border border-red-800/80 text-red-400 rounded-xl shadow-2xl z-50 text-xs font-mono">
          {error}
        </div>
      )}

      {gameState && playerNationId && (
        <TacticalSidePanel state={gameState} humanNationId={playerNationId}>
          <GlobalRankingSidebar
            ranks={rankings}
            nations={gameState.nations}
            humanNationId={playerNationId}
          />
        </TacticalSidePanel>
      )}

      <div className="flex-1 flex flex-col relative h-full">
        <MapHeader isCached={isCached} countriesCount={countries.length} />

        <MapCanvasContainer
          containerRef={containerRef}
          canvasDestRef={canvasDestRef}
          canvasSrcRef={canvasSrcRef}
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => {
            handleMouseMove(e);
            handlePointerMove(e);
          }}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
        >
          <MapCanvasOverlays
            gameState={gameState}
            playerNationId={playerNationId}
            humanNation={humanNation}
            hoveredCountry={hoveredCountry}
            isAttacking={isAttacking}
            dimensions={dimensions}
            position={position}
            scale={scale}
            mapWidth={mapWidth}
            mapHeight={mapHeight}
            bridge={bridge}
            onExecuteAttack={executeAttack}
          />

          {gameState && playerNationId && humanNation && (
            <SovereignControlSidebar
              gameState={gameState}
              playerNationId={playerNationId}
              humanNation={humanNation}
              hoveredCountry={hoveredCountry}
              forceSuccess={forceSuccess}
              onToggleForceSuccess={toggleForceSuccess}
              onPropose={(type) => {
                if (hoveredCountry) {
                  proposeDiplomacy(hoveredCountry.code, type);
                }
              }}
              onDeclareWar={() => {
                if (hoveredCountry) {
                  declareWarDirectly(hoveredCountry.code);
                }
              }}
              onTaxChange={updateTaxRate}
              onUpgradeInfra={upgradeInfrastructure}
              onUpgradeIndustrial={upgradeIndustrialLevel}
              onUnlockDoctrine={unlockDoctrineType}
              onRecruit={recruitUnits}
              onBuyResource={buyResource}
            />
          )}

          <TacticalActionBar
            playerNationId={playerNationId}
            showHeatmap={showHeatmap}
            isAdvancing={isAdvancing}
            onResetSession={resetSession}
            onToggleHeatmap={() => setShowHeatmap((prev) => !prev)}
            onAdvanceTurn={advanceTurn}
          />

          <MapControls
            scale={scale}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetView={handleResetView}
          />
        </MapCanvasContainer>
      </div>

      {gameState && <TurnLogsTerminal logs={filteredLogs} />}

      {pendingSelection && (
        <SelectionModal
          countryName={pendingSelection.name}
          countryCode={pendingSelection.id}
          onConfirm={() =>
            selectNation(pendingSelection.id, pendingSelection.name)
          }
          onCancel={() => setPendingSelection(null)}
        />
      )}
    </div>
  );
}
