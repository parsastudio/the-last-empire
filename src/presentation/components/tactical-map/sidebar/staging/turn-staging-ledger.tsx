import React from "react";
import { ClipboardList, Coins } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface StagedAction {
  id: string;
  typeLabel: string;
  cost: number;
}

interface TurnStagingLedgerProps {
  stagedActions: StagedAction[];
  onClearStaged?: () => void;
}

export function TurnStagingLedger({
  stagedActions,
  onClearStaged,
}: TurnStagingLedgerProps) {
  if (stagedActions.length === 0) return null;

  const totalCost = stagedActions.reduce((sum, a) => sum + a.cost, 0);

  return (
    <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl space-y-2 font-mono text-xs dir-rtl text-right">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5 font-sans font-bold text-foreground">
          <ClipboardList size={14} className="text-gdp" />
          <span>تاریخچه اقدامات این نوبت</span>
        </div>
        {onClearStaged && (
          <button
            onClick={onClearStaged}
            className="text-[10px] text-military hover:underline cursor-pointer font-sans"
          >
            پاکسازی
          </button>
        )}
      </div>

      <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1 scrollbar-thin">
        {stagedActions.map((act) => (
          <div
            key={act.id}
            className="flex items-center justify-between bg-background/50 p-2 rounded-xl border border-border/40 text-[10px]"
          >
            <span className="font-sans font-medium text-foreground">
              {act.typeLabel}
            </span>
            <span className="font-bold text-treasury">
              {PersianNumberFormatter.formatCurrency(act.cost, true)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-1 border-t border-border/40 text-[11px] font-bold">
        <span className="font-sans text-muted-foreground">
          مجموع هزینه‌های کسرشده:
        </span>
        <span className="text-gdp flex items-center gap-1">
          <Coins size={12} />
          {PersianNumberFormatter.formatCurrency(totalCost, true)}
        </span>
      </div>
    </div>
  );
}
