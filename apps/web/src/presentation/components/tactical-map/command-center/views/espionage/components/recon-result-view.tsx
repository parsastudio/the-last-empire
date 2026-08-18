import React from "react";
import { EspionageReconData } from "@/domain/espionage/espionage.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export function ReconResultView({ data }: { data: EspionageReconData }) {
  return (
    <div className="bg-background/60 border border-border/40 p-3.5 rounded-2xl space-y-2.5 font-mono text-xs">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-sans font-bold border-b border-border/40 pb-1.5">
        <span>اطلاعات استراتژیک کشف‌شده:</span>
        <span className="text-gdp">
          خزانه: {PersianNumberFormatter.formatCurrency(data.treasury)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-[10px]">
        <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            پیاده‌نظام:
          </span>
          <span className="font-bold text-foreground block mt-0.5">
            {PersianNumberFormatter.toPersianDigits(
              data.infantry.toLocaleString("en-US"),
            )}
          </span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            زرهی و تانک:
          </span>
          <span className="font-bold text-foreground block mt-0.5">
            {PersianNumberFormatter.toPersianDigits(
              data.armor.toLocaleString("en-US"),
            )}
          </span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            پدافند موشکی:
          </span>
          <span className="font-bold text-foreground block mt-0.5">
            {PersianNumberFormatter.toPersianDigits(
              data.airDefense.toLocaleString("en-US"),
            )}
          </span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            جنگنده‌ها:
          </span>
          <span className="font-bold text-foreground block mt-0.5">
            {PersianNumberFormatter.toPersianDigits(
              data.airForce.toLocaleString("en-US"),
            )}
          </span>
        </div>
        <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
          <span className="text-muted-foreground block font-sans text-[9px]">
            پهپاد و موشک:
          </span>
          <span className="font-bold text-foreground block mt-0.5">
            {PersianNumberFormatter.toPersianDigits(
              data.droneMissile.toLocaleString("en-US"),
            )}
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
