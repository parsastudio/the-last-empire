import React from "react";
import { SidebarTabType } from "./sidebar-tabs";
import { CommandRail } from "../command-rail/command-rail";
import { CommandCenterModal } from "../command-center/command-center-modal";
import { TurnSummaryModal } from "../reports/turn-summary-modal";
import { TurnStagingLedger } from "./staging/turn-staging-ledger";
import { TurnEventDialog } from "./dialogs/turn-event-dialog";
import { MarketTradeDialogWrapper } from "./dialogs/market-trade-dialog-wrapper";
import { useSidebarTurnActions } from "./hooks/use-sidebar-turn-actions";

interface SidebarContainerProps {
  isOpen: boolean;
  externalActiveTab?: SidebarTabType | null;
  selectedTargetCode?: string | null;
  onClearExternalTab?: () => void;
  onFocusCountry?: (code: string) => void;
}

export function SidebarContainer({
  isOpen,
  externalActiveTab,
  selectedTargetCode,
  onClearExternalTab,
  onFocusCountry,
}: SidebarContainerProps) {
  const actions = useSidebarTurnActions(externalActiveTab, onClearExternalTab);

  if (!isOpen) return null;

  return (
    <>
      <CommandRail
        activeTab={actions.activeTab}
        isCollapsed={actions.isRailCollapsed}
        currentTurn={actions.currentTurn}
        onSelectTab={actions.setInternalActiveTab}
        onToggleCollapse={() => actions.setIsRailCollapsed((prev) => !prev)}
        onNextTurn={actions.handleNextTurn}
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
        selectedTargetCode={selectedTargetCode}
        nation={actions.humanNation}
        reports={actions.realReports}
        onClose={actions.handleCloseActiveModal}
        onFocusCountry={onFocusCountry}
        onSelectReport={(report) => {
          actions.setModalReports([report]);
          actions.setIsModalOpen(true);
        }}
        onOpenTrade={actions.handleOpenTrade}
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
    </>
  );
}
