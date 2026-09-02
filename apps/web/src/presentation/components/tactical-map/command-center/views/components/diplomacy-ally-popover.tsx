import React, { useEffect } from "react";
import {
  X,
  Award,
  Coins,
  ShieldCheck,
  ArrowLeft,
  Handshake,
} from "lucide-react";
import { PersianNumberFormatter } from "@geopolitics/domain";
import { NationAllyDetail } from "./diplomacy-allies-resolver.utility";

interface DiplomacyAllyPopoverProps {
  ally: NationAllyDetail;
  onClose: () => void;
  onSelectCountry: (code: string) => void;
}

export function DiplomacyAllyPopover({
  ally,
  onClose,
  onSelectCountry,
}: DiplomacyAllyPopoverProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="p-3 rounded-2xl bg-secondary/95 border border-primary/40 shadow-xl backdrop-blur-2xl space-y-2.5 animate-fade-smooth relative text-right dir-rtl font-sans">
      <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="text-xl select-none shrink-0">{ally.flagEmoji}</span>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-foreground">
                {ally.name}
              </h4>
              <span className="text-[9px] font-mono font-bold bg-background/80 px-1.5 py-0.2 rounded border border-border/50 text-muted-foreground">
                {ally.code}
              </span>
            </div>
            {ally.isHuman && (
              <span className="text-[9px] font-bold text-emerald-400 font-sans block">
                امپراتوری شما
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 text-muted-foreground hover:text-foreground hover:bg-background/80 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <X size={13} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono">
        <div className="bg-background/60 p-2 rounded-xl border border-border/50 space-y-0.5">
          <span className="text-muted-foreground font-sans flex items-center gap-1 text-[9px]">
            <Award size={11} className="text-amber-400 shrink-0" />
            رتبه جهانی:
          </span>
          <span className="font-extrabold text-foreground block">
            #{PersianNumberFormatter.toPersianDigits(ally.rank)}
          </span>
        </div>

        <div className="bg-background/60 p-2 rounded-xl border border-border/50 space-y-0.5">
          <span className="text-muted-foreground font-sans flex items-center gap-1 text-[9px]">
            <Coins size={11} className="text-gdp shrink-0" />
            تولید ناخالص:
          </span>
          <span className="font-extrabold text-gdp block truncate">
            {ally.gdpFormatted}
          </span>
        </div>

        <div className="bg-background/60 p-2 rounded-xl border border-border/50 space-y-0.5">
          <span className="text-muted-foreground font-sans flex items-center gap-1 text-[9px]">
            <ShieldCheck size={11} className="text-primary shrink-0" />
            فناوری دفاعی:
          </span>
          <span className="font-extrabold text-primary block">
            لِوِل{" "}
            {PersianNumberFormatter.toPersianDigits(
              ally.militaryTech.toFixed(1),
            )}
          </span>
        </div>

        <div className="bg-background/60 p-2 rounded-xl border border-border/50 space-y-0.5">
          <span className="text-muted-foreground font-sans flex items-center gap-1 text-[9px]">
            <Handshake size={11} className="text-diplomacy shrink-0" />
            نوع پیوند:
          </span>
          <span className="font-extrabold text-foreground block truncate font-sans text-[9px]">
            {ally.allianceTypeLabel}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          onSelectCountry(ally.code);
          onClose();
        }}
        className="w-full py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded-xl text-[10px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
      >
        <span>مشاهده در میز دیپلماسی</span>
        <ArrowLeft size={12} className="shrink-0" />
      </button>
    </div>
  );
}
