import React, { useState } from "react";
import { X } from "lucide-react";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { ReportListItem } from "./report-list-item";
import { ReportDetailsView } from "./report-details-view";

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
          <ReportDetailsView
            report={selectedReport}
            onBack={() => setSelectedReport(null)}
          />
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
              {reports.map((rep) => (
                <ReportListItem
                  key={rep.id}
                  report={rep}
                  onSelect={setSelectedReport}
                />
              ))}
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
