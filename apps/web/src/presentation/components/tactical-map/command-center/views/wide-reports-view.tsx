import React from "react";
import { TurnLogEntry } from "@/domain/game/game-state.schema";
import { Nation } from "@/domain/nation/nation.schema";
import { useWideReports } from "@/presentation/components/tactical-map/command-center/views/reports/hooks/use-wide-reports";
import { ReportStatsOverview } from "@/presentation/components/tactical-map/command-center/views/reports/components/report-stats-overview";
import { ReportFilters } from "@/presentation/components/tactical-map/command-center/views/reports/components/report-filters";
import { ReportCard } from "@/presentation/components/tactical-map/command-center/views/reports/components/report-card";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { FileQuestion } from "lucide-react";

interface WideReportsViewProps {
  logs?: TurnLogEntry[];
  currentTurn?: number;
  humanNationId?: string;
  nationsMap?: Record<string, Nation>;
}

export function WideReportsView({
  logs = [],
  currentTurn = 1,
  humanNationId,
  nationsMap,
}: WideReportsViewProps) {
  const {
    selectedScope,
    selectedTurn,
    searchQuery,
    availableTurns,
    stats,
    sortedLogs,
    setSelectedScope,
    setSelectedTurn,
    setSearchQuery,
  } = useWideReports({ logs, currentTurn, humanNationId, nationsMap });

  const turnLabel =
    selectedTurn === "ALL"
      ? "همه نوبت‌ها"
      : `نوبت ${PersianNumberFormatter.toPersianDigits(selectedTurn)}`;

  return (
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl text-right font-sans pb-6">
      <ReportFilters
        selectedScope={selectedScope}
        selectedTurn={selectedTurn}
        searchQuery={searchQuery}
        availableTurns={availableTurns}
        onScopeChange={setSelectedScope}
        onTurnChange={setSelectedTurn}
        onSearchChange={setSearchQuery}
      />

      <ReportStatsOverview stats={stats} turnLabel={turnLabel} />

      <div className="space-y-2.5 pt-1">
        {sortedLogs.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center gap-2.5 text-center bg-secondary/20 rounded-2xl border border-border/40">
            <FileQuestion size={24} className="text-muted-foreground" />
            <span className="text-xs font-bold text-foreground">
              در {turnLabel} هیچ رویدادی برای این بخش ثبت نشده است.
            </span>
            <span className="text-[10px] text-muted-foreground">
              برای مشاهده سایر وقایع، نوبت دیگری را انتخاب کنید.
            </span>
          </div>
        ) : (
          sortedLogs.map((log) => (
            <ReportCard key={log.id} log={log} nationsMap={nationsMap} />
          ))
        )}
      </div>
    </div>
  );
}
