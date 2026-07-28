import React from "react";
import { DoctrineBranchColumn } from "./components/doctrine-branch-column";
import { useToast } from "@/presentation/context/toast-context";
import { DEFAULT_DOCTRINES } from "@/engine/politics/doctrines-list.config";

interface WideResearchViewProps {
  unlockedDoctrines?: string[];
  doctrinePoints?: number;
}

export function WideResearchView({
  unlockedDoctrines = ["gdp-booster"],
  doctrinePoints = 0,
}: WideResearchViewProps) {
  const { showToast } = useToast();

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

  const handleUnlock = (doc: { name: string; cost: number }) => {
    if (doctrinePoints < doc.cost) {
      showToast(
        "کمبود امتیاز دکترین",
        `برای آنلاک این دکترین به ${doc.cost} امتیاز نیاز دارید.`,
        "error",
      );
      return;
    }
    showToast(
      "آنلاک دکترین",
      `درخواست آنلاک دکترین ${doc.name} با موفقیت ثبت شد.`,
      "success",
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
