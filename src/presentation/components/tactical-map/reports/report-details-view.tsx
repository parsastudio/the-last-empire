import React from "react";
import { ArrowRight, Award, ShieldAlert, Swords } from "lucide-react";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { CasualtyTable } from "./casualty-table";
import { getSeverityStyle } from "./utils/report-severity-style";

interface ReportDetailsViewProps {
  report: CombatReport;
  onBack: () => void;
}

export function ReportDetailsView({ report, onBack }: ReportDetailsViewProps) {
  const style = getSeverityStyle(report.severity);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
      >
        <ArrowRight size={15} />
        <span>بازگشت به لیست گزارش‌های نوبت</span>
      </button>

      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${style.badge}`}
        >
          {report.isVictory ? <Award size={20} /> : <ShieldAlert size={20} />}
        </div>
        <div>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
            جزئیات عملیات | نوبت {report.turn}
          </span>
          <h2 className="text-base font-extrabold text-foreground leading-snug">
            {report.title}
          </h2>
        </div>
      </div>

      <p className="text-xs text-foreground/90 leading-relaxed bg-background/50 border border-border/80 p-4 rounded-2xl">
        {report.summary}
      </p>

      <CasualtyTable
        attackerName={report.attackerName}
        defenderName={report.defenderName}
        attackerCasualties={report.attackerCasualties}
        defenderCasualties={report.defenderCasualties}
        conqueredAreaSqKm={report.conqueredAreaSqKm}
      />

      <div className="bg-secondary/30 border border-border/60 p-3.5 rounded-2xl space-y-1">
        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 font-mono uppercase">
          <Swords size={12} className="text-diplomacy" />
          ارزیابی ستاد کل فرماندهی
        </span>
        <p className="text-xs text-foreground/90 leading-relaxed">
          {report.strategicAssessment}
        </p>
      </div>
    </div>
  );
}
