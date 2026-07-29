import React from "react";
import { DoctrineBranchColumn } from "./components/doctrine-branch-column";
import { useWideResearch } from "./hooks/use-wide-research";

interface WideResearchViewProps {
  unlockedDoctrines?: string[];
  doctrinePoints?: number;
  nationId?: string;
}

export function WideResearchView({
  unlockedDoctrines = ["gdp-booster"],
  doctrinePoints = 0,
  nationId = "NATION_118",
}: WideResearchViewProps) {
  const research = useWideResearch({
    unlockedDoctrines,
    nationId,
  });

  return (
    <div className="space-y-4 dir-rtl text-right">
      <div className="bg-secondary/40 border border-border/60 p-3 rounded-2xl flex items-center justify-between font-mono text-xs">
        <span className="text-muted-foreground font-sans">
          موجودی امتیاز دکترین راهبردی:
        </span>
        <span className="font-bold text-gdp text-sm">
          {doctrinePoints.toFixed(1)} امتیاز
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-in fade-in duration-200">
        <DoctrineBranchColumn
          title="شاخه‌ صنعت و لجستیک"
          doctrines={research.industrialDoctrines}
          onUnlock={research.handleUnlock}
        />
        <DoctrineBranchColumn
          title="شاخه‌ دفاع ناهمگون نظامی"
          doctrines={research.asymmetricDoctrines}
          onUnlock={research.handleUnlock}
        />
        <DoctrineBranchColumn
          title="شاخه‌ هژمونی دیپلماتیک"
          doctrines={research.diplomaticDoctrines}
          onUnlock={research.handleUnlock}
        />
      </div>
    </div>
  );
}
