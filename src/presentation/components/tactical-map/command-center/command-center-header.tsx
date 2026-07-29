import React from "react";
import { CommandBreadcrumb } from "../navigation/command-breadcrumb";
import { SidebarTabType } from "../sidebar/sidebar-tabs";

interface CommandCenterHeaderProps {
  activeTab: SidebarTabType;
  subTabLabel?: string | null;
  targetName?: string | null;
  onNavigateTab: (tab: SidebarTabType) => void;
}

export function CommandCenterHeader({
  activeTab,
  subTabLabel,
  targetName,
  onNavigateTab,
}: CommandCenterHeaderProps) {
  return (
    <div className="pb-2 text-right dir-rtl">
      <CommandBreadcrumb
        activeTab={activeTab}
        subTabLabel={subTabLabel}
        targetName={targetName}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
}
