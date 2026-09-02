import React, { useState } from "react";
import { Users2, Shield } from "lucide-react";
import { PersianNumberFormatter } from "@geopolitics/domain";
import { NationAllyDetail } from "./diplomacy-allies-resolver.utility";
import { DiplomacyAllyPopover } from "./diplomacy-ally-popover";

interface DiplomacyAlliesBoxProps {
  allies?: NationAllyDetail[];
  onSelectAlly?: (code: string) => void;
}

export function DiplomacyAlliesBox({
  allies = [],
  onSelectAlly,
}: DiplomacyAlliesBoxProps) {
  const [selectedAllyId, setSelectedAllyId] = useState<string | null>(null);

  const activeAlly = allies.find((a) => a.id === selectedAllyId) || null;

  const handleToggleAlly = (allyId: string) => {
    setSelectedAllyId((prev) => (prev === allyId ? null : allyId));
  };

  if (allies.length === 0) {
    return (
      <div className="bg-secondary/40 border border-border/50 p-2.5 rounded-2xl flex items-center justify-between text-xs font-sans dir-rtl text-right">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users2 size={13} className="text-muted-foreground shrink-0" />
          <span className="text-[11px] font-bold">لیست متحدین:</span>
          <span className="text-[10px] flex items-center gap-1">
            <Shield size={11} />
            فاقد شریک استراتژیک
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground bg-secondary/80 px-2 py-0.5 rounded-md border border-border/50">
          ۰
        </span>
      </div>
    );
  }

  return (
    <div className="bg-secondary/40 border border-border/50 p-3 rounded-2xl space-y-2 dir-rtl text-right font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users2 size={14} className="text-primary shrink-0" />
          <span className="text-muted-foreground font-bold text-[11px]">
            لیست متحدین استراتژیک:
          </span>
        </div>

        <span className="text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/30 px-2 py-0.5 rounded-lg">
          {PersianNumberFormatter.toPersianDigits(allies.length)} کشور
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap pt-0.5">
        {allies.map((ally) => {
          const isSelected = selectedAllyId === ally.id;
          return (
            <button
              key={ally.id}
              type="button"
              onClick={() => handleToggleAlly(ally.id)}
              title={`${ally.name} (رتبه #${ally.rank})`}
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer shadow-sm select-none relative ${
                isSelected
                  ? "bg-primary/25 border-primary border-2 scale-105 shadow-primary/20 ring-1 ring-primary/40"
                  : "bg-secondary/80 hover:bg-secondary border border-border/70 hover:border-primary/50 hover:scale-105 active:scale-95"
              }`}
            >
              <span>{ally.flagEmoji}</span>
              {ally.isHuman && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-background" />
              )}
            </button>
          );
        })}
      </div>

      {activeAlly && onSelectAlly && (
        <DiplomacyAllyPopover
          ally={activeAlly}
          onClose={() => setSelectedAllyId(null)}
          onSelectCountry={onSelectAlly}
        />
      )}
    </div>
  );
}
