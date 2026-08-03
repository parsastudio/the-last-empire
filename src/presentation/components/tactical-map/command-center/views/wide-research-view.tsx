import React from "react";
import { DoctrineBranchColumn } from "@/presentation/components/tactical-map/command-center/views/components/doctrine-branch-column";
import { useWideResearch } from "@/presentation/components/tactical-map/command-center/views/hooks/use-wide-research";
import { ResearchBudgetCard } from "@/presentation/components/tactical-map/sidebar/tabs/politics/research-budget-card";
import { Nation } from "@/domain/nation/nation.schema";

interface WideResearchViewProps {
  unlockedDoctrines?: string[];
  doctrinePoints?: number;
  nationId: string;
  nation?: Nation | null;
}

export function WideResearchView({
  unlockedDoctrines = ["gdp-booster"],
  doctrinePoints = 0,
  nationId,
  nation,
}: WideResearchViewProps) {
  const activeNationId = nation ? nation.id : nationId;

  const research = useWideResearch({
    unlockedDoctrines: nation
      ? nation.doctrines.unlockedDoctrines
      : unlockedDoctrines,
    nationId: activeNationId,
  });

  const activePoints = nation
    ? nation.doctrines.doctrinePoints
    : doctrinePoints;

  return (
    <div className="space-y-5 dir-rtl text-right animate-in fade-in duration-200">
      <ResearchBudgetCard
        nationId={activeNationId}
        gdp={nation?.gdp}
        treasury={nation?.treasury}
        currentBudgetRate={nation?.researchBudgetRate}
        accumulatedCost={nation?.accumulatedResearchCost}
        cycleTurn={nation?.researchCycleTurn}
        industrialLevel={nation?.industrialLevel}
      />

      <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl flex items-center justify-between font-mono text-xs">
        <span className="text-muted-foreground font-sans font-bold">
          موجودی امتیاز پژوهش آماده خرج:
        </span>
        <span className="font-extrabold text-gdp text-sm">
          {activePoints.toFixed(1)} امتیاز
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <DoctrineBranchColumn
          title="شاخه‌ صنعت و لجستیک"
          doctrines={research.industrialDoctrines}
          activePoints={activePoints}
          onUnlock={research.handleUnlock}
        />
        <DoctrineBranchColumn
          title="شاخه‌ دفاع ناهمگون نظامی"
          doctrines={research.asymmetricDoctrines}
          activePoints={activePoints}
          onUnlock={research.handleUnlock}
        />
        <DoctrineBranchColumn
          title="شاخه‌ هژمونی دیپلماتیک"
          doctrines={research.diplomaticDoctrines}
          activePoints={activePoints}
          onUnlock={research.handleUnlock}
        />
      </div>
    </div>
  );
}
