"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMapGesture } from "./hooks/use-map-gesture";
import { MapControls } from "./components/map-controls";
import { useMapData } from "./hooks/use-map-data";
import { useMapMouse } from "./hooks/use-map-mouse";
import { MapHeader } from "./components/map-header";
import { MapHoverCard } from "./components/map-hover-card";
import { useMapGridRenderer } from "./hooks/use-map-grid-renderer";
import { GridStateProvider } from "@/engine/combat/state/grid-state-provider";
import { SelectionModal } from "./components/selection-modal";
import { TacticalSidePanel } from "./components/tactical-side-panel";
import { CampaignLogOverlay } from "./components/campaign-log-overlay";
import { NextTurnButton } from "./components/next-turn-button";
import { CountryStatusIndicator } from "./components/country-status-indicator";
import { InteractionOverlay } from "./components/interaction-overlay";
import { ResetSessionButton } from "./components/reset-session-button";
import { SovereignControlHud } from "./components/sovereign-control-hud";
import { EconomyAdjuster } from "./components/economy-adjuster";
import { RecruitmentCenter } from "./components/recruitment-center";
import { MarketPricesWidget } from "./components/market-prices-widget";
import { ActiveWarsList } from "./components/active-wars-list";
import { useNationSelector } from "./hooks/use-nation-selector";
import { useTacticalAttack } from "./hooks/use-tactical-attack";
import { useTurnProgression } from "./hooks/use-turn-progression";
import { useSessionState } from "./hooks/use-session-state";
import { useMapEngine } from "./hooks/use-map-engine";
import { useLocalMarketTrade } from "./hooks/use-local-market-trade";
import { useLocalRecruitment } from "./hooks/use-local-recruitment";
import { useLocalEconomyControl } from "./hooks/use-local-economy-control";
import { GridCombatBridge } from "./engine/grid-combat-bridge";

