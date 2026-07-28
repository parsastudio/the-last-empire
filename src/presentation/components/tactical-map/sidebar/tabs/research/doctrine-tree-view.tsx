import React, { useState } from "react";
import {
  DoctrineBranchSelector,
  DoctrineBranch,
} from "./doctrine-branch-selector";
import { CheckCircle } from "lucide-react";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";
import { PRESENTATION_DOCTRINES } from "./doctrines.config";

interface DoctrineTreeViewProps {
  nationId?: string;
  unlockedDoctrines?: string[];
}

export function DoctrineTreeView({
  nationId = "NATION_118",
  unlockedDoctrines = [],
}: DoctrineTreeViewProps) {
  const [activeBranch, setActiveBranch] =
    useState<DoctrineBranch>("INDUSTRIAL_TECH");
  const { dispatchAction } = useGameActions();

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

  const filtered = PRESENTATION_DOCTRINES.filter(
    (d) => d.branch === activeBranch,
  );

  return (
    <div className="space-y-3 dir-rtl text-right">
      <DoctrineBranchSelector
        activeBranch={activeBranch}
        onChangeBranch={setActiveBranch}
      />

      <div className="space-y-2">
        {filtered.map((doc) => {
          const isUnlocked = unlockedDoctrines.includes(doc.id);
          return (
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

              {isUnlocked ? (
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
          );
        })}
      </div>
    </div>
  );
}
