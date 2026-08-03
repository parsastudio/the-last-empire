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
  ChevronRight,
  ChevronLeft,
  LucideIcon,
} from "lucide-react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { NextTurnButton } from "@/presentation/components/tactical-map/sidebar/next-turn-button";

interface RailTabButtonProps {
  id: SidebarTabType;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: (id: SidebarTabType) => void;
}

function RailTabButton({
  id,
  label,
  icon: Icon,
  isActive,
  isCollapsed,
  onClick,
}: RailTabButtonProps) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`relative group flex items-center rounded-2xl transition-all cursor-pointer ${
        isCollapsed ? "justify-center p-2.5 w-full" : "gap-3 p-3 w-full"
      } ${
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-bold"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
      }`}
      title={isCollapsed ? label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!isCollapsed && (
        <span className="text-xs font-sans whitespace-nowrap truncate font-semibold">
          {label}
        </span>
      )}

      {isCollapsed && (
        <span className="absolute right-full mr-3 px-2.5 py-1 bg-card/95 border border-border text-foreground text-[10px] rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap font-sans font-bold">
          {label}
        </span>
      )}
    </button>
  );
}

function RailToggleButton({
  isCollapsed,
  onToggle,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="p-2 rounded-2xl bg-secondary/80 hover:bg-secondary border border-border/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center shrink-0"
      title={isCollapsed ? "باز کردن نوار فرماندهی" : "جمع کردن نوار"}
    >
      {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  );
}

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
      className={`fixed top-4 right-4 bottom-4 z-40 bg-card/95 backdrop-blur-2xl border border-border/80 rounded-3xl shadow-2xl flex flex-col justify-between p-2.5 transition-all duration-300 dir-rtl pointer-events-auto overflow-hidden ${
        isCollapsed ? "w-16" : "w-48"
      }`}
    >
      <div className="space-y-3 overflow-x-hidden">
        <div className="flex items-center justify-between px-0.5">
          <RailToggleButton
            isCollapsed={isCollapsed}
            onToggle={onToggleCollapse}
          />
          {!isCollapsed && (
            <span className="text-[10px] font-mono font-black text-gdp truncate uppercase tracking-widest">
              اتاق فرماندهی
            </span>
          )}
        </div>

        <nav className="space-y-1 overflow-y-auto overflow-x-hidden max-h-[calc(100vh-160px)] scrollbar-none">
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

      <div className="pt-2 border-t border-border/80 overflow-x-hidden">
        {isCollapsed ? (
          <button
            onClick={onNextTurn}
            disabled={isProcessingTurn}
            className="w-full py-3 bg-gdp hover:bg-gdp/90 disabled:opacity-50 text-primary-foreground rounded-2xl font-mono text-xs font-bold transition-all shadow-lg shadow-gdp/20 flex items-center justify-center cursor-pointer"
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