export default function MapTest6Page() {
  const mapWidth = 4096;
  const mapHeight = 2048;

  const [dimensions, setDimensions] = useState({ width: 1200, height: 600 });
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const canvasDestRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const bridge = useRef(new GridCombatBridge());

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

  const { hoveredCountry, handlePointerMove, setHoveredCountry } = useMapMouse({
    canvasDestRef,
    maskDataRef,
    countries,
    position,
    scale,
    mapWidth,
    mapHeight,
  });

  const { playerNationId, setPlayerNationId, resetSession } = useSessionState();

  const {
    gameState,
    initializeGame,
    dispatchAction,
    processNextTurn,
    gridState,
  } = useMapEngine(playerNationId);

  const { buyResource } = useLocalMarketTrade(playerNationId, dispatchAction);
  const { recruitUnits } = useLocalRecruitment(playerNationId, dispatchAction);
  const { updateTaxRate } = useLocalEconomyControl(
    playerNationId,
    dispatchAction,
  );

  useMapGridRenderer(canvasDestRef, gridState, dataLoading, showHeatmap);

  const { selectNation } = useNationSelector((id) => {
    setPlayerNationId(id);
    setPendingSelection(null);
    initializeGame(id);
  });

  const { executeAttack, isAttacking } = useTacticalAttack(
    playerNationId,
    () => {
      if (playerNationId) {
        initializeGame(playerNationId);
      }
    },
  );

  const { advanceTurn, isAdvancing } = useTurnProgression(() => {
    processNextTurn();
  });

  useEffect(() => {
    if (playerNationId && !gameState) {
      initializeGame(playerNationId);
    }
  }, [playerNationId, gameState, initializeGame]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, [dataLoading]);

  useEffect(() => {
    const canvasDest = canvasDestRef.current;
    const canvasShaded = canvasShadedRef.current;
    if (!canvasDest || !canvasShaded || dataLoading) return;

    const ctxDest = canvasDest.getContext("2d");
    if (!ctxDest) return;

    const dpr = window.devicePixelRatio || 1;

    canvasDest.width = dimensions.width * dpr;
    canvasDest.height = dimensions.height * dpr;

    ctxDest.imageSmoothingEnabled = true;

    const fx = mapWidth / dimensions.width;
    const fy = mapHeight / dimensions.height;

    const sx = (-position.x / scale) * fx;
    const sy = (-position.y / scale) * fy;
    const sWidth = (dimensions.width / scale) * fx;
    const sHeight = (dimensions.height / scale) * fy;

    ctxDest.fillStyle = "rgb(15, 20, 30)";
    ctxDest.fillRect(0, 0, canvasDest.width, canvasDest.height);

    ctxDest.drawImage(
      canvasShaded,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      canvasDest.width,
      canvasDest.height,
    );
  }, [scale, position, dataLoading, countries, canvasShadedRef, dimensions]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging || !hoveredCountry || dataLoading) {
      return;
    }

    const rect = canvasDestRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const fx = mapWidth / rect.width;
    const fy = mapHeight / rect.height;

    const mapX = Math.floor(((clientX - position.x) / scale) * fx);
    const mapY = Math.floor(((clientY - position.y) / scale) * fy);

    const gridCoord = bridge.current.mapHighResToGridCell({ x: mapX, y: mapY });

    if (!playerNationId) {
      setPendingSelection({
        id: hoveredCountry.code,
        name: hoveredCountry.name,
      });
    } else if (hoveredCountry.code !== playerNationId) {
      executeAttack(hoveredCountry.code, gridCoord);
    }
  };

  const humanNation =
    gameState && playerNationId ? gameState.nations[playerNationId] : null;

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
        <TacticalSidePanel state={gameState} humanNationId={playerNationId} />
      )}

      <div className="flex-1 flex flex-col relative h-full">
        <MapHeader isCached={isCached} countriesCount={countries.length} />

        <div
          ref={containerRef}
          className={`flex-1 relative bg-slate-950 overflow-hidden cursor-grab ${
            isDragging ? "cursor-grabbing" : ""
          }`}
          onMouseDown={handleMouseDown}
          onMouseMove={(e) => {
            handleMouseMove(e);
            handlePointerMove(e);
          }}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            handleMouseUp();
            setHoveredCountry(null);
          }}
          onWheel={handleWheel}
          onClick={handleCanvasClick}
        >
          <canvas ref={canvasSrcRef} className="hidden" />

          <div className="w-full h-full absolute inset-0">
            <canvas
              ref={canvasDestRef}
              className="pointer-events-none w-full h-full"
              style={{
                filter:
                  "drop-shadow(0 2px 4px rgba(25, 35, 55, 0.15)) drop-shadow(0 1px 2px rgba(25, 35, 55, 0.08))",
              }}
            />
          </div>

          {gameState && playerNationId && (
            <CountryStatusIndicator
              state={gameState}
              humanNationId={playerNationId}
            />
          )}

          {gameState &&
            playerNationId &&
            hoveredCountry &&
            hoveredCountry.code !== playerNationId && (
              <InteractionOverlay
                targetCell={bridge.current.mapHighResToGridCell({
                  x: Math.floor(
                    ((dimensions.width / 2 - position.x) / scale) *
                      (mapWidth / dimensions.width),
                  ),
                  y: Math.floor(
                    ((dimensions.height / 2 - position.y) / scale) *
                      (mapHeight / dimensions.height),
                  ),
                })}
                targetCountryName={hoveredCountry.name}
                targetCountryId={hoveredCountry.code}
                onAttack={() => {
                  const rect = canvasDestRef.current?.getBoundingClientRect();
                  if (rect) {
                    const cx = rect.width / 2;
                    const cy = rect.height / 2;
                    const fx = mapWidth / rect.width;
                    const fy = mapHeight / rect.height;
                    const mapX = Math.floor(((cx - position.x) / scale) * fx);
                    const mapY = Math.floor(((cy - position.y) / scale) * fy);
                    const gridCoord = bridge.current.mapHighResToGridCell({
                      x: mapX,
                      y: mapY,
                    });
                    executeAttack(hoveredCountry.code, gridCoord);
                  }
                }}
                isAttacking={isAttacking}
              />
            )}

          {gameState && playerNationId && humanNation && (
            <div className="absolute top-20 right-4 w-72 space-y-3 z-40">
              <EconomyAdjuster
                currentTaxRate={humanNation.taxRate}
                onTaxChange={updateTaxRate}
              />
              <RecruitmentCenter
                onRecruit={recruitUnits}
                infantryCost={1000}
                airForceCost={1000}
              />
              <MarketPricesWidget
                prices={gameState.marketPrices}
                oilInventory={humanNation.resources.oil}
                steelInventory={humanNation.resources.steel}
                onBuyResource={buyResource}
              />
              <ActiveWarsList relations={humanNation.relations} />
            </div>
          )}

          <div className="absolute top-4 right-4 z-50 flex items-center gap-3">
            <ResetSessionButton onReset={resetSession} />
            <button
              onClick={() => setShowHeatmap((prev) => !prev)}
              className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-mono font-bold hover:bg-slate-800 transition-colors"
            >
              {showHeatmap
                ? "DISABLE TACTICAL HEATMAP"
                : "ENABLE TACTICAL HEATMAP"}
            </button>
            {playerNationId && (
              <NextTurnButton
                onAdvance={advanceTurn}
                isAdvancing={isAdvancing}
              />
            )}
          </div>

          <MapControls
            scale={scale}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onResetView={handleResetView}
          />

          {hoveredCountry && <MapHoverCard hoveredCountry={hoveredCountry} />}

          {gameState && <CampaignLogOverlay logs={gameState.turnLogs} />}

          {humanNation && <SovereignControlHud nation={humanNation} />}
        </div>
      </div>

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
