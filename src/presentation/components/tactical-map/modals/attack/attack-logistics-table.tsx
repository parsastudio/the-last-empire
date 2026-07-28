import React from "react";
import { Coins, Fuel } from "lucide-react";

interface AttackLogisticsTableProps {
  estimatedCost: number;
}

export function AttackLogisticsTable({
  estimatedCost,
}: AttackLogisticsTableProps) {
  return (
    <div className="space-y-2.5">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
        برآورد هزینه‌ها و لجستیک عملیات
      </span>

      <div className="bg-background/40 border border-border/80 p-3.5 rounded-2xl space-y-2 font-mono text-xs">
        <div className="flex justify-between items-center pb-2 border-b border-border/40">
          <span className="text-muted-foreground flex items-center gap-1.5 font-sans text-[11px]">
            <Coins size={13} className="text-gdp" />
            هزینه ترانزیت و عملیات
          </span>
          <span className="font-bold text-foreground">
            ${estimatedCost.toLocaleString("fa-IR")} دلار
          </span>
        </div>

        <div className="flex justify-between items-center pt-0.5">
          <span className="text-muted-foreground flex items-center gap-1.5 font-sans text-[11px]">
            <Fuel size={13} className="text-primary" />
            سوخت و نفت مورد نیاز سوخت‌رسانی
          </span>
          <span className="font-bold text-foreground">۵۰ بشکه</span>
        </div>
      </div>
    </div>
  );
}
