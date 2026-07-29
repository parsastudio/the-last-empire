import React from "react";
import {
  MapContextMenu,
  ContextActionType,
} from "../context-menu/map-context-menu";
import { AttackPlanningModal } from "../modals/attack-planning-modal";
import { TopHudBar } from "../hud/top-bar/top-hud-bar";
import { HumanResourceMetrics } from "@/presentation/hooks/game/use-game-resources";
import { StrategicToastContainer } from "@/presentation/components/common/strategic-toast-container";
import { GameOverDialogWrapper } from "../modals/game-over-dialog-wrapper";
import { GameState } from "@/domain/game/game-state.schema";

interface TacticalMapOverlayProps {
  metrics: HumanResourceMetrics;
  gameState?: GameState | null;
  contextMenuState: {
    coordinate: { x: number; y: number };
    countryId: number;
    countryCode: string;
    countryName: string;
  } | null;
  activeScreenPos: { x: number; y: number };
  attackModalState: {
    isOpen: boolean;
    targetName: string;
    targetCode: string;
    coordinate: { x: number; y: number };
  } | null;
  onSelectAction: (action: ContextActionType) => void;
  onCloseContextMenu: () => void;
  onCloseAttackModal: () => void;
  onOpenPendingDecisions?: (tab?: string) => void;
}

export function TacticalMapOverlay({
  metrics,
  gameState = null,
  contextMenuState,
  activeScreenPos,
  attackModalState,
  onSelectAction,
  onCloseContextMenu,
  onCloseAttackModal,
  onOpenPendingDecisions,
}: TacticalMapOverlayProps) {
  const targetRelation = attackModalState
    ? metrics.nation?.relations[attackModalState.targetCode]
    : null;

  const currentStance = targetRelation?.stance || "PEACE";

  return (
    <>
      <TopHudBar
        metrics={metrics}
        onOpenPending={(tab) => onOpenPendingDecisions?.(tab)}
      />

      <StrategicToastContainer />

      <GameOverDialogWrapper gameState={gameState} />

      {contextMenuState && (
        <div
          className="absolute pointer-events-none z-40 w-5 h-5 rounded-full bg-military/60 border-2 border-military shadow-lg animate-ping -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${activeScreenPos.x}px`,
            top: `${activeScreenPos.y}px`,
          }}
        />
      )}

      {contextMenuState && (
        <MapContextMenu
          position={activeScreenPos}
          countryName={contextMenuState.countryName}
          countryCode={contextMenuState.countryCode}
          onSelectAction={onSelectAction}
          onClose={onCloseContextMenu}
        />
      )}

      {attackModalState && (
        <AttackPlanningModal
          isOpen={attackModalState.isOpen}
          attackerName={metrics.nation?.name || "کشور شما"}
          attackerCode={metrics.nation?.id || "NATION_118"}
          targetName={attackModalState.targetName}
          targetCode={attackModalState.targetCode}
          coordinate={attackModalState.coordinate}
          stance={currentStance}
          userOilStock={metrics.oil}
          userTreasury={metrics.treasury}
          availableMilitary={metrics.nation?.military}
          onClose={onCloseAttackModal}
          onConfirmAttack={() => {
            onCloseAttackModal();
          }}
        />
      )}
    </>
  );
}
