import React from "react";
import { SidebarTabType } from "./sidebar-tabs";
import { CommandRail } from "../command-rail/command-rail";
import { CommandCenterModal } from "../command-center/command-center-modal";
import { TurnStagingLedger } from "./staging/turn-staging-ledger";
import { TradeActionDialog } from "./tabs/market/trade-action-dialog";
import { useSidebarTurnActions } from "./hooks/use-sidebar-turn-actions";
import { GameState } from "@/domain/game/game-state.schema";

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

  if (!isOpen) return null;

  const effectiveTargetCode = actions.selectedTargetCode || selectedTargetCode;

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
      />

      {!actions.isRailCollapsed && (
        <div className="fixed bottom-20 right-4 w-48 z-40">
          <TurnStagingLedger
            stagedActions={actions.stagedActions}
            onClearStaged={() => {}}
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
      />

      <TradeActionDialog
        isOpen={actions.tradeDialog.isOpen}
        resourceName={actions.tradeDialog.resourceName}
        unit={actions.tradeDialog.unit}
        mode={actions.tradeDialog.mode}
        unitPrice={actions.tradeDialog.unitPrice}
        maxAmount={actions.tradeDialog.maxAmount}
        nationId={actions.humanNation?.id}
        onClose={() =>
          actions.setTradeDialog((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={() =>
          actions.setTradeDialog((prev) => ({ ...prev, isOpen: false }))
        }
      />
    </>
  );
}
