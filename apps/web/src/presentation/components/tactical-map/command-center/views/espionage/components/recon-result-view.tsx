import React from "react";
import { EspionageReconData } from "@/domain/espionage/espionage.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { ShieldCheck } from "lucide-react";

export function ReconResultView({ data }: { data: EspionageReconData }) {
  const guarantorFlag =
    data.guarantorFlagCode || data.guarantorNationId
      ? getFlagEmoji(data.guarantorFlagCode || data.guarantorNationId || "")
      : "";

  return (
    <div className="bg-background/60 border border-border/40 p-3.5 rounded-2xl space-y-2.5 font-mono text-xs">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans font-bold border-b border-border/40 pb-1.5">
        <span>اطلاعات استراتژیک کشف‌شده:</span>
        <span className="text-gdp">
          خزانه: {PersianNumberFormatter.formatCurrency(data.treasury)}
        </span>
      </div>

      {data.guarantorName && (
        <div className="bg-cyan-950/30 border border-cyan-500/40 p-2.5 rounded-xl flex items-center justify-between text-[11px] font-sans">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <ShieldCheck size={14} className="text-cyan-400" />
            <span>چتر امنیتی کشف‌شده:</span>
            <span>تحت ضمانت {data.guarantorName}</span>
            <span>{guarantorFlag}</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 font-extrabold bg-cyan-500/20 px-2 py-0.5 rounded-md border border-cyan-500/30">
            فناوری لِوِل{" "}
            {PersianNumberFormatter.toPersianDigits(
              data.guarantorTechLevel || 1,
            )}
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            پیاده‌نظام:
          </span>
          <span className="font-bold text-foreground block mt-0.5">
            {PersianNumberFormatter.formatNumberWithCommas(data.infantry)}
          </span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            زرهی و تانک:
          </span>
          <span className="font-bold text-foreground block mt-0.5">
            {PersianNumberFormatter.formatNumberWithCommas(data.armor)}
          </span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            پدافند موشکی:
          </span>
          <span className="font-bold text-foreground block mt-0.5">
            {PersianNumberFormatter.formatNumberWithCommas(data.airDefense)}
          </span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            جنگنده‌ها:
          </span>
          <span className="font-bold text-foreground block mt-0.5">
            {PersianNumberFormatter.formatNumberWithCommas(data.airForce)}
          </span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            پهپاد و موشک:
          </span>
          <span className="font-bold text-foreground block mt-0.5">
            {PersianNumberFormatter.formatNumberWithCommas(data.droneMissile)}
          </span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            سطح فناوری:
          </span>
          <span className="font-bold text-amber-500 block mt-0.5">
            سطح {PersianNumberFormatter.toPersianDigits(data.techLevel)}
          </span>
        </div>
      </div>
    </div>
  );
}
