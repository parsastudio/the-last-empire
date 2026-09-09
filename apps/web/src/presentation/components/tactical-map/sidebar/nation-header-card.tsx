import React, { useMemo } from "react";
import { Trophy, Swords, Cpu, Users } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";

interface NationHeaderCardProps {
  name: string;
  code: string;
  flagCode: string;
  governmentType: string;
  population: number;
  militaryTechLevel?: number;
  industrialLevel?: number;
  rank?: number;
}

export function NationHeaderCard({
  name,
  code,
  flagCode,
  governmentType,
  population,
  militaryTechLevel = 1.0,
  industrialLevel = 1.0,
  rank = 1,
}: NationHeaderCardProps) {
  const formatted = useMemo(() => {
    const summary = NationPresentationMapper.formatNationSummary(
      code,
      name,
      code,
      flagCode,
      rank,
      0,
      population,
      governmentType,
    );

    return {
      flagEmoji: summary.flagEmoji,
      formattedPopulation: summary.populationText,
      governmentLabel: summary.governmentLabel,
      militaryTechFormatted: PersianNumberFormatter.toPersianDigits(
        militaryTechLevel.toFixed(1),
      ),
      industrialTechFormatted: PersianNumberFormatter.toPersianDigits(
        industrialLevel.toFixed(1),
      ),
    };
  }, [
    code,
    flagCode,
    name,
    population,
    rank,
    governmentType,
    militaryTechLevel,
    industrialLevel,
  ]);

  return (
    <div className="bg-card/90 border border-border/80 p-5 rounded-3xl space-y-4 shadow-xl backdrop-blur-xl dir-rtl text-right font-sans relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-4xl shadow-inner select-none shrink-0 ring-1 ring-primary/20">
            {formatted.flagEmoji}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-black text-foreground tracking-tight">
                {name}
              </h2>
              <span className="text-[10px] font-mono font-bold bg-secondary px-2 py-0.5 rounded-md text-muted-foreground border border-border/60">
                {code}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              نوع نظام حاکم:{" "}
              <span className="text-foreground font-bold font-sans">
                {formatted.governmentLabel}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 px-3.5 py-1.5 rounded-2xl w-fit shrink-0">
          <Trophy size={16} className="text-amber-500" />
          <span className="text-xs font-black font-mono text-amber-400">
            رتبه جهانی #{PersianNumberFormatter.toPersianDigits(rank)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
        <div className="bg-background/60 border border-border/60 p-3 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] text-muted-foreground font-sans font-bold flex items-center gap-1.5">
            <Users size={13} className="text-primary shrink-0" />
            <span>جمعیت کل قلمروها</span>
          </span>
          <span className="text-xs font-extrabold text-foreground block">
            {formatted.formattedPopulation}
          </span>
        </div>

        <div className="bg-background/60 border border-amber-500/30 p-3 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] text-muted-foreground font-sans font-bold flex items-center gap-1.5">
            <Swords size={13} className="text-amber-400 shrink-0" />
            <span>سطح فناوری دفاعی</span>
          </span>
          <span className="text-xs font-black text-amber-400 block">
            لِوِل {formatted.militaryTechFormatted}
          </span>
        </div>

        <div className="bg-background/60 border border-primary/30 p-3 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] text-muted-foreground font-sans font-bold flex items-center gap-1.5">
            <Cpu size={13} className="text-primary shrink-0" />
            <span>سطح فناوری صنعتی</span>
          </span>
          <span className="text-xs font-black text-primary block">
            لِوِل {formatted.industrialTechFormatted}
          </span>
        </div>
      </div>
    </div>
  );
}
