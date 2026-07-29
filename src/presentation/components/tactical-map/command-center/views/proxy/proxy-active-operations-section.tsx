import React from "react";
import { ActiveProxyOperation } from "./hooks/use-wide-proxy";
import { ProxyOperationCard } from "./proxy-operation-card";
import { Flame } from "lucide-react";

interface ProxyActiveOperationsSectionProps {
  operations: ActiveProxyOperation[];
  onSelectOperationTarget: (targetId: string) => void;
}

export function ProxyActiveOperationsSection({
  operations,
  onSelectOperationTarget,
}: ProxyActiveOperationsSectionProps) {
  const totalExpenditure = operations.reduce(
    (sum, op) => sum + op.currentBudget,
    0,
  );

  return (
    <div className="space-y-4 dir-rtl text-right">
      <div className="flex items-center justify-between bg-secondary/40 border border-border/60 p-3.5 rounded-2xl">
        <div className="flex items-center gap-2">
          <Flame size={16} className="text-military animate-pulse" />
          <span className="text-xs font-bold text-foreground font-sans">
            عملیات‌های فعال جنگ نیابتی
          </span>
        </div>

        <span className="text-xs font-mono font-bold text-gdp">
          {operations.length} جبهه فعال | هزینه: $
          {totalExpenditure.toLocaleString("fa-IR")}
        </span>
      </div>

      {operations.length === 0 ? (
        <div className="py-16 text-center text-xs text-muted-foreground italic bg-background/30 border border-border/60 rounded-3xl p-6">
          هیچ عملیات نیابتی فعالی وجود ندارد. از منوی اختصاص بودجه برای تضعیف
          حکومت‌های متخاصم استفاده کنید.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
          {operations.map((op) => (
            <ProxyOperationCard
              key={op.targetId}
              operation={op}
              onSelect={onSelectOperationTarget}
            />
          ))}
        </div>
      )}
    </div>
  );
}
