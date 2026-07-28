import React, { useState } from "react";
import {
  DoctrineBranchSelector,
  DoctrineBranch,
} from "./doctrine-branch-selector";
import { CheckCircle } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";

interface DoctrineNode {
  id: string;
  name: string;
  branch: DoctrineBranch;
  cost: number;
  unlocked: boolean;
}

interface DoctrineTreeViewProps {
  nationId?: string;
}

export function DoctrineTreeView({
  nationId = "NATION_118",
}: DoctrineTreeViewProps) {
  const [activeBranch, setActiveBranch] =
    useState<DoctrineBranch>("INDUSTRIAL_TECH");
  const { dispatchAction } = useGameActions();

  const doctrinesList: DoctrineNode[] = [
    {
      id: "gdp-booster",
      name: "خطوط تولید اتوماتیک",
      branch: "INDUSTRIAL_TECH",
      cost: 3,
      unlocked: true,
    },
    {
      id: "low-upkeep",
      name: "شبکه لجستیک سبز",
      branch: "INDUSTRIAL_TECH",
      cost: 5,
      unlocked: false,
    },
    {
      id: "border-fortification",
      name: "پروتکل‌های استقرار مرزی",
      branch: "ASYMMETRIC_MILITARY",
      cost: 3,
      unlocked: false,
    },
    {
      id: "drone-swarm",
      name: "تسلیحات شبکه‌ای پهپادی",
      branch: "ASYMMETRIC_MILITARY",
      cost: 5,
      unlocked: false,
    },
    {
      id: "global-influence",
      name: "دیپلماسی رسانه‌ای",
      branch: "DIPLOMATIC_HEGEMONY",
      cost: 3,
      unlocked: false,
    },
  ];

  const handleUnlock = async (docId: string, name: string) => {
    await dispatchAction(
      {
        id: `doc-${Date.now()}`,
        nationId,
        type: "UNLOCK_DOCTRINE",
        doctrineId: docId,
      },
      `دکترین ${name} با موفقیت فعال گردید.`,
    );
  };

  const filtered = doctrinesList.filter((d) => d.branch === activeBranch);

  return (
    <div className="space-y-3 dir-rtl text-right">
      <DoctrineBranchSelector
        activeBranch={activeBranch}
        onChangeBranch={setActiveBranch}
      />

      <div className="space-y-2">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="bg-background/40 border border-border/60 p-3.5 rounded-2xl flex items-center justify-between gap-3"
          >
            <div className="space-y-1 text-right">
              <span className="text-xs font-bold text-foreground block">
                {doc.name}
              </span>
              <span className="text-[9px] font-mono text-muted-foreground block">
                هزینه: {doc.cost} امتیاز دکترین
              </span>
            </div>

            {doc.unlocked ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-gdp">
                <CheckCircle size={13} />
                <span>فعال شده</span>
              </span>
            ) : (
              <button
                onClick={() => handleUnlock(doc.id, doc.name)}
                className="px-3 py-1.5 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-xl text-[10px] font-bold shadow-sm cursor-pointer"
              >
                باز کردن
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
