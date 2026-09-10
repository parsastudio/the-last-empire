import React, { useState } from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
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
      <div className="bg-emerald-950/15 border border-emerald-500/30 p-3 rounded-2xl flex items-center justify-between text-xs font-sans dir-rtl text-right shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400 shrink-0" />
          <div>
            <span className="text-foreground font-black text-xs block">
              حامیان دفاعی: فاقد هرگونه پیمان دفاعی
            </span>
            <span className="text-[10px] text-muted-foreground block font-medium">
              در صورت تهاجم به این خاک، هیچ کشور ثالثی به دفاع از آن وارد جنگ
              نخواهد شد.
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-lg shrink-0">
          امن جهت تهاجم
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-rose-950/30 via-card to-rose-950/20 border-2 border-rose-500/50 p-3.5 rounded-2xl space-y-2.5 dir-rtl text-right font-sans shadow-md backdrop-blur-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
            <ShieldAlert size={16} />
          </div>
          <div>
            <span className="text-foreground font-black text-xs block">
              هشدار حامیان دفاعی (طرف‌های مستقیم جنگ در صورت تهاجم)
            </span>
            <span className="text-[10px] text-rose-300/90 block font-medium">
              در صورت حمله شما به این کشور، ارتش این حامیان مستقیماً علیه شما
              وارد جنگ می‌شوند:
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2.5 py-1 rounded-xl shrink-0">
          {PersianNumberFormatter.toPersianDigits(allies.length)} حامی متعهد
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
              title={`${ally.name} (حامی دفاعی • رتبه #${ally.rank})`}
              className={`h-9 px-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-sm select-none relative ${
                isSelected
                  ? "bg-rose-500/30 border-rose-400 border-2 scale-105 shadow-rose-500/30 ring-1 ring-rose-400/50"
                  : "bg-secondary/90 hover:bg-secondary border border-rose-500/40 hover:border-rose-400 hover:scale-105 active:scale-95"
              }`}
            >
              <span className="text-lg">{ally.flagEmoji}</span>
              <span className="text-[11px] font-black text-foreground truncate max-w-[100px]">
                {ally.name}
              </span>
              <span className="text-[9px] font-mono font-bold text-amber-400 bg-black/40 px-1.5 py-0.2 rounded border border-border/40">
                لِوِل{" "}
                {PersianNumberFormatter.toPersianDigits(
                  ally.militaryTech.toFixed(1),
                )}
              </span>
              {ally.isHuman && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
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
