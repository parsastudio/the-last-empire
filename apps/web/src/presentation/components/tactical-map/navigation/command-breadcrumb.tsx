import React from "react";
import { ChevronLeft, Home } from "lucide-react";
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
  const getTabLabel = (tab: SidebarTabType): string => {
    switch (tab) {
      case "overview":
        return "نمای کلی";
      case "military":
        return "ارتش و تسلیحات";
      case "market":
        return "بازار بین‌المللی اسلحه";
      case "politics":
        return "دیوان سیاست";
      case "espionage":
        return "سرویس اطلاعات و جاسوسی";
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
    <nav className="flex items-center gap-1.5 text-xs text-muted-foreground dir-rtl select-none overflow-x-auto scrollbar-none py-0.5">
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
    </nav>
  );
}
