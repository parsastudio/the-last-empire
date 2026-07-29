import { useState, useCallback } from "react";
import { CombatReport } from "@/domain/reports/combat-report.schema";

export function useWideReports(reports: CombatReport[]) {
  const [selectedReport, setSelectedReport] = useState<CombatReport | null>(
    reports[0] || null,
  );

  const selectReport = useCallback((report: CombatReport) => {
    setSelectedReport(report);
  }, []);

  return {
    selectedReport,
    selectReport,
  };
}
