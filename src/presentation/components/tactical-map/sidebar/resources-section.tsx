import React from "react";
import { Cpu, Fuel, Wrench, Users } from "lucide-react";

interface ResourcesSectionProps {
  oil: number;
  steel: number;
  manpower: number;
  industrialLevel: number;
}

export function ResourcesSection({
  oil,
  steel,
  manpower,
  industrialLevel,
}: ResourcesSectionProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 px-1">
        <Cpu size={13} className="text-primary" />
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
          منابع حیاتی و صنعت
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono">
        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <Fuel size={12} className="text-treasury" />
            <span>ذخایر نفت خام</span>
          </div>
          <span className="text-xs font-bold text-foreground block">
            {oil.toLocaleString()} بشکه
          </span>
        </div>
        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <Wrench size={12} className="text-primary" />
            <span>ذخایر فولاد</span>
          </div>
          <span className="text-xs font-bold text-foreground block">
            {steel.toLocaleString()} تن
          </span>
        </div>
        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <Users size={12} className="text-gdp" />
            <span>نیروی انسانی آماده</span>
          </div>
          <span className="text-xs font-bold text-foreground block">
            {manpower.toLocaleString()} نفر
          </span>
        </div>
        <div className="bg-background/40 border border-border/60 p-3 rounded-xl space-y-1">
          <span className="text-[9px] text-muted-foreground block">
            سطح توسعه صنعتی
          </span>
          <span className="text-xs font-bold text-gdp block">
            سطح {industrialLevel}
          </span>
        </div>
      </div>
    </div>
  );
}
