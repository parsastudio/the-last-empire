"use client";

import React, { useState, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { useGameResources } from "@/presentation/hooks/game/use-game-resources";
import { TopHudBar } from "@/presentation/components/tactical-map/hud/top-bar/top-hud-bar";
import { CommandRail } from "@/presentation/components/tactical-map/command-rail/command-rail";
import { TacticalModalOrchestrator } from "@/presentation/components/tactical-map/modals/tactical-modal-orchestrator";
import { GameOverDialogWrapper } from "@/presentation/components/tactical-map/modals/game-over-dialog-wrapper";
import { CampaignNotFoundModal } from "@/presentation/components/tactical-map/modals/campaign-not-found-modal";
import {
  LayerController,
  TacticalLayer,
} from "@/presentation/components/tactical-map/controls/layer-controller";
import { useMapCameraFocus } from "@/presentation/hooks/tactical-map/use-map-camera-focus";
import { useMapDimensions } from "@/presentation/hooks/tactical-map/use-map-dimensions";
import { CountryRegistry } from "@/domain/data/countries";
import { useBitPackedGame } from "@/presentation/hooks/game/final/use-bit-packed-game";
import { useUiStore } from "@/presentation/stores/use-ui-store";

const WebGLMapCanvas = dynamic(
  () =>
    import("@/presentation/components/tactical-map/final/webgl-map-canvas").then(
      (mod) => mod.WebGLMapCanvas,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-screen h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gdp border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  },
);

interface WebGLTacticalWorkspaceProps {
  gameId?: string;
}

export function WebGLTacticalWorkspace({
  gameId = "default_game",
}: WebGLTacticalWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef({ x: 0, y: 0 });
  const scaleRef = useRef(1);

  const dimensions = useMapDimensions(containerRef);

  const activeModal = useUiStore((state) => state.activeModal);
  const isRailCollapsed = useUiStore((state) => state.isRailCollapsed);
  const openModal = useUiStore((state) => state.openModal);
  const openCommandCenter = useUiStore((state) => state.openCommandCenter);
  const setIsRailCollapsed = useUiStore((state) => state.setIsRailCollapsed);
  const closeModal = useUiStore((state) => state.closeModal);

  const {
    gameState: effectiveGameState,
    advanceNextTurn,
    loading,
    error,
  } = useBitPackedGame(gameId);

  const metrics = useGameResources(effectiveGameState);
  const [activeLayer, setActiveLayer] = useState<TacticalLayer>("political");
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);

  const humanNation =
    effectiveGameState && effectiveGameState.humanNationId
      ? effectiveGameState.nations[effectiveGameState.humanNationId] || null
      : null;

  const { focusOnCountry } = useMapCameraFocus({
    mapWidth: 4096,
    mapHeight: 2048,
    dimensions,
    scaleRef,
    positionRef,
    provincesMap: effectiveGameState?.provinces,
  });

  const handleFocusCountryAndClose = useCallback(
    (iso3: string) => {
      focusOnCountry(iso3);
      closeModal();
    },
    [focusOnCountry, closeModal],
  );

  const handleSelectCountryContext = useCallback(
    (iso3: string) => {
      openCommandCenter("diplomacy", null, iso3);
    },
    [openCommandCenter],
  );

  const handleSelectCountryAttackContext = useCallback(
    (iso3: string, provinceId?: number) => {
      openModal({
        type: "DIRECT_ATTACK",
        targetNationId: iso3,
        targetProvinceId: provinceId ?? null,
      });
    },
    [openModal],
  );

  const handleNextTurnAndRefresh = useCallback(async () => {
    if (isProcessingTurn) return;
    try {
      setIsProcessingTurn(true);
      const nextState = await advanceNextTurn();
      if (nextState && !nextState.isGameOver) {
        openCommandCenter("reports");

        const justTriggeredCoalition =
          nextState.globalCoalition &&
          nextState.globalCoalition.triggeredTurn === nextState.currentTurn;

        if (justTriggeredCoalition && nextState.globalCoalition) {
          const targetCanonical = CountryRegistry.resolveCanonicalId(
            nextState.globalCoalition.targetNationId,
          );
          const humanCanonical = CountryRegistry.resolveCanonicalId(
            nextState.humanNationId,
          );
          const targetNation =
            nextState.nations[targetCanonical] ||
            nextState.nations[nextState.globalCoalition.targetNationId];

          openModal({
            type: "COALITION_ALERT",
            data: {
              targetNationId: nextState.globalCoalition.targetNationId,
              targetName: targetNation ? targetNation.name : "امپراتوری شما",
              targetFlagCode: targetNation?.flagCode || "IR",
              isHumanTarget: targetCanonical === humanCanonical,
              memberIds: nextState.globalCoalition.memberNationIds,
              turn: nextState.globalCoalition.triggeredTurn,
            },
          });
        }
      }
    } finally {
      setIsProcessingTurn(false);
    }
  }, [advanceNextTurn, isProcessingTurn, openCommandCenter, openModal]);

  const activeRailTab =
    activeModal?.type === "COMMAND_CENTER" ? activeModal.activeTab : null;

  const isNotFound = !loading && (error !== null || !effectiveGameState);

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen bg-background overflow-hidden relative"
      dir="rtl"
    >
      <WebGLMapCanvas
        provincesMap={effectiveGameState?.provinces}
        nationsMap={effectiveGameState?.nations}
        humanNationId={effectiveGameState?.humanNationId}
        activeLayer={activeLayer}
        positionRef={positionRef}
        scaleRef={scaleRef}
        onSelectCountryContext={handleSelectCountryContext}
        onSelectCountryAttackContext={handleSelectCountryAttackContext}
      />

      <TopHudBar metrics={metrics} />
      <GameOverDialogWrapper gameState={effectiveGameState} />
      <LayerController
        activeLayer={activeLayer}
        isRendering={false}
        onChangeLayer={setActiveLayer}
      />

      <CommandRail
        activeTab={activeRailTab}
        isCollapsed={isRailCollapsed}
        currentTurn={effectiveGameState ? effectiveGameState.currentTurn : 1}
        isProcessingTurn={isProcessingTurn}
        onSelectTab={(tab) => openCommandCenter(tab)}
        onToggleCollapse={() => setIsRailCollapsed((prev) => !prev)}
        onNextTurn={handleNextTurnAndRefresh}
      />

      <TacticalModalOrchestrator
        humanNation={humanNation}
        gameState={effectiveGameState}
        onFocusCountry={handleFocusCountryAndClose}
      />

      <CampaignNotFoundModal isOpen={isNotFound} gameId={gameId} />

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background z-50">
          <div className="w-12 h-12 border-4 border-gdp border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium font-sans text-xs">
            در حال بارگذاری موتور تاکتیکی و پرونده استراتژیک...
          </p>
        </div>
      )}
    </div>
  );
}
