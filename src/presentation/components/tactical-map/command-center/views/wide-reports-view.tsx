import React, { useState, useCallback } from "react";
import { Swords } from "lucide-react";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { ReportsSidebarTab } from "@/presentation/components/tactical-map/reports/reports-sidebar-tab";

function ReportNarrativeBox({
  summary,
  strategicAssessment,
}: {
  summary: string;
  strategicAssessment: string;
}) {
  return (
    <div className="space-y-3 text-right">
      <p className="text-xs text-foreground/90 leading-relaxed bg-background/50 border border-border/80 p-4 rounded-2xl">
        {summary}
      </p>

      <div className="bg-secondary/30 border border-border/60 p-3.5 rounded-2xl space-y-1">
        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 font-mono uppercase">
          <Swords size={12} className="text-diplomacy" />
          ارزیابی دبیرخانه حاکمیت
        </span>
        <p className="text-xs text-foreground/90 leading-relaxed">
          {strategicAssessment}
        </p>
      </div>
    </div>
  );
}

interface WideReportsViewProps {
  reports: CombatReport[];
}

export function WideReportsView({ reports }: WideReportsViewProps) {
  const [selectedReport, setSelectedReport] = useState<CombatReport | null>(
    reports[0] || null,
  );

  const selectReport = useCallback((report: CombatReport) => {
    setSelectedReport(report);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200 dir-rtl">
      <div className="lg:col-span-5 bg-background/30 p-4 border border-border/60 rounded-3xl">
        <ReportsSidebarTab reports={reports} onSelectReport={selectReport} />
      </div>

      <div className="lg:col-span-7 space-y-4">
        {selectedReport ? (
          <ReportNarrativeBox
            summary={selectedReport.summary}
            strategicAssessment={selectedReport.strategicAssessment}
          />
        ) : (
          <div className="py-20 text-center text-xs text-muted-foreground italic">
            هیچ گزارش جدیدی ثبت نشده است.
          </div>
        )}
      </div>
    </div>
  );
}
