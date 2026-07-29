import React from "react";
import { Cpu } from "lucide-react";
import { DoctrineListView } from "./doctrine-list-view";

interface ResearchTabProps {
  nationId?: string;
  unlockedDoctrines?: string[];
}

export function ResearchTab({
  nationId = "NATION_118",
  unlockedDoctrines = [],
}: ResearchTabProps) {
  return (
    <div className="space-y-5 animate-in fade-in duration-200 dir-rtl text-right">
      <div className="space-y-2.5">
        <div className="flex items-center gap-2 px-1">
          <Cpu size={13} className="text-primary" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            درخت دکترین‌ها و پژوهش راهبردی
          </span>
        </div>

        <DoctrineListView
          nationId={nationId}
          unlockedDoctrines={unlockedDoctrines}
        />
      </div>
    </div>
  );
}
