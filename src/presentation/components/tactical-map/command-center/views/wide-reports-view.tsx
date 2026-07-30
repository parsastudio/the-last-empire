import React from "react";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { ReportsSidebarTab } from "../../reports/reports-sidebar-tab";
import { ReportNarrativeBox } from "./components/report-narrative-box";
import { useWideReports } from "./hooks/use-wide-reports";

interface WideReportsViewProps {
  reports: CombatReport[];
}

export function WideReportsView({ reports }: WideReportsViewProps) {
  const reportsView = useWideReports(reports);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200 dir-rtl">
      <div className="lg:col-span-5 bg-background/30 p-4 border border-border/60 rounded-3xl">
        <ReportsSidebarTab
          reports={reports}
          onSelectReport={reportsView.selectReport}
        />
      </div>

      <div className="lg:col-span-7 space-y-4">
        {reportsView.selectedReport ? (
          <ReportNarrativeBox
            summary={reportsView.selectedReport.summary}
            strategicAssessment={reportsView.selectedReport.strategicAssessment}
          />
        ) : (
          <div className="py-20 text-center text-xs text-muted-foreground italic">
            برای مشاهده آمار کامل، یک گزارش را از لیست انتخاب کنید.
          </div>
        )}
      </div>
    </div>
  );
}
