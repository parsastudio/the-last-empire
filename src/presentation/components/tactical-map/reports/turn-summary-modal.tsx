import React, { useState } from "react";
import {
  X,
  ShieldAlert,
  Award,
  Swords,
  ChevronLeft,
  ArrowRight,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  CombatReport,
  ReportSeverity,
} from "@/domain/reports/combat-report.schema";
import { CasualtyTable } from "./casualty-table";

interface TurnSummaryModalProps {
  isOpen: boolean;
  reports: CombatReport[];
  onClose: () => void;
}

export function TurnSummaryModal({
  isOpen,
  reports,
  onClose,
}: TurnSummaryModalProps) {
  const [selectedReport, setSelectedReport] = useState<CombatReport | null>(
    null,
  );

  if (!isOpen || reports.length === 0) return null;

  const getSeverityStyle = (severity: ReportSeverity) => {
    switch (severity) {
      case "CRITICAL_DEFEAT":
      case "DEFEAT":
        return {
          bg: "bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30",
          text: "text-rose-500",
          badge: "bg-rose-500/20 text-rose-400 border-rose-500/30",
          label: "شکست سنگین",
          icon: ShieldAlert,
        };
      case "CRUSHING_VICTORY":
      case "VICTORY":
        return {
          bg: "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30",
          text: "text-emerald-500",
          badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
          label: "پیروزی قاطع",
          icon: Award,
        };
      case "PYRRHIC_VICTORY":
        return {
          bg: "bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30",
          text: "text-amber-500",
          badge: "bg-amber-500/20 text-amber-400 border-amber-500/30",
          label: "پیروزی پرتلفات",
          icon: AlertTriangle,
        };
      default:
        return {
          bg: "bg-sky-500/10 hover:bg-sky-500/20 border-sky-500/30",
          text: "text-sky-500",
          badge: "bg-sky-500/20 text-sky-400 border-sky-500/30",
          label: "اطلاعیه",
          icon: Info,
        };
    }
  };

  const handleClose = () => {
    setSelectedReport(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center p-4 z-50 animate-fade-smooth">
      <div className="bg-card/95 backdrop-blur-xl border border-border/90 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative space-y-5 dir-rtl overflow-hidden pointer-events-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {selectedReport ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <button
              onClick={() => setSelectedReport(null)}
              className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <ArrowRight size={15} />
              <span>بازگشت به لیست گزارش‌های نوبت</span>
            </button>

            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${
                  getSeverityStyle(selectedReport.severity).badge
                }`}
              >
                {selectedReport.isVictory ? (
                  <Award size={20} />
                ) : (
                  <ShieldAlert size={20} />
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                  جزئیات عملیات | نوبت {selectedReport.turn}
                </span>
                <h2 className="text-base font-extrabold text-foreground leading-snug">
                  {selectedReport.title}
                </h2>
              </div>
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed bg-background/50 border border-border/80 p-4 rounded-2xl">
              {selectedReport.summary}
            </p>

            <CasualtyTable
              attackerName={selectedReport.attackerName}
              defenderName={selectedReport.defenderName}
              attackerCasualties={selectedReport.attackerCasualties}
              defenderCasualties={selectedReport.defenderCasualties}
              conqueredAreaSqKm={selectedReport.conqueredAreaSqKm}
            />

            <div className="bg-secondary/30 border border-border/60 p-3.5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 font-mono uppercase">
                <Swords size={12} className="text-diplomacy" />
                ارزیابی ستاد کل فرماندهی
              </span>
              <p className="text-xs text-foreground/90 leading-relaxed">
                {selectedReport.strategicAssessment}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                اتاق جنگ | گزارش‌های نوبت
              </span>
              <h2 className="text-lg font-extrabold text-foreground">
                خلاصه رویدادها و نبردهای مهم این نوبت
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                برای مشاهده آمار تلفات و جزئیات کامل نبرد روی هر گزارش کلیک
                کنید.
              </p>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
              {reports.map((rep) => {
                const style = getSeverityStyle(rep.severity);
                const Icon = style.icon;

                return (
                  <button
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    className={`w-full border p-4 rounded-2xl text-right transition-all flex items-center justify-between gap-4 group cursor-pointer ${style.bg}`}
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
                            {rep.title}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-2 py-0.5 rounded-md border shrink-0 ${style.badge}`}
                          >
                            {style.label}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {rep.summary}
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
              })}
            </div>

            <div className="pt-2 border-t border-border">
              <button
                onClick={handleClose}
                className="w-full py-3 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-2xl font-bold transition-all text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-gdp/10"
              >
                <span>تایید و ادامه فرماندهی در نقشه</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
