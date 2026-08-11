import React from "react";
import { DoctrineBranchColumn } from "@/presentation/components/tactical-map/command-center/views/components/doctrine-branch-column";
import { useWideResearch } from "@/presentation/components/tactical-map/command-center/views/hooks/use-wide-research";
import { Nation } from "@/domain/nation/nation.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { Coins, Fuel } from "lucide-react";

interface WideResearchViewProps {
  unlockedDoctrines?: string[];
  nationId: string;
  nation?: Nation | null;
}

export function WideResearchView({
  unlockedDoctrines = ["gdp-booster"],
  nationId,
  nation,
}: WideResearchViewProps) {
  const activeNationId = nation ? nation.id : nationId;
  const treasury = nation ? nation.treasury : 0;
  const oilStock = nation ? nation.resources.oil : 0;

  const research = useWideResearch({
    unlockedDoctrines: nation
      ? nation.doctrines?.unlockedDoctrines || []
      : unlockedDoctrines,
    nationId: activeNationId,
    treasury,
    oilStock,
  });

  return (
    <div className="space-y-5 dir-rtl text-right animate-in fade-in duration-200">
      <div className="bg-secondary/40 border border-border/60 p-4 rounded-2xl flex items-center justify-between font-mono text-xs">
        <span className="text-muted-foreground font-sans font-bold text-xs">
          موجودی استراتژیک برای توسعه دکترین‌ها:
        </span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-gdp font-extrabold text-xs">
            <Coins size={14} />
            <span>{PersianNumberFormatter.formatCurrency(treasury, true)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-treasury font-extrabold text-xs">
            <Fuel size={14} />
            <span>
              {PersianNumberFormatter.toPersianDigits(
                oilStock.toLocaleString("en-US"),
              )}{" "}
              بلوک
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
