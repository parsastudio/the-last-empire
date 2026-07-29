import React from "react";
import { X, Search, Settings, BookOpen } from "lucide-react";
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
  onOpenCommandPalette: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenOverviewTree: () => void;
}

export function CommandCenterHeader({
  title,
  subtitle,
  activeTab,
  subTabLabel,
  targetName,
  onNavigateTab,
  onClose,
  onOpenCommandPalette,
  onOpenSettings,
  onOpenGuide,
  onOpenOverviewTree,
}: CommandCenterHeaderProps) {
  return (
    <div className="space-y-3 pb-3 border-b border-border/80 shrink-0 text-right dir-rtl">
      <div className="flex items-center justify-between">
        <CommandBreadcrumb
          activeTab={activeTab}
          subTabLabel={subTabLabel}
          targetName={targetName}
          onNavigateTab={onNavigateTab}
          onOpenOverviewTree={onOpenOverviewTree}
        />

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onOpenCommandPalette}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-mono border border-border/60"
            title="جستجوی سریع (Ctrl+K)"
          >
            <Search size={13} />
            <span className="hidden sm:inline">Ctrl+K</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer"
            title="راهنمای بازی"
          >
            <BookOpen size={14} />
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer"
            title="تنظیمات"
          >
            <Settings size={14} />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer shrink-0"
            title="بستن"
          >
            <X size={18} />
          </button>
        </div>
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
