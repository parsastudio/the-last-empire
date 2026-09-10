import React from "react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { CommandCenterTabRouter } from "@/presentation/components/tactical-map/command-center/command-center-tab-router";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState } from "@/domain/game/game-state.schema";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { CommandBreadcrumb } from "@/presentation/components/tactical-map/navigation/command-breadcrumb";
import { COMMAND_CENTER_TABS_CONFIG } from "@/presentation/configs/command-center-tabs.config";

export interface CommandCenterMeta {
  title: string;
  subtitle: string;
}

export function getCommandCenterMeta(
  activeTab: SidebarTabType | null,
  nationName: string,
): CommandCenterMeta {
  if (!activeTab || !COMMAND_CENTER_TABS_CONFIG[activeTab]) {
    return { title: "اتاق فرماندهی", subtitle: "" };
  }
  const config = COMMAND_CENTER_TABS_CONFIG[activeTab];
  return {
    title: config.getTitle(nationName),
    subtitle: config.subtitle,
  };
}

interface CommandCenterModalProps {
  activeTab: SidebarTabType | null;
  activeSubTab?: string | null;
  selectedTargetCode?: string | null;
  nation: Nation | null;
  gameState?: GameState | null;
  onClose: () => void;
  onNavigateTab: (
    tab: SidebarTabType,
    subTab?: string,
    targetCode?: string,
  ) => void;
  onFocusCountry?: (code: string) => void;
}

export function CommandCenterModal({
  activeTab,
  activeSubTab,
  selectedTargetCode,
  nation,
  gameState,
  onClose,
  onNavigateTab,
  onFocusCountry,
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
        <div className="pb-2 text-right dir-rtl border-b border-border/40">
          <CommandBreadcrumb
            activeTab={activeTab}
            subTabLabel={activeSubTab}
            targetName={selectedTargetCode}
            onNavigateTab={onNavigateTab}
          />
        </div>

        <CommandCenterTabRouter
          activeTab={activeTab}
          activeSubTab={activeSubTab}
          selectedTargetCode={selectedTargetCode}
          nation={nation}
          gameState={gameState}
          onFocusCountry={onFocusCountry}
          onNavigateTab={onNavigateTab}
        />
      </div>
    </UnifiedModalShell>
  );
}
