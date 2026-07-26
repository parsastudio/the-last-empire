"use client";

import React, { useState, useMemo, useRef } from "react";
import { useMapGesture } from "@/presentation/hooks/tactical-map/use-map-gesture";
import { useMapDimensions } from "@/presentation/hooks/tactical-map/use-map-dimensions";
import { useMapData } from "@/presentation/hooks/tactical-map/use-map-data";
import { useMapMouse } from "@/presentation/hooks/tactical-map/use-map-mouse";
import { useMapGridRenderer } from "@/presentation/hooks/tactical-map/use-map-grid-renderer";
import { useTacticalSimulationState } from "@/presentation/hooks/tactical-map/use-tactical-simulation-state";
import { useCanvasRenderer } from "@/presentation/hooks/tactical-map/use-canvas-renderer";
import { useCanvasClickHandler } from "@/presentation/hooks/tactical-map/use-canvas-click-handler";
import { GridCombatBridge } from "@/application/map-rendering/grid-combat-bridge";
import { TacticalViewport } from "@/presentation/components/tactical-map/layout/tactical-viewport";
import { LeftCommandHub } from "@/presentation/components/tactical-map/sidebar/left-command-hub";
import { TurnEventsTerminal } from "@/presentation/components/tactical-map/terminal/turn-events-terminal";
import { HoverTargetOverlay } from "@/presentation/components/tactical-map/overlay/hover-target-overlay";
import { SelectionModal } from "@/presentation/components/tactical-map/selection-modal";
import { MinimalHeader } from "@/presentation/components/tactical-map/layout/minimal-header";

export default function MapTest6Page() {
  const mapWidth = 4096;
  const mapHeight = 2048;

  const [showHeatmap] = useState(false);
  const [useEdited, setUseEdited] = useState(false);
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
    handleResetView,
  } = useMapGesture();

  const {
    countries,
    loading: dataLoading,
    error,
    canvasSrcRef,
    canvasShadedRef,
    maskDataRef,
  } = useMapData({ mapWidth, mapHeight, useEdited });

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

  const targetCell = useMemo(() => {
    return bridge.mapHighResToGridCell({
      x: Math.floor(
        ((dimensions.width / 2 - position.x) / scale) *
          (mapWidth / dimensions.width),
      ),
      y: Math.floor(
        ((dimensions.height / 2 - position.y) / scale) *
          (mapHeight / dimensions.height),
      ),
    });
  }, [dimensions, position, scale, bridge, mapWidth, mapHeight]);

  return (
    <div className="w-screen h-screen bg-slate-950 text-white flex flex-row overflow-hidden select-none font-sans text-left relative">
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

      <TacticalViewport
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
        {gameState && playerNationId && humanNation && (
          <>
            <MinimalHeader
              currentTurn={gameState.currentTurn}
              onResetSession={resetSession}
              onAdvanceTurn={advanceTurn}
              isAdvancing={isAdvancing}
            />

            <div className="absolute top-4 left-36 z-40 bg-slate-950/90 border border-slate-900 rounded-2xl p-0.5 flex text-[10px] font-mono shadow-xl pointer-events-auto">
              <button
                onClick={() => setUseEdited(false)}
                className={`px-3 py-1.5 rounded-xl transition-all ${!useEdited ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
              >
                DEFAULT TOPOLOGY
              </button>
              <button
                onClick={() => setUseEdited(true)}
                className={`px-3 py-1.5 rounded-xl transition-all ${useEdited ? "bg-emerald-600 text-white font-bold" : "text-slate-400 hover:text-slate-200"}`}
              >
                EDITED MASK
              </button>
            </div>

            <LeftCommandHub
              gameState={gameState}
              humanNation={humanNation}
              playerNationId={playerNationId}
              rankings={rankings}
              onTaxChange={updateTaxRate}
              onUpgradeInfra={upgradeInfrastructure}
              onUpgradeIndustrial={upgradeIndustrialLevel}
              onUnlockDoctrine={unlockDoctrineType}
              onRecruit={recruitUnits}
              onBuyResource={buyResource}
              onPropose={(type) => {
                if (hoveredCountry) proposeDiplomacy(hoveredCountry.code, type);
              }}
              onDeclareWar={() => {
                if (hoveredCountry) declareWarDirectly(hoveredCountry.code);
              }}
              onResetView={handleResetView}
            />

            <HoverTargetOverlay
              targetCell={targetCell}
              hoveredCountry={hoveredCountry}
              onAttack={() => {
                if (hoveredCountry)
                  executeAttack(hoveredCountry.code, targetCell);
              }}
              isAttacking={isAttacking}
              playerNationId={playerNationId}
            />

            <TurnEventsTerminal logs={filteredLogs} />
          </>
        )}
      </TacticalViewport>

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
