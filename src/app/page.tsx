"use client";

import React, { useState, useRef, useMemo } from "react";
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

import { BottomHud } from "@/presentation/components/tactical-map/hud/bottom-hud";
import { CommandDrawer } from "@/presentation/components/tactical-map/drawer/command-drawer";
import { SelectionModalWrapper } from "@/presentation/components/tactical-map/selection-modal-wrapper";
import { LoadingStateOverlay } from "@/presentation/components/tactical-map/loading-state-overlay";
import { ErrorStateOverlay } from "@/presentation/components/tactical-map/error-state-overlay";

import { TurnProgression } from "@/presentation/components/tactical-map/hud/turn-progression";
import { AssetRibbon } from "@/presentation/components/tactical-map/hud/asset-ribbon";
import { IntelligenceFeed } from "@/presentation/components/tactical-map/hud/intelligence-feed";

import { Play } from "lucide-react";
import { AnimatePresence } from "framer-motion";

export default function MapTest6Page() {
  const mapWidth = 4096;
  const mapHeight = 2048;

  const [activeMapMode] = useState<"default" | "edited" | "partition">(
    "partition",
  );
  const [selectedCountry, setSelectedCountry] = useState<{
    code: string;
    name: string;
  } | null>(null);
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
  } = useMapGesture();

  const {
    countries,
    loading: dataLoading,
    error: dataError,
    canvasSrcRef,
    canvasShadedRef,
    maskDataRef,
  } = useMapData({ mapWidth, mapHeight, mapMode: activeMapMode });

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
    gridState,
    executeAttack,
    buyResource,
    recruitUnits,
    updateTaxRate,
    declareWarDirectly,
    selectNation,
    gameState,
    filteredLogs,
    advanceTurn,
    isAdvancing,
    humanNation,
    rankings,
  } = useTacticalSimulationState((pending) => {
    if (pending) {
      const matched = countries.find((c) => c.code === pending.id);
      if (matched) {
        setPendingSelection({ id: `NATION_${matched.id}`, name: matched.name });
      }
    }
  });

  useMapGridRenderer(canvasDestRef, gridState, dataLoading, false);

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
    onSelectPending: (pending) => {
      if (!playerNationId && pending) {
        const matched = countries.find((c) => c.code === pending.id);
        if (matched) {
          setPendingSelection({
            id: `NATION_${matched.id}`,
            name: matched.name,
          });
        }
      } else if (playerNationId && pending) {
        const matched = countries.find((c) => c.code === pending.id);
        if (matched) {
          setSelectedCountry({
            code: `NATION_${matched.id}`,
            name: matched.name,
          });
        }
      }
    },
    onExecuteAttack: executeAttack,
  });

  return (
    <div
      className="w-screen h-screen bg-slate-950 overflow-hidden relative"
      dir="rtl"
    >
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
      />

      <LoadingStateOverlay loading={dataLoading} />
      <ErrorStateOverlay error={dataError} />

      <TurnProgression currentTurn={gameState?.currentTurn || 1} />

      <AssetRibbon nation={humanNation} />

      <BottomHud
        hoveredCountry={hoveredCountry}
        playerNationId={playerNationId}
        rankings={rankings || []}
        onAttack={() => {
          if (hoveredCountry) {
            executeAttack(hoveredCountry.code, { x: 0, y: 0 });
          }
        }}
        onDeclareWar={() => {
          if (hoveredCountry) {
            declareWarDirectly(`NATION_${hoveredCountry.id}`);
          }
        }}
        onManage={() => {
          if (hoveredCountry) {
            setSelectedCountry({
              code: `NATION_${hoveredCountry.id}`,
              name: hoveredCountry.name,
            });
          }
        }}
      />

      <IntelligenceFeed logs={filteredLogs || []} />

      <div className="absolute bottom-6 left-6 z-40 pointer-events-none">
        <button
          onClick={advanceTurn}
          disabled={isAdvancing}
          className="pointer-events-auto px-5 py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white rounded-2xl font-bold transition-all border border-emerald-500/20 shadow-lg shadow-emerald-950/20 text-xs font-sans flex items-center gap-2.5 cursor-pointer"
        >
          {isAdvancing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play size={13} className="fill-current rotate-180" />
          )}
          <span>{isAdvancing ? "محاسبه زمان..." : "پایان نوبت"}</span>
        </button>
      </div>

      <AnimatePresence>
        {selectedCountry && (
          <CommandDrawer
            countryCode={selectedCountry.code}
            countryName={selectedCountry.name}
            onClose={() => setSelectedCountry(null)}
            playerNationId={playerNationId}
            onRecruit={recruitUnits}
            onTrade={(resourceType, qty) => {
              buyResource(resourceType, qty);
            }}
            onTaxChange={updateTaxRate}
            onDeclareWar={() => {
              declareWarDirectly(selectedCountry.code);
              setSelectedCountry(null);
            }}
          />
        )}
      </AnimatePresence>

      <SelectionModalWrapper
        pendingSelection={pendingSelection}
        onConfirm={() => {
          if (pendingSelection) {
            selectNation(pendingSelection.id, pendingSelection.name);
          }
        }}
        onCancel={() => setPendingSelection(null)}
      />
    </div>
  );
}
