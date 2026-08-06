"use client";

import React, { useState, useCallback, useRef } from "react";
import { useGameResources } from "@/presentation/hooks/game/use-game-resources";
import { WebGLMapCanvas } from "@/presentation/components/tactical-map/final/webgl-map-canvas";
import { TopHudBar } from "@/presentation/components/tactical-map/hud/top-bar/top-hud-bar";
import { CommandRail } from "@/presentation/components/tactical-map/command-rail/command-rail";
import { CommandCenterModal } from "@/presentation/components/tactical-map/command-center/command-center-modal";
import { GameOverDialogWrapper } from "@/presentation/components/tactical-map/modals/game-over-dialog-wrapper";
import { CampaignNotFoundModal } from "@/presentation/components/tactical-map/modals/campaign-not-found-modal";
import {
  LayerController,
  TacticalLayer,
} from "@/presentation/components/tactical-map/controls/layer-controller";
import { useMapCameraFocus } from "@/presentation/hooks/tactical-map/use-map-camera-focus";
import { ALL_COUNTRY_PROFILES } from "@/domain/data/countries";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { useBitPackedGame } from "@/presentation/hooks/game/final/use-bit-packed-game";

interface WebGLTacticalWorkspaceProps {
  gameId?: string;
}

export function WebGLTacticalWorkspace({
  gameId = "default_game",
}: WebGLTacticalWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [, setPosition] = useState({ x: 0, y: 0 });
  const [scale] = useState(1);

  const {
    gameState: effectiveGameState,
    advanceNextTurn,
    loading,
    error,
  } = useBitPackedGame(gameId);

  const metrics = useGameResources(effectiveGameState);

  const [activeTab, setActiveTab] = useState<SidebarTabType | null>(null);
  const [activeLayer, setActiveLayer] = useState<TacticalLayer>("political");
  const [selectedTargetCode, setSelectedTargetCode] = useState<string | null>(
    null,
  );
  const [isRailCollapsed, setIsRailCollapsed] = useState<boolean>(true);

  const countriesData = ALL_COUNTRY_PROFILES.map((p) => ({
    id: p.id ?? 0,
    code: p.code,
    name: p.nameFa,
    color: [0, 0, 0] as [number, number, number],
  }));

  const humanNation =
    effectiveGameState && effectiveGameState.humanNationId
      ? effectiveGameState.nations[effectiveGameState.humanNationId] || null
      : null;

  const { focusOnCountry } = useMapCameraFocus({
    mapWidth: 4096,
    mapHeight: 2048,
    dimensions: { width: 1200, height: 600 },
    scale,
    countries: countriesData,
    setPosition,
  });

  const handleSelectCountryContext = useCallback((code: string) => {
    setSelectedTargetCode(code);
    setActiveTab("diplomacy");
  }, []);

  const handleCloseCenterModal = useCallback(() => {
    setActiveTab(null);
    setSelectedTargetCode(null);
  }, []);

  const handleNextTurnAndRefresh = useCallback(async () => {
    const nextState = await advanceNextTurn();
    return nextState;
  }, [advanceNextTurn]);

  const isNotFound = !loading && (error !== null || !effectiveGameState);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen bg-background overflow-hidden relative"
      dir="rtl"
    >
      <WebGLMapCanvas
        countries={countriesData}
        nationsMap={effectiveGameState?.nations}
        humanNationId={effectiveGameState?.humanNationId}
        activeLayer={activeLayer}
        onSelectCountryContext={handleSelectCountryContext}
      />

      <TopHudBar metrics={metrics} />

      <GameOverDialogWrapper gameState={effectiveGameState} />

      <LayerController
        activeLayer={activeLayer}
        isRendering={false}
        onChangeLayer={setActiveLayer}
      />

      <CommandRail
        activeTab={activeTab}
        isCollapsed={isRailCollapsed}
        currentTurn={effectiveGameState ? effectiveGameState.currentTurn : 1}
        onSelectTab={(tab) => setActiveTab(tab)}
        onToggleCollapse={() => setIsRailCollapsed((prev) => !prev)}
        onNextTurn={handleNextTurnAndRefresh}
      />

      <CommandCenterModal
        activeTab={activeTab}
        selectedTargetCode={selectedTargetCode}
        nation={humanNation}
        gameState={effectiveGameState}
        reports={[]}
        onClose={handleCloseCenterModal}
        onFocusCountry={focusOnCountry}
        onNavigateTab={(tab, _subTab, targetCode) => {
          setActiveTab(tab);
          if (targetCode) {
            setSelectedTargetCode(targetCode);
          }
        }}
      />

      <CampaignNotFoundModal isOpen={isNotFound} gameId={gameId} />

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background z-50">
          <div className="w-12 h-12 border-4 border-gdp border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium font-sans text-xs">
            در حال بارگذاری موتور WebGL2 و استیت باینری...
          </p>
        </div>
      )}
    </div>
  );
}
