import React from "react";
import { X } from "lucide-react";
import { CommandBreadcrumb } from "../navigation/command-breadcrumb";
import { SidebarTabType } from "../sidebar/sidebar-tabs";

interface CommandCenterHeaderProps {
  title: string;
  subtitle?: string;
  activeTab: SidebarTabType;
  subTabLabel?: string | null;
  targetName?: string | null;
  onNavigateTab: (tab: SidebarTabType) => void;
  onClose: () => void;
}

export function CommandCenterHeader({
  title,
  subtitle,
  activeTab,
  subTabLabel,
  targetName,
  onNavigateTab,
  onClose,
}: CommandCenterHeaderProps) {
  return (
    <div className="space-y-3 pb-3 border-b border-border/80 shrink-0 text-right dir-rtl">
      <div className="flex items-center justify-between">
        <CommandBreadcrumb
          activeTab={activeTab}
          subTabLabel={subTabLabel}
          targetName={targetName}
          onNavigateTab={onNavigateTab}
        />

        <button
          onClick={onClose}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer shrink-0"
          title="بستن"
        >
          <X size={18} />
        </button>
      </div>

      <div className="space-y-0.5">
        <h2 className="text-lg md:text-xl font-extrabold text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
