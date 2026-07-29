import React from "react";
import {
  LayoutDashboard,
  Swords,
  Landmark,
  ShoppingBag,
  Zap,
  FileText,
  Users,
  Cpu,
  Loader2,
  Flame,
} from "lucide-react";
import { SidebarTabType } from "../sidebar/sidebar-tabs";
import { RailTabButton } from "./rail-tab-button";
import { RailToggleButton } from "./rail-toggle-button";
import { NextTurnButton } from "../sidebar/next-turn-button";

interface CommandRailProps {
  activeTab: SidebarTabType | null;
  isCollapsed: boolean;
  currentTurn: number;
  isProcessingTurn?: boolean;
  onSelectTab: (tab: SidebarTabType) => void;
  onToggleCollapse: () => void;
  onNextTurn: () => void;
}

export function CommandRail({
  activeTab,
  isCollapsed,
  currentTurn,
  isProcessingTurn = false,
  onSelectTab,
  onToggleCollapse,
  onNextTurn,
}: CommandRailProps) {
  const tabs = [
    { id: "overview" as const, label: "نما", icon: LayoutDashboard },
    { id: "military" as const, label: "ارتش", icon: Swords },
    { id: "politics" as const, label: "سیاست", icon: Landmark },
    { id: "proxy" as const, label: "عملیات نیابتی", icon: Flame },
    { id: "market" as const, label: "بازار", icon: ShoppingBag },
    { id: "abilities" as const, label: "توانمندی", icon: Zap },
    { id: "reports" as const, label: "گزارش‌ها", icon: FileText },
    { id: "diplomacy" as const, label: "دیپلماسی", icon: Users },
    { id: "research" as const, label: "پژوهش", icon: Cpu },
  ];

  return (
    <aside
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className={`fixed top-4 right-4 bottom-4 z-40 bg-card/90 backdrop-blur-xl border border-border rounded-3xl shadow-2xl flex flex-col justify-between p-2.5 transition-all duration-300 dir-rtl pointer-events-auto ${
        isCollapsed ? "w-16" : "w-48"
      }`}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <RailToggleButton
            isCollapsed={isCollapsed}
            onToggle={onToggleCollapse}
          />
          {!isCollapsed && (
            <span className="text-[10px] font-mono font-bold text-gdp">
              اتاق فرماندهی
            </span>
          )}
        </div>

        <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-160px)] scrollbar-none">
          {tabs.map((tab) => (
            <RailTabButton
              key={tab.id}
              id={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={activeTab === tab.id}
              isCollapsed={isCollapsed}
              onClick={onSelectTab}
            />
          ))}
        </nav>
      </div>

      <div className="pt-2 border-t border-border">
        {isCollapsed ? (
          <button
            onClick={onNextTurn}
            disabled={isProcessingTurn}
            className="w-full py-3 bg-gdp hover:bg-gdp/90 disabled:opacity-50 text-primary-foreground rounded-2xl font-mono text-xs font-bold transition-all shadow-md flex items-center justify-center cursor-pointer"
            title={`پایان نوبت ${currentTurn}`}
          >
            {isProcessingTurn ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              currentTurn
            )}
          </button>
        ) : (
          <NextTurnButton
            currentTurn={currentTurn}
            isProcessing={isProcessingTurn}
            onNextTurn={onNextTurn}
          />
        )}
      </div>
    </aside>
  );
}
