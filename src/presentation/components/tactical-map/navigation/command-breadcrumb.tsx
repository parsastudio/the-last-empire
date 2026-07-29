import React from "react";
import { ChevronLeft, Home, Compass } from "lucide-react";
import { SidebarTabType } from "../sidebar/sidebar-tabs";

interface CommandBreadcrumbProps {
  activeTab: SidebarTabType;
  subTabLabel?: string | null;
  targetName?: string | null;
  onNavigateTab: (tab: SidebarTabType) => void;
  onOpenOverviewTree?: () => void;
}

export function CommandBreadcrumb({
  activeTab,
  subTabLabel,
  targetName,
  onNavigateTab,
  onOpenOverviewTree,
}: CommandBreadcrumbProps) {
  const getTabLabel = (tab: SidebarTabType): string => {
    switch (tab) {
      case "overview":
        return "نمای کلی";
      case "military":
        return "ارتش و تسلیحات";
      case "politics":
        return "دیوان سیاست";
      case "proxy":
        return "عملیات نیابتی";
      case "market":
        return "بورس جهانی";
      case "abilities":
        return "فرمان‌های ویژه";
      case "reports":
        return "گزارش‌های نبرد";
      case "diplomacy":
        return "دیپلماسی";
      case "research":
        return "پژوهشکده دکترین";
      default:
        return "اتاق فرماندهی";
    }
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground dir-rtl select-none overflow-x-auto scrollbar-none py-1">
      <button
        onClick={() => onNavigateTab("overview")}
        className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer shrink-0 font-medium"
      >
        <Home size={13} className="text-primary" />
        <span>فرماندهی</span>
      </button>

      <ChevronLeft size={12} className="shrink-0 text-muted-foreground/60" />

      <button
        onClick={() => onNavigateTab(activeTab)}
        className="hover:text-foreground transition-colors cursor-pointer font-bold text-foreground shrink-0"
      >
        {getTabLabel(activeTab)}
      </button>

      {subTabLabel && (
        <>
          <ChevronLeft
            size={12}
            className="shrink-0 text-muted-foreground/60"
          />
          <span className="text-gdp font-semibold shrink-0">{subTabLabel}</span>
        </>
      )}

      {targetName && (
        <>
          <ChevronLeft
            size={12}
            className="shrink-0 text-muted-foreground/60"
          />
          <span className="text-amber-500 font-bold shrink-0">
            {targetName}
          </span>
        </>
      )}

      {onOpenOverviewTree && (
        <button
          onClick={onOpenOverviewTree}
          className="mr-auto px-2 py-0.5 bg-secondary/80 hover:bg-secondary border border-border/60 text-muted-foreground hover:text-foreground rounded-lg text-[10px] font-mono flex items-center gap-1 cursor-pointer shrink-0"
          title="مشاهده نقشه کامل منوها"
        >
          <Compass size={11} />
          <span>ساختار درختی</span>
        </button>
      )}
    </nav>
  );
}
