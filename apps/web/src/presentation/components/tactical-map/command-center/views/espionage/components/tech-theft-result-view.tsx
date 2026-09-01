import React from "react";
import { EspionageTechTheftData } from "@/domain/espionage/espionage.schema";
import { PersianNumberFormatter } from "@geopolitics/domain";
import { Award, Cpu } from "lucide-react";

export function TechTheftResultView({
  data,
}: {
  data: EspionageTechTheftData;
}) {
  return (
    <div className="bg-background/60 border border-border/40 p-3.5 rounded-2xl space-y-2 font-mono text-xs">
      <span className="text-[10px] text-muted-foreground font-sans font-bold block">
        اسرار استخراج‌شده و اعمال‌شده بر ساختار ملی شما:
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
        {data.militaryTechGained > 0 && (
          <div className="bg-secondary/40 p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Award size={14} className="text-amber-400" />
              <span className="text-muted-foreground font-sans text-[10px]">
                رشد فناوری نظامی و دفاعی:
              </span>
            </div>
            <span className="font-bold text-amber-400 text-xs">
              +
              {PersianNumberFormatter.toPersianDigits(
                data.militaryTechGained.toFixed(1),
              )}{" "}
              سطح
            </span>
          </div>
        )}

        {data.industrialTechGained > 0 && (
          <div className="bg-secondary/40 p-2.5 rounded-xl border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Cpu size={14} className="text-emerald-400" />
              <span className="text-muted-foreground font-sans text-[10px]">
                رشد فناوری صنعتی (R&D):
              </span>
            </div>
            <span className="font-bold text-emerald-400 text-xs">
              +
              {PersianNumberFormatter.toPersianDigits(
                data.industrialTechGained.toFixed(1),
              )}{" "}
              سطح
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
