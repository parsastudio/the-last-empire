import React, { useState } from "react";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { ReportsSidebarTab } from "../../reports/reports-sidebar-tab";
import { CasualtyTable } from "../../reports/casualty-table";
import { ReportNarrativeBox } from "./components/report-narrative-box";

interface WideReportsViewProps {
  reports: CombatReport[];
}

export function WideReportsView({ reports }: WideReportsViewProps) {
  const [selectedReport, setSelectedReport] = useState<CombatReport | null>(
    reports[0] || null,
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200 dir-rtl">
      <div className="lg:col-span-5 bg-background/30 p-4 border border-border/60 rounded-3xl">
        <ReportsSidebarTab
          reports={reports}
          onSelectReport={setSelectedReport}
        />
      </div>

      <div className="lg:col-span-7 space-y-4">
        {selectedReport ? (
          <>
            <ReportNarrativeBox
              summary={selectedReport.summary}
              strategicAssessment={selectedReport.strategicAssessment}
            />

            <CasualtyTable
              attackerName={selectedReport.attackerName}
              defenderName={selectedReport.defenderName}
              attackerCasualties={selectedReport.attackerCasualties}
              defenderCasualties={selectedReport.defenderCasualties}
              conqueredAreaSqKm={selectedReport.conqueredAreaSqKm}
            />
          </>
        ) : (
          <div className="py-20 text-center text-xs text-muted-foreground italic">
            برای مشاهده آمار کامل، یک گزارش را از لیست انتخاب کنید.
          </div>
        )}
      </div>
    </div>
  );
}
