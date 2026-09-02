import React from "react";
import { useUiStore } from "@/presentation/stores/use-ui-store";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { CommandCenterModal } from "@/presentation/components/tactical-map/command-center/command-center-modal";
import { DirectAttackModal } from "@/presentation/components/tactical-map/modals/direct-attack-modal";
import { BuyProvinceModal } from "@/presentation/components/tactical-map/modals/buy-province-modal";
import { PeaceNegotiationModal } from "@/presentation/components/tactical-map/sidebar/tabs/diplomacy/modals/peace-negotiation-modal";
import { BattleDebriefModal } from "@/presentation/components/tactical-map/command-center/views/reports/modals/battle-debrief-modal";
import { CoalitionAlertModal } from "@/presentation/components/tactical-map/modals/coalition-alert-modal";
import { ExportSalesDetailsModal } from "@/presentation/components/tactical-map/command-center/views/reports/modals/export-sales-details-modal";
import { DilemmaModal } from "@/presentation/components/tactical-map/modals/dilemma-modal";

interface TacticalModalOrchestratorProps {
  humanNation: Nation | null;
  gameState: GameState | null;
  onFocusCountry: (code: string) => void;
}

export function TacticalModalOrchestrator({
  humanNation,
  gameState,
  onFocusCountry,
}: TacticalModalOrchestratorProps) {
  const activeModal = useUiStore((state) => state.activeModal);
  const closeModal = useUiStore((state) => state.closeModal);
  const openCommandCenter = useUiStore((state) => state.openCommandCenter);

  if (gameState?.activeDilemma && humanNation) {
    return (
      <DilemmaModal
        isOpen={true}
        dilemma={gameState.activeDilemma}
        humanNationId={humanNation.id}
        onClose={closeModal}
      />
    );
  }

  if (!activeModal) return null;

  switch (activeModal.type) {
    case "COMMAND_CENTER":
      return (
        <CommandCenterModal
          activeTab={activeModal.activeTab}
          activeSubTab={activeModal.activeSubTab}
          selectedTargetCode={activeModal.selectedTargetCode}
          nation={humanNation}
          gameState={gameState}
          onClose={closeModal}
          onFocusCountry={onFocusCountry}
          onNavigateTab={(
            tab: SidebarTabType,
            subTab?: string,
            targetCode?: string,
          ) => {
            openCommandCenter(tab, subTab, targetCode);
          }}
        />
      );

    case "DIRECT_ATTACK":
      return (
        <DirectAttackModal
          isOpen={true}
          targetNationId={activeModal.targetNationId}
          targetProvinceId={activeModal.targetProvinceId}
          humanNation={humanNation}
          gameState={gameState}
          onClose={closeModal}
        />
      );

    case "BUY_PROVINCE":
      return (
        <BuyProvinceModal
          isOpen={true}
          provinceId={activeModal.provinceId}
          humanNation={humanNation}
          provincesMap={gameState?.provinces}
          nationsMap={gameState?.nations}
          onClose={closeModal}
        />
      );

    case "PEACE_NEGOTIATION":
      return (
        <PeaceNegotiationModal
          isOpen={true}
          humanNation={humanNation}
          targetNationId={activeModal.targetNationId}
          nationsMap={gameState?.nations}
          provincesMap={gameState?.provinces}
          onClose={closeModal}
        />
      );

    case "BATTLE_DEBRIEF":
      return (
        <BattleDebriefModal
          isOpen={true}
          reportData={activeModal.reportData}
          nationsMap={gameState?.nations}
          humanNationId={gameState?.humanNationId}
          onClose={closeModal}
        />
      );

    case "COALITION_ALERT":
      return (
        <CoalitionAlertModal
          isOpen={true}
          data={activeModal.data}
          nationsMap={gameState?.nations}
          onClose={closeModal}
        />
      );

    case "EXPORT_SALES":
      return (
        <ExportSalesDetailsModal
          isOpen={true}
          data={activeModal.data}
          nationsMap={gameState?.nations}
          onClose={closeModal}
        />
      );

    case "DILEMMA":
      return (
        <DilemmaModal
          isOpen={true}
          dilemma={activeModal.event}
          humanNationId={humanNation?.id || ""}
          onClose={closeModal}
        />
      );

    case "VICTORY_DEBRIEF":
    default:
      return null;
  }
}
