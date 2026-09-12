import React from "react";
import { useTranslations } from "next-intl";
import { EspionageTechTheftData } from "@/domain/espionage/espionage.schema";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { Award, Cpu } from "lucide-react";

export function TechTheftResultView({
  data,
}: {
  data: EspionageTechTheftData;
}) {
  const t = useTranslations("espionage.results.techTheft");
  const { formatLevel } = useLocaleFormatter();

  return (
    <div className="bg-background/60 border border-border/40 p-3.5 rounded-2xl space-y-2 font-mono text-xs text-start font-sans">
      <span className="text-[10px] text-muted-foreground font-sans font-bold block">
        {t("title")}
      </span>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
        {data.militaryTechGained > 0 && (
          <div className="bg-secondary/40 p-2.5 rounded-xl border border-amber-500/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Award size={14} className="text-amber-400" />
              <span className="text-muted-foreground font-sans text-[10px]">
                {t("milGain")}
              </span>
            </div>
            <span className="font-bold text-amber-400 text-xs">
              {t("levelGain", {
                points: formatLevel(data.militaryTechGained),
              })}
            </span>
          </div>
        )}

        {data.industrialTechGained > 0 && (
          <div className="bg-secondary/40 p-2.5 rounded-xl border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Cpu size={14} className="text-emerald-400" />
              <span className="text-muted-foreground font-sans text-[10px]">
                {t("indGain")}
              </span>
            </div>
            <span className="font-bold text-emerald-400 text-xs">
              {t("levelGain", {
                points: formatLevel(data.industrialTechGained),
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
