import React, { useState, useMemo } from "react";
import { Users2, Shield } from "lucide-react";
import { Nation, Province, PersianNumberFormatter } from "@geopolitics/domain";
import {
  DiplomacyAlliesResolver,
  NationAllyDetail,
} from "./diplomacy-allies-resolver.utility";
import { DiplomacyAllyPopover } from "./diplomacy-ally-popover";

interface DiplomacyAlliesBoxProps {
  targetNation: Nation | null;
  nationsMap?: Record<string, Nation>;
  provincesMap?: Record<string, Province>;
  humanNationId?: string;
  onSelectAlly: (code: string) => void;
}

export function DiplomacyAlliesBox({
  targetNation,
  nationsMap,
  provincesMap,
  humanNationId,
  onSelectAlly,
}: DiplomacyAlliesBoxProps) {
  const [selectedAllyId, setSelectedAllyId] = useState<string | null>(null);

  const allies = useMemo<NationAllyDetail[]>(() => {
    return DiplomacyAlliesResolver.resolveAllies(
      targetNation,
      nationsMap,
      provincesMap,
      humanNationId,
    );
  }, [targetNation, nationsMap, provincesMap, humanNationId]);

  const activeAlly = useMemo(() => {
    if (!selectedAllyId) return null;
    return allies.find((a) => a.id === selectedAllyId) || null;
  }, [allies, selectedAllyId]);

  const handleToggleAlly = (allyId: string) => {
    setSelectedAllyId((prev) => (prev === allyId ? null : allyId));
  };

  return (
    <div className="bg-card/90 border border-border/80 p-3.5 rounded-2xl space-y-2.5 shadow-sm dir-rtl text-right font-sans">
      <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-primary/15 border border-primary/30 text-primary">
            <Users2 size={13} />
          </div>
          <div>
            <span className="text-xs font-black text-foreground block">
              لیست متحدین
            </span>
            <span className="text-[9px] text-muted-foreground font-mono block">
              {targetNation
                ? `هم‌پیمانان ${targetNation.name}`
                : "شناسایی هم‌پیمانان"}
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold bg-secondary px-2 py-0.5 rounded-md text-muted-foreground border border-border/60">
          {PersianNumberFormatter.toPersianDigits(allies.length)} متحد
        </span>
      </div>

      {allies.length === 0 ? (
        <div className="py-3 px-2 bg-secondary/30 rounded-xl border border-border/40 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-muted-foreground font-sans">
            <Shield size={12} />
            <span>فاقد هم‌پیمان رسمی یا پیمان امنیتی</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 flex-wrap pt-0.5">
          {allies.map((ally) => {
            const isSelected = selectedAllyId === ally.id;
            return (
              <button
                key={ally.id}
                type="button"
                onClick={() => handleToggleAlly(ally.id)}
                title={`${ally.name} (رتبه #${ally.rank})`}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer shadow-sm select-none relative ${
                  isSelected
                    ? "bg-primary/20 border-primary border-2 scale-105 shadow-primary/20 ring-1 ring-primary/40"
                    : "bg-secondary/70 hover:bg-secondary border border-border/70 hover:border-primary/50 hover:scale-105 active:scale-95"
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
      )}

      {activeAlly && (
        <DiplomacyAllyPopover
          ally={activeAlly}
          onClose={() => setSelectedAllyId(null)}
          onSelectCountry={onSelectAlly}
        />
      )}
    </div>
  );
}
