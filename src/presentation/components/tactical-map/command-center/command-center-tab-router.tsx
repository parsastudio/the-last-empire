import React from "react";
import { SidebarTabType } from "@/presentation/components/tactical-map/sidebar/sidebar-tabs";
import { WideOverviewView } from "@/presentation/components/tactical-map/command-center/views/wide-overview-view";
import { WideMarketView } from "@/presentation/components/tactical-map/command-center/views/wide-market-view";
import { WideMilitaryView } from "@/presentation/components/tactical-map/command-center/views/wide-military-view";
import { WidePoliticsView } from "@/presentation/components/tactical-map/command-center/views/wide-politics-view";
import { WideProxyView } from "@/presentation/components/tactical-map/command-center/views/wide-proxy-view";
import { WideDiplomacyView } from "@/presentation/components/tactical-map/command-center/views/wide-diplomacy-view";
import { WideResearchView } from "@/presentation/components/tactical-map/command-center/views/wide-research-view";
import { WideAbilitiesView } from "@/presentation/components/tactical-map/command-center/views/wide-abilities-view";
import { Nation } from "@/domain/nation/nation.schema";
import { GameState, TurnLogEntry } from "@/domain/game/game-state.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { FileText, ShieldAlert, Info } from "lucide-react";

interface CommandCenterTabRouterProps {
  activeTab: SidebarTabType;
  selectedTargetCode?: string | null;
  nation: Nation;
  gameState?: GameState | null;
  onFocusCountry?: (code: string) => void;
  onNavigateTab?: (
    tab: SidebarTabType,
    subTab?: string,
    targetCode?: string,
  ) => void;
}

export function CommandCenterTabRouter({
  activeTab,
  selectedTargetCode,
  nation,
  gameState,
  onFocusCountry,
  onNavigateTab,
}: CommandCenterTabRouterProps) {
  switch (activeTab) {
    case "overview":
      return <WideOverviewView nation={nation} rank={nation.rank} />;
    case "market":
      return <WideMarketView userTreasury={nation.treasury} nation={nation} />;
    case "military":
      return (
        <WideMilitaryView
          military={nation.military}
          recruitmentQueue={nation.recruitmentQueue}
          nationId={nation.id}
          treasury={nation.treasury}
        />
      );
    case "politics":
      return (
        <WidePoliticsView nation={nation} nationsMap={gameState?.nations} />
      );
    case "proxy":
      return (
        <WideProxyView
          nation={nation}
          nationsMap={gameState?.nations}
          selectedTargetCode={selectedTargetCode}
        />
      );
    case "diplomacy":
      return (
        <WideDiplomacyView
          selectedTargetCode={selectedTargetCode}
          nationsMap={gameState?.nations}
          humanNationId={nation.id}
          onFocusCountry={onFocusCountry}
          onNavigateTab={onNavigateTab}
        />
      );
    case "research":
      return <WideResearchView nationId={nation.id} nation={nation} />;
    case "abilities":
      return (
        <WideAbilitiesView
          currentGovernment={nation.government.type}
          nationId={nation.id}
        />
      );
    case "reports": {
      const logs: TurnLogEntry[] = gameState?.turnLogs || [];
      if (logs.length === 0) {
        return (
          <div className="py-20 text-center text-xs text-muted-foreground italic">
            هیچ گزارش یا لاگ ثبت‌شده‌ای در این کمپین یافت نشد.
          </div>
        );
      }
      return (
        <div className="space-y-3 dir-rtl text-right animate-in fade-in duration-200">
          <div className="flex items-center gap-2 pb-2 border-b border-border/40">
            <FileText size={16} className="text-primary" />
            <span className="text-xs font-bold text-foreground">
              بایگانی گزارش‌های امنیتی و نبردهای ثبت‌شده
            </span>
          </div>
          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 scrollbar-thin">
            {logs
              .slice()
              .reverse()
              .map((log: TurnLogEntry) => (
                <div
                  key={log.id}
                  className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl space-y-1.5 font-mono text-xs"
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold text-primary flex items-center gap-1 font-sans">
                      {log.level === "COMBAT" || log.level === "CRITICAL" ? (
                        <ShieldAlert size={12} className="text-military" />
                      ) : (
                        <Info size={12} className="text-primary" />
                      )}
                      نوبت {PersianNumberFormatter.toPersianDigits(log.turn)}
                    </span>
                    <span className="text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString("fa-IR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-foreground font-sans text-xs leading-relaxed">
                    {log.message}
                  </p>
                </div>
              ))}
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}
