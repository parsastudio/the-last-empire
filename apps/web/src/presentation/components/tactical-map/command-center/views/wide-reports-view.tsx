import React from "react";
import { TurnLogEntry } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { useWideReports } from "@/presentation/components/tactical-map/command-center/views/reports/hooks/use-wide-reports";
import { ReportStatsOverview } from "@/presentation/components/tactical-map/command-center/views/reports/components/report-stats-overview";
import { ReportFilters } from "@/presentation/components/tactical-map/command-center/views/reports/components/report-filters";
import { ReportCard } from "@/presentation/components/tactical-map/command-center/views/reports/components/report-card";
import { FileQuestion } from "lucide-react";

interface WideReportsViewProps {
  logs?: TurnLogEntry[];
  humanNationId?: string;
  nationsMap?: Record<string, Nation>;
}

export function WideReportsView({
  logs = [],
  humanNationId,
  nationsMap,
}: WideReportsViewProps) {
  const {
    searchQuery,
    selectedScope,
    selectedCategory,
    selectedLevel,
    selectedTurn,
    availableTurns,
    stats,
    filteredLogs,
    setSearchQuery,
    setSelectedScope,
    setSelectedCategory,
    setSelectedLevel,
    setSelectedTurn,
  } = useWideReports({ logs, humanNationId, nationsMap });

  if (!logs || logs.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3 text-center dir-rtl">
        <div className="w-12 h-12 rounded-2xl bg-secondary/60 border border-border/80 flex items-center justify-center text-muted-foreground">
          <FileQuestion size={24} />
        </div>
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-foreground">
            هیچ گزارش ثبت‌شده‌ای یافت نشد
          </h4>
          <p className="text-[10px] text-muted-foreground font-sans">
            با آغاز نوبت‌ها و اجرای دستورات استراتژیک، گزارش‌ها به طور خودکار در
            این بخش ثبت خواهند شد.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl text-right font-sans">
      <ReportStatsOverview stats={stats} />

      <ReportFilters
        searchQuery={searchQuery}
        selectedScope={selectedScope}
        selectedCategory={selectedCategory}
        selectedLevel={selectedLevel}
        selectedTurn={selectedTurn}
        availableTurns={availableTurns}
        onSearchChange={setSearchQuery}
        onScopeChange={setSelectedScope}
        onCategoryChange={setSelectedCategory}
        onLevelChange={setSelectedLevel}
        onTurnChange={setSelectedTurn}
      />

      <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-xs text-muted-foreground italic bg-secondary/20 rounded-2xl border border-border/40">
            هیچ رویدادی مطابق با فیلترهای انتخابی یافت نشد.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <ReportCard key={log.id} log={log} nationsMap={nationsMap} />
          ))
        )}
      </div>
    </div>
  );
}
