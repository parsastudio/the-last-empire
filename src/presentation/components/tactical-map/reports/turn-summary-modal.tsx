import React, { useState } from "react";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { ReportListItem } from "./report-list-item";
import { ReportDetailsView } from "./report-details-view";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";

interface TurnSummaryModalProps {
  isOpen: boolean;
  reports: CombatReport[];
  humanNationId?: string;
  onClose: () => void;
}

export function TurnSummaryModal({
  isOpen,
  reports,
  humanNationId,
  onClose,
}: TurnSummaryModalProps) {
  const [selectedReport, setSelectedReport] = useState<CombatReport | null>(
    null,
  );

  if (!isOpen) return null;

  const handleClose = () => {
    setSelectedReport(null);
    onClose();
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="خلاصه رویدادها و نبردهای مهم این نوبت"
      subtitle="اتاق جنگ | گزارش‌های نوبت"
      maxWidthClass="max-w-2xl"
      onClose={handleClose}
    >
      {selectedReport ? (
        <ReportDetailsView
          report={selectedReport}
          humanNationId={humanNationId}
          onBack={() => setSelectedReport(null)}
        />
      ) : (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="py-12 text-center text-xs text-muted-foreground italic bg-secondary/30 rounded-2xl border border-border/40 p-4">
              در این نوبت هیچ رویداد یا عملیات نظامی خاصی ثبت نشده است.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border">
              {reports.map((rep, index) => (
                <ReportListItem
                  key={`${rep.id}-${index}`}
                  report={rep}
                  onSelect={setSelectedReport}
                />
              ))}
            </div>
          )}

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
    </UnifiedModalShell>
  );
}
