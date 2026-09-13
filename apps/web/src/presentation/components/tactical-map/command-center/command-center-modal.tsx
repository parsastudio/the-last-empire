import React from "react";
import { useTranslations } from "next-intl";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { CommandCenterTabRouter } from "@/presentation/components/tactical-map/command-center/command-center-tab-router";
import { Nation } from "@geopolitics/domain";
import { GameState } from "@/domain/game/game-state.schema";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { CommandBreadcrumb } from "@/presentation/components/tactical-map/navigation/command-breadcrumb";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

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
}

export function CommandCenterModal({
  activeTab,
  activeSubTab,
  selectedTargetCode,
  nation,
  gameState,
  onClose,
  onNavigateTab,
}: CommandCenterModalProps) {
  const t = useTranslations("hud");
  const { formatCountryName } = useLocaleFormatter();

  if (!activeTab || !nation) return null;

  const tabTitle = t(`rail.tabs.${activeTab}`);
  const warRoomTitle = t("rail.warRoom");
  const nationDisplayName = formatCountryName(nation);
  const modalSubtitle = `${warRoomTitle} • ${nationDisplayName}`;

  return (
    <UnifiedModalShell
      isOpen={activeTab !== null}
      title={tabTitle}
      subtitle={modalSubtitle}
      maxWidthClass="max-w-6xl"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="pb-2 text-start border-b border-border/40">
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
          onNavigateTab={onNavigateTab}
        />
      </div>
    </UnifiedModalShell>
  );
}
