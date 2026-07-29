import React from "react";
import { ActiveProxyOperation } from "./hooks/use-wide-proxy";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { Flame, ShieldAlert, Coins } from "lucide-react";

interface ProxyOperationCardProps {
  operation: ActiveProxyOperation;
  onSelect: (targetId: string) => void;
}

export function ProxyOperationCard({
  operation,
  onSelect,
}: ProxyOperationCardProps) {
  const flagEmoji = getFlagEmoji(operation.targetFlagCode);

  return (
    <div className="bg-background/50 border border-border/80 p-4 rounded-2xl space-y-3 dir-rtl text-right">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="text-2xl select-none"
            role="img"
            aria-label={operation.targetName}
          >
            {flagEmoji}
          </span>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-foreground">
              {operation.targetName}
            </h4>
            <span className="text-[9px] font-mono text-muted-foreground block">
              شناسه: {operation.targetId}
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-xl bg-military/15 border border-military/30 text-military text-[10px] font-mono font-bold flex items-center gap-1">
          <Flame size={12} />
          <span>فعال</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 font-mono text-[10px]">
        <div className="bg-secondary/40 p-2 rounded-xl space-y-0.5 border border-border/40">
          <span className="text-muted-foreground block font-sans">
            بودجه جاری
          </span>
          <span className="font-bold text-gdp flex items-center gap-0.5">
            <Coins size={10} />$
            {operation.currentBudget.toLocaleString("fa-IR")}
          </span>
        </div>

        <div className="bg-secondary/40 p-2 rounded-xl space-y-0.5 border border-border/40">
          <span className="text-muted-foreground block font-sans">
            تخریب ثبات
          </span>
          <span className="font-bold text-military">
            -{operation.stabilityDrainPerTurn}% / نوبت
          </span>
        </div>

        <div className="bg-secondary/40 p-2 rounded-xl space-y-0.5 border border-border/40">
          <span className="text-muted-foreground block font-sans">
            ثبات فعلی هدف
          </span>
          <span className="font-bold text-foreground">
            {operation.targetStability}%
          </span>
        </div>
      </div>

      {operation.targetStability < 25 && (
        <div className="flex items-center gap-1.5 p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[10px] text-amber-500 font-sans">
          <ShieldAlert size={13} className="shrink-0" />
          <span>ثبات هدف نزدیک به حد فروپاشی (زیر ۱۰٪ کودتا رخ می‌دهد)</span>
        </div>
      )}

      <button
        onClick={() => onSelect(operation.targetId)}
        className="w-full py-2 bg-secondary hover:bg-secondary/80 text-foreground border border-border/80 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
      >
        افزایش بودجه نیابتی
      </button>
    </div>
  );
}
