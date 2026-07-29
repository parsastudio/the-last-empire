import React, { useState } from "react";
import { SidebarTabType } from "./sidebar-tabs";
import { CommandRail } from "../command-rail/command-rail";
import { CommandCenterModal } from "../command-center/command-center-modal";
import { TurnSummaryModal } from "../reports/turn-summary-modal";
import { TurnStagingLedger } from "./staging/turn-staging-ledger";
import { TurnEventDialog } from "./dialogs/turn-event-dialog";
import { MarketTradeDialogWrapper } from "./dialogs/market-trade-dialog-wrapper";
import { useSidebarTurnActions } from "./hooks/use-sidebar-turn-actions";
import { GameState } from "@/domain/game/game-state.schema";
import { CommandPaletteModal } from "../navigation/command-palette-modal";
import { GameSettingsModal } from "../modals/game-settings-modal";
import { GameGuideModal } from "../modals/game-guide-modal";
import { OverviewTreeModal } from "../navigation/overview-tree-modal";
import { useModalKeyboardListener } from "../navigation/hooks/use-modal-keyboard-listener";

interface SidebarContainerProps {
  isOpen: boolean;
  gameId?: string;
  gameState?: GameState | null;
  advanceNextTurn?: () => Promise<GameState | null>;
  externalActiveTab?: SidebarTabType | null;
  selectedTargetCode?: string | null;
  onClearExternalTab?: () => void;
  onFocusCountry?: (code: string) => void;
}

export function SidebarContainer({
  isOpen,
  gameId,
  gameState,
  advanceNextTurn,
  externalActiveTab,
  selectedTargetCode,
  onClearExternalTab,
  onFocusCountry,
}: SidebarContainerProps) {
  const actions = useSidebarTurnActions(
    externalActiveTab,
    onClearExternalTab,
    gameId,
    gameState,
    advanceNextTurn,
  );

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isOverviewTreeOpen, setIsOverviewTreeOpen] = useState(false);

  useModalKeyboardListener({
    onOpenCommandPalette: () => setIsCommandPaletteOpen(true),
    onOpenSettings: () => setIsSettingsOpen(true),
    onOpenGuide: () => setIsGuideOpen(true),
  });

  if (!isOpen) return null;

  const effectiveTargetCode = actions.selectedTargetCode || selectedTargetCode;

  const handleSelectTreeNode = (tab: SidebarTabType, subTab?: string) => {
    actions.handleNavigateTab(tab, subTab, effectiveTargetCode || undefined);
  };

  return (
    <>
      <CommandRail
        activeTab={actions.activeTab}
        isCollapsed={actions.isRailCollapsed}
        currentTurn={actions.currentTurn}
        isProcessingTurn={actions.isProcessingTurn}
        onSelectTab={actions.setInternalActiveTab}
        onToggleCollapse={() => actions.setIsRailCollapsed((prev) => !prev)}
        onNextTurn={actions.handleNextTurn}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {!actions.isRailCollapsed && (
        <div className="fixed bottom-20 right-4 w-48 z-40">
          <TurnStagingLedger
            stagedActions={actions.stagedActions}
            onClearStaged={() => actions.setStagedActions([])}
          />
        </div>
      )}

      <CommandCenterModal
        activeTab={actions.activeTab}
        activeSubTab={actions.activeSubTab}
        selectedTargetCode={effectiveTargetCode}
        nation={actions.humanNation}
        gameState={actions.gameState}
        reports={actions.realReports}
        onClose={actions.handleCloseActiveModal}
        onFocusCountry={onFocusCountry}
        onOpenTrade={actions.handleOpenTrade}
        onNavigateTab={(tab, subTab, targetCode) =>
          actions.handleNavigateTab(tab, subTab, targetCode)
        }
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenOverviewTree={() => setIsOverviewTreeOpen(true)}
      />

      <TurnSummaryModal
        isOpen={actions.isModalOpen}
        reports={actions.modalReports}
        onClose={() => actions.setIsModalOpen(false)}
      />

      <TurnEventDialog
        isOpen={actions.isEventModalOpen}
        onClose={() => actions.setIsEventModalOpen(false)}
      />

      <MarketTradeDialogWrapper
        state={actions.tradeDialog}
        onClose={() =>
          actions.setTradeDialog((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={() =>
          actions.setTradeDialog((prev) => ({ ...prev, isOpen: false }))
        }
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectNode={handleSelectTreeNode}
      />

      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <GameGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <OverviewTreeModal
        isOpen={isOverviewTreeOpen}
        onClose={() => setIsOverviewTreeOpen(false)}
        onSelectNode={handleSelectTreeNode}
      />
    </>
  );
}
