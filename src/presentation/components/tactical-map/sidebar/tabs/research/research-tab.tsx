import React from "react";
import { Cpu } from "lucide-react";
import { DoctrineListView } from "./doctrine-list-view";

export function ResearchTab() {
  const doctrines = [
    { id: "gdp-booster", name: "خطوط تولید اتوماتیک", cost: 3, unlocked: true },
    { id: "low-upkeep", name: "شبکه لجستیک سبز", cost: 5, unlocked: false },
    {
      id: "border-fortification",
      name: "پروتکل‌های استقرار مرزی",
      cost: 3,
      unlocked: false,
    },
    {
      id: "drone-swarm",
      name: "تسلیحات شبکه‌ای پهپادی",
      cost: 5,
      unlocked: false,
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-1">
          <Cpu size={13} className="text-primary" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            درخت دکترین‌ها و پژوهش راهبردی
          </span>
        </div>

        <DoctrineListView doctrines={doctrines} />
      </div>
    </div>
  );
}
