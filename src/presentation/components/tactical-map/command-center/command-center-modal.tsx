import React from "react";
import { SidebarTabType } from "../sidebar/sidebar-tabs";
import { CommandCenterTabRouter } from "./command-center-tab-router";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { getCommandCenterMeta } from "./config/command-center-meta.config";
import { CommandCenterHeader } from "./command-center-header";

interface CommandCenterModalProps {
  activeTab: SidebarTabType | null;
  activeSubTab?: string | null;
  selectedTargetCode?: string | null;
  nation: Nation | null;
  gameState?: GameState | null;
  reports: CombatReport[];
  onClose: () => void;
  onNavigateTab: (
    tab: SidebarTabType,
    subTab?: string,
    targetCode?: string,
  ) => void;
  onFocusCountry?: (code: string) => void;
  onOpenTrade: (
    name: string,
    unit: string,
    mode: "buy" | "sell",
    price: number,
  ) => void;
}

export function CommandCenterModal({
  activeTab,
  activeSubTab,
  selectedTargetCode,
  nation,
  gameState,
  reports,
  onClose,
  onNavigateTab,
  onFocusCountry,
  onOpenTrade,
}: CommandCenterModalProps) {
  if (!activeTab || !nation) return null;

  const meta = getCommandCenterMeta(activeTab, nation.name);

  return (
    <UnifiedModalShell
      isOpen={activeTab !== null}
      title={meta.title}
      subtitle={meta.subtitle}
      maxWidthClass="max-w-6xl"
      onClose={onClose}
    >
      <div className="space-y-4">
        <CommandCenterHeader
          activeTab={activeTab}
          subTabLabel={activeSubTab}
          targetName={selectedTargetCode}
          onNavigateTab={onNavigateTab}
        />

        <CommandCenterTabRouter
          activeTab={activeTab}
          activeSubTab={activeSubTab}
          selectedTargetCode={selectedTargetCode}
          nation={nation}
          gameState={gameState}
          reports={reports}
          onFocusCountry={onFocusCountry}
          onOpenTrade={onOpenTrade}
          onNavigateTab={onNavigateTab}
        />
      </div>
    </UnifiedModalShell>
  );
}
