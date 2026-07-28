import React from "react";
import { ChevronLeft } from "lucide-react";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { getSeverityStyle } from "./utils/report-severity-style";

interface ReportListItemProps {
  report: CombatReport;
  onSelect: (report: CombatReport) => void;
}

export function ReportListItem({ report, onSelect }: ReportListItemProps) {
  const style = getSeverityStyle(report.severity);
  const Icon = style.icon;

  return (
    <button
      onClick={() => onSelect(report)}
      className={`w-full border p-4 rounded-2xl text-right transition-all flex items-center justify-between gap-4 group cursor-pointer dir-rtl ${style.bg}`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${style.badge}`}
        >
          <Icon size={16} />
        </div>
        <div className="space-y-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-foreground truncate">
              {report.title}
            </span>
            <span
              className={`text-[9px] font-mono px-2 py-0.5 rounded-md border shrink-0 ${style.badge}`}
            >
              {style.label}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            {report.summary}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-bold text-muted-foreground font-mono">
          جزئیات
        </span>
        <ChevronLeft
          size={14}
          className="text-muted-foreground group-hover:-translate-x-0.5 transition-transform"
        />
      </div>
    </button>
  );
}
