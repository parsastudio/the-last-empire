import React from "react";
import { useTranslations } from "next-intl";
import { Loader2, ChevronLeft, LucideIcon } from "lucide-react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { NextTurnButton } from "@/presentation/components/tactical-map/sidebar/next-turn-button";
import { COMMAND_RAIL_TABS } from "@/presentation/configs/command-center-tabs.config";
import { TacticalSound } from "@/presentation/utils/tactical-sound";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

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
  const handleClick = () => {
    TacticalSound.playUiClick();
    onClick(id);
  };

  return (
    <button
      onClick={handleClick}
      className={`relative group flex items-center rounded-xl md:rounded-2xl transition-all cursor-pointer overflow-hidden ${
        isCollapsed
          ? "justify-center p-2 md:p-3 w-full"
          : "gap-2.5 md:gap-3 p-2 md:p-3 w-full"
      } ${
        isActive
          ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-bold ring-1 ring-primary/40"
          : "text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-transparent hover:border-border/40"
      }`}
      title={isCollapsed ? label : undefined}
    >
      {isActive && (
        <div className="absolute start-0 top-1.5 bottom-1.5 md:top-2 md:bottom-2 w-1 bg-white rounded-e-full animate-laser-glow" />
      )}

      <Icon
        size={16}
        className="shrink-0 transition-transform group-hover:scale-110 md:w-[18px] md:h-[18px]"
      />
      {!isCollapsed && (
        <span className="text-xs font-sans whitespace-nowrap truncate font-semibold">
          {label}
        </span>
      )}

      {isCollapsed && (
        <span className="absolute start-full ms-3 px-3 py-1.5 bg-card/95 border border-border/80 text-foreground text-[10px] rounded-xl shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap font-sans font-bold backdrop-blur-xl ring-1 ring-white/5">
          {label}
        </span>
      )}
    </button>
  );
}

function RailToggleButton({
  isCollapsed,
  onToggle,
  expandLabel,
  collapseLabel,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
  expandLabel: string;
  collapseLabel: string;
}) {
  const handleToggle = () => {
    TacticalSound.playUiClick();
    onToggle();
  };

  return (
    <button
      onClick={handleToggle}
      className="p-1.5 md:p-2.5 rounded-xl md:rounded-2xl bg-secondary/80 hover:bg-secondary border border-border/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-inner"
      title={isCollapsed ? expandLabel : collapseLabel}
    >
      <ChevronLeft
        size={15}
        className={`transition-transform duration-200 ${
          isCollapsed ? "rotate-180 rtl:rotate-0" : "rotate-0 rtl:rotate-180"
        }`}
      />
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
  const t = useTranslations("hud.rail");
  const { toDigits } = useLocaleFormatter();

  const handleNextTurn = () => {
    TacticalSound.playTurnAdvance();
    onNextTurn();
  };

  return (
    <aside
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        insetInlineStart:
          "max(0.75rem, max(env(safe-area-inset-left), env(safe-area-inset-right)))",
        top: "max(0.5rem, env(safe-area-inset-top))",
        bottom: "max(0.5rem, env(safe-area-inset-bottom))",
      }}
      className={`fixed z-40 bg-card/95 backdrop-blur-3xl border border-border/80 rounded-2xl md:rounded-3xl shadow-2xl flex flex-col justify-between p-2 md:p-2.5 transition-all duration-300 pointer-events-auto overflow-hidden ring-1 ring-white/5 ${
        isCollapsed ? "w-13 md:w-16" : "w-44 md:w-48"
      }`}
    >
      <div className="space-y-1.5 md:space-y-3 overflow-x-hidden flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between px-0.5 shrink-0">
          <RailToggleButton
            isCollapsed={isCollapsed}
            onToggle={onToggleCollapse}
            expandLabel={t("expand")}
            collapseLabel={t("collapse")}
          />
          {!isCollapsed && (
            <span className="text-[9px] md:text-[10px] font-mono font-black text-gdp truncate uppercase tracking-widest">
              {t("warRoom")}
            </span>
          )}
        </div>

        <nav className="space-y-1 md:space-y-1.5 overflow-y-auto overflow-x-hidden flex-1 scrollbar-none py-0.5">
          {COMMAND_RAIL_TABS.map((tab) => (
            <RailTabButton
              key={tab.id}
              id={tab.id}
              label={t(`tabs.${tab.id}`)}
              icon={tab.icon}
              isActive={activeTab === tab.id}
              isCollapsed={isCollapsed}
              onClick={onSelectTab}
            />
          ))}
        </nav>
      </div>

      <div className="pt-1.5 md:pt-2.5 border-t border-border/80 overflow-x-hidden shrink-0">
        {isCollapsed ? (
          <button
            onClick={handleNextTurn}
            disabled={isProcessingTurn}
            className="w-full py-2.5 md:py-3 bg-gdp hover:bg-gdp/90 disabled:opacity-50 text-primary-foreground rounded-xl md:rounded-2xl font-mono text-xs font-black transition-all shadow-lg shadow-gdp/20 flex items-center justify-center cursor-pointer border border-gdp/30"
            title={t("endTurnShort")}
          >
            {isProcessingTurn ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              toDigits(currentTurn)
            )}
          </button>
        ) : (
          <NextTurnButton
            currentTurn={currentTurn}
            isProcessing={isProcessingTurn}
            onNextTurn={handleNextTurn}
          />
        )}
      </div>
    </aside>
  );
}
