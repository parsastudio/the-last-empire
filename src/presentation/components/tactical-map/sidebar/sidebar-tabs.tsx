import React from "react";
import {
  LayoutDashboard,
  Swords,
  Landmark,
  Users,
  Cpu,
  Zap,
  FileText,
  ShoppingBag,
  Flame,
} from "lucide-react";

export type SidebarTabType =
  | "overview"
  | "military"
  | "politics"
  | "diplomacy"
  | "research"
  | "abilities"
  | "reports"
  | "market"
  | "proxy";

interface SidebarTabsProps {
  activeTab: SidebarTabType;
  onChangeTab: (tab: SidebarTabType) => void;
}

export function SidebarTabs({ activeTab, onChangeTab }: SidebarTabsProps) {
  const tabs: {
    id: SidebarTabType;
    label: string;
    icon: React.ComponentType<{ size: number }>;
  }[] = [
    { id: "overview", label: "نما", icon: LayoutDashboard },
    { id: "military", label: "ارتش", icon: Swords },
    { id: "politics", label: "سیاست", icon: Landmark },
    { id: "proxy", label: "نیابتی", icon: Flame },
    { id: "market", label: "بازار", icon: ShoppingBag },
    { id: "abilities", label: "توانمندی", icon: Zap },
    { id: "reports", label: "گزارش‌ها", icon: FileText },
    { id: "diplomacy", label: "دیپلماسی", icon: Users },
    { id: "research", label: "پژوهش", icon: Cpu },
  ];

  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 bg-secondary/80 border border-border p-1.5 rounded-2xl gap-1 shrink-0">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all gap-1 cursor-pointer ${
              isActive
                ? "bg-card text-foreground shadow-sm border border-border/60 font-extrabold"
                : "text-muted-foreground hover:text-foreground hover:bg-card/40 border border-transparent font-medium"
            }`}
          >
            <Icon size={14} />
            <span className="text-[9px] font-sans whitespace-nowrap">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
