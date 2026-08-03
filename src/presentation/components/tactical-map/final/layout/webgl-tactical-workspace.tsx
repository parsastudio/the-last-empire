"use client";

import React, { useState } from "react";
import { useBitPackedGame } from "@/presentation/hooks/game/final/use-bit-packed-game";
import { useGameResources } from "@/presentation/hooks/game/use-game-resources";
import { WebGLMapCanvas } from "@/presentation/components/tactical-map/final/webgl-map-canvas";
import { TopHudBar } from "@/presentation/components/tactical-map/hud/top-bar/top-hud-bar";
import { CommandRail } from "@/presentation/components/tactical-map/command-rail/command-rail";
import { CommandCenterModal } from "@/presentation/components/tactical-map/command-center/command-center-modal";
import { StrategicToastContainer } from "@/presentation/components/common/strategic-toast-container";
import { GameOverDialogWrapper } from "@/presentation/components/tactical-map/modals/game-over-dialog-wrapper";
import { CampaignNotFoundModal } from "@/presentation/components/tactical-map/modals/campaign-not-found-modal";
import { MapEngineToggle } from "@/presentation/components/tactical-map/final/controls/map-engine-toggle";
import { ALL_COUNTRY_PROFILES } from "@/domain/data/countries";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";

interface WebGLTacticalWorkspaceProps {
  gameId?: string;
}

export function WebGLTacticalWorkspace({
  gameId = "default_game",
}: WebGLTacticalWorkspaceProps) {
  const { gameState, advanceNextTurn, loading, error } =
    useBitPackedGame(gameId);

  const metrics = useGameResources(gameState);
  const [activeTab, setActiveTab] = useState<SidebarTabType | null>(null);
  const [isRailCollapsed, setIsRailCollapsed] = useState<boolean>(true);

  const countriesData = ALL_COUNTRY_PROFILES.map((p) => ({
    id: p.id ?? 0,
    code: p.code,
    name: p.nameFa,
    color: [0, 0, p.id ?? 0] as [number, number, number],
  }));

  const humanNation =
    gameState && gameState.humanNationId
      ? gameState.nations[gameState.humanNationId] || null
      : null;

  const isNotFound = !loading && (error !== null || !gameState);

  return (
    <div
      className="w-screen h-screen bg-background overflow-hidden relative"
      dir="rtl"
    >
      <WebGLMapCanvas countries={countriesData} />

      <TopHudBar metrics={metrics} />
      <MapEngineToggle currentEngine="webgl2" gameId={gameId} />

      <StrategicToastContainer />
      <GameOverDialogWrapper gameState={gameState} />

      <CommandRail
        activeTab={activeTab}
        isCollapsed={isRailCollapsed}
        currentTurn={gameState ? gameState.currentTurn : 1}
        onSelectTab={(tab) => setActiveTab(tab)}
        onToggleCollapse={() => setIsRailCollapsed((prev) => !prev)}
        onNextTurn={advanceNextTurn}
      />

      <CommandCenterModal
        activeTab={activeTab}
        nation={humanNation}
        gameState={gameState}
        reports={[]}
        onClose={() => setActiveTab(null)}
        onOpenTrade={() => {}}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      <CampaignNotFoundModal isOpen={isNotFound} gameId={gameId} />

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background z-50">
          <div className="w-12 h-12 border-4 border-gdp border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium font-sans text-xs">
            در حال بارگذاری نقشه WebGL2...
          </p>
        </div>
      )}
    </div>
  );
}
