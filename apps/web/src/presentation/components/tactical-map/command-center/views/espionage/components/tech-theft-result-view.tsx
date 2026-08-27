import React from "react";
import { EspionageTechTheftData } from "@/domain/espionage/espionage.schema";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

export function TechTheftResultView({
  data,
}: {
  data: EspionageTechTheftData;
}) {
  return (
    <div className="bg-background/60 border border-border/40 p-3.5 rounded-2xl space-y-2 font-mono text-xs">
      <span className="text-[10px] text-muted-foreground font-sans font-bold block">
        امتیازات استخراج‌شده و اعمال‌شده بر ارکان کشور شما:
      </span>
      <div className="grid grid-cols-2 gap-2 text-[10px]">
        {data.militaryTechGained > 0 && (
          <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
            <span className="text-muted-foreground block font-sans text-[9px]">
              رشد فناوری دفاعی:
            </span>
            <span className="font-bold text-amber-500 block mt-0.5">
              +
              {PersianNumberFormatter.toPersianDigits(
                data.militaryTechGained.toFixed(1),
              )}{" "}
              سطح
            </span>
          </div>
        )}
        {data.industrialLevelGained > 0 && (
          <div className="bg-secondary/40 p-2 rounded-xl border border-border/40">
            <span className="text-muted-foreground block font-sans text-[9px]">
              رشد سطح صنعت:
            </span>
            <span className="font-bold text-gdp block mt-0.5">
              +
              {PersianNumberFormatter.toPersianDigits(
                data.industrialLevelGained,
              )}{" "}
              سطح
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
