import React from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, Home } from "lucide-react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";

interface CommandBreadcrumbProps {
  activeTab: SidebarTabType;
  subTabLabel?: string | null;
  targetName?: string | null;
  onNavigateTab: (tab: SidebarTabType) => void;
}

export function CommandBreadcrumb({
  activeTab,
  subTabLabel,
  targetName,
  onNavigateTab,
}: CommandBreadcrumbProps) {
  const t = useTranslations("hud");
  const tabLabel = t(`rail.tabs.${activeTab}`);

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground select-none overflow-x-auto scrollbar-none py-0.5">
      <button
        onClick={() => onNavigateTab("overview")}
        className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer shrink-0 font-medium"
      >
        <Home size={13} className="text-primary" />
        <span>{t("breadcrumb.command")}</span>
      </button>

      <ChevronRight
        size={12}
        className="shrink-0 text-muted-foreground/60 rtl:rotate-180"
      />

      <button
        onClick={() => onNavigateTab(activeTab)}
        className="hover:text-foreground transition-colors cursor-pointer font-bold text-foreground shrink-0"
      >
        {tabLabel}
      </button>

      {subTabLabel && (
        <>
          <ChevronRight
            size={12}
            className="shrink-0 text-muted-foreground/60 rtl:rotate-180"
          />
          <span className="text-gdp font-semibold shrink-0">{subTabLabel}</span>
        </>
      )}

      {targetName && (
        <>
          <ChevronRight
            size={12}
            className="shrink-0 text-muted-foreground/60 rtl:rotate-180"
          />
          <span className="text-amber-500 font-bold shrink-0">
            {targetName}
          </span>
        </>
      )}
    </nav>
  );
}
