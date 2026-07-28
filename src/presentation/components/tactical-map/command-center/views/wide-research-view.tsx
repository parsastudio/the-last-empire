import React from "react";
import { DoctrineBranchColumn } from "./components/doctrine-branch-column";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { DEFAULT_DOCTRINES } from "@/engine/politics/doctrines-list.config";

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
  const { dispatchAction } = useGameActions();

  const industrialDoctrines = DEFAULT_DOCTRINES.filter(
    (d) => d.branch === "INDUSTRIAL_TECH",
  ).map((d) => ({
    id: d.id,
    name: d.name,
    cost: d.cost,
    unlocked: unlockedDoctrines.includes(d.id),
  }));

  const asymmetricDoctrines = DEFAULT_DOCTRINES.filter(
    (d) => d.branch === "ASYMMETRIC_MILITARY",
  ).map((d) => ({
    id: d.id,
    name: d.name,
    cost: d.cost,
    unlocked: unlockedDoctrines.includes(d.id),
  }));

  const diplomaticDoctrines = DEFAULT_DOCTRINES.filter(
    (d) => d.branch === "DIPLOMATIC_HEGEMONY",
  ).map((d) => ({
    id: d.id,
    name: d.name,
    cost: d.cost,
    unlocked: unlockedDoctrines.includes(d.id),
  }));

  const handleUnlock = async (doc: {
    id: string;
    name: string;
    cost: number;
  }) => {
    await dispatchAction(
      {
        id: `unlock-${Date.now()}`,
        nationId,
        type: "UNLOCK_DOCTRINE",
        doctrineId: doc.id,
      },
      `آنلاک دکترین ${doc.name} انجام شد.`,
    );
  };

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
          doctrines={industrialDoctrines}
          onUnlock={handleUnlock}
        />
        <DoctrineBranchColumn
          title="شاخه‌ دفاع ناهمگون نظامی"
          doctrines={asymmetricDoctrines}
          onUnlock={handleUnlock}
        />
        <DoctrineBranchColumn
          title="شاخه‌ هژمونی دیپلماتیک"
          doctrines={diplomaticDoctrines}
          onUnlock={handleUnlock}
        />
      </div>
    </div>
  );
}
