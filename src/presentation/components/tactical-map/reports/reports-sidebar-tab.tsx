import React from "react";
import {
  CombatReport,
  ReportSeverity,
} from "@/domain/reports/combat-report.schema";
import {
  FileText,
  ChevronLeft,
  ShieldAlert,
  Award,
  AlertTriangle,
  Info,
} from "lucide-react";

interface ReportsSidebarTabProps {
  reports: CombatReport[];
  onSelectReport: (report: CombatReport) => void;
}

export function ReportsSidebarTab({
  reports,
  onSelectReport,
}: ReportsSidebarTabProps) {
  const getSeverityStyle = (severity: ReportSeverity) => {
    switch (severity) {
      case "CRITICAL_DEFEAT":
      case "DEFEAT":
        return {
          bg: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30",
          badge: "bg-rose-500/20 text-rose-400 border-rose-500/30",
          icon: ShieldAlert,
        };
      case "CRUSHING_VICTORY":
      case "VICTORY":
        return {
          bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30",
          badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          icon: Award,
        };
      case "PYRRHIC_VICTORY":
        return {
          bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30",
          badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          icon: AlertTriangle,
        };
      default:
        return {
          bg: "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30",
          badge: "bg-sky-500/20 text-sky-400 border-sky-500/30",
          icon: Info,
        };
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200 dir-rtl">
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
          reports.map((report) => {
            const style = getSeverityStyle(report.severity);
            const Icon = style.icon;

            return (
              <button
                key={report.id}
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
