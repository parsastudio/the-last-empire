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
    <div className="p-3.5 rounded-2xl bg-secondary/95 border border-primary/40 shadow-2xl backdrop-blur-2xl space-y-3 animate-fade-smooth relative text-right dir-rtl font-sans">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl select-none shrink-0">
            {ally.flagEmoji}
          </span>
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-foreground">
                {ally.name}
              </h4>
              <span className="text-[9px] font-mono font-bold bg-background/80 px-1.5 py-0.5 rounded border border-border/50 text-muted-foreground">
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
          <X size={14} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
        <div className="bg-background/60 p-2 rounded-xl border border-border/50 space-y-0.5">
          <span className="text-muted-foreground font-sans flex items-center gap-1 text-[9px]">
            <Award size={11} className="text-amber-400" />
            رتبه جهانی:
          </span>
          <span className="font-extrabold text-foreground block">
            #{PersianNumberFormatter.toPersianDigits(ally.rank)}
          </span>
        </div>

        <div className="bg-background/60 p-2 rounded-xl border border-border/50 space-y-0.5">
          <span className="text-muted-foreground font-sans flex items-center gap-1 text-[9px]">
            <Coins size={11} className="text-gdp" />
            تولید ناخالص:
          </span>
          <span className="font-extrabold text-gdp block truncate">
            {ally.gdpFormatted}
          </span>
        </div>

        <div className="bg-background/60 p-2 rounded-xl border border-border/50 space-y-0.5">
          <span className="text-muted-foreground font-sans flex items-center gap-1 text-[9px]">
            <ShieldCheck size={11} className="text-primary" />
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
            <Handshake size={11} className="text-diplomacy" />
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
        className="w-full py-2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.99]"
      >
        <span>مشاهده شناسنامه و میز دیپلماسی</span>
        <ArrowLeft size={13} className="shrink-0" />
      </button>
    </div>
  );
}
