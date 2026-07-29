import React from "react";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { FileText, ChevronLeft } from "lucide-react";
import { getSeverityStyle } from "./utils/report-severity-style";

interface ReportsSidebarTabProps {
  reports: CombatReport[];
  onSelectReport: (report: CombatReport) => void;
}

export function ReportsSidebarTab({
  reports,
  onSelectReport,
}: ReportsSidebarTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="flex items-center gap-2 px-1">
        <FileText size={13} className="text-diplomacy" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          بایگانی گزارش‌های اطلاعاتی و نبردها
        </span>
      </div>

      <div className="space-y-2.5">
        {reports.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground italic">
            هیچ گزارش نظامی ثبت نشده است.
          </div>
        ) : (
          reports.map((report, index) => {
            const style = getSeverityStyle(report.severity);
            const Icon = style.icon;

            return (
              <button
                key={`${report.id}-${index}`}
                onClick={() => onSelectReport(report)}
                className={`w-full border p-3.5 rounded-2xl text-right transition-all flex items-center justify-between gap-3 group cursor-pointer ${style.bg}`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border ${style.badge}`}
                  >
                    <Icon size={14} />
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <span className="text-xs font-bold text-foreground block truncate">
                      {report.title}
                    </span>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-mono">
                      <span>نوبت: {report.turn}</span>
                      {report.conqueredAreaSqKm > 0 && (
                        <span>
                          {new Intl.NumberFormat("fa-IR").format(
                            Math.round(report.conqueredAreaSqKm),
                          )}{" "}
                          km²
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronLeft
                  size={14}
                  className="text-muted-foreground group-hover:-translate-x-0.5 transition-transform shrink-0"
                />
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
