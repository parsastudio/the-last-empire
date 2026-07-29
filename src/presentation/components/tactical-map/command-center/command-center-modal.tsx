import React from "react";
import { SidebarTabType } from "../sidebar/sidebar-tabs";
import { CommandCenterTabRouter } from "./command-center-tab-router";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { getCommandCenterMeta } from "./config/command-center-meta.config";

interface CommandCenterModalProps {
  activeTab: SidebarTabType | null;
  selectedTargetCode?: string | null;
  nation: Nation | null;
  gameState?: GameState | null;
  reports: CombatReport[];
  onClose: () => void;
  onFocusCountry?: (code: string) => void;
  onSelectReport: (report: CombatReport) => void;
  onOpenTrade: (
    name: string,
    unit: string,
    mode: "buy" | "sell",
    price: number,
  ) => void;
}

export function CommandCenterModal({
  activeTab,
  selectedTargetCode,
  nation,
  gameState,
  reports,
  onClose,
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
      <CommandCenterTabRouter
        activeTab={activeTab}
        selectedTargetCode={selectedTargetCode}
        nation={nation}
        gameState={gameState}
        reports={reports}
        onFocusCountry={onFocusCountry}
        onOpenTrade={onOpenTrade}
      />
    </UnifiedModalShell>
  );
}
