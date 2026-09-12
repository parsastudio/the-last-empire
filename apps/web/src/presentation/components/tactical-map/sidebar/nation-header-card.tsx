import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Trophy, Swords, Cpu, Users } from "lucide-react";
import { NationPresentationMapper } from "@/presentation/utils/nation-presentation-mapper";
import { GameDifficulty } from "@geopolitics/domain";
import { DIFFICULTY_VISUAL_CONFIGS } from "@/presentation/configs/game-difficulty-visuals.config";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface NationHeaderCardProps {
  name: string;
  code: string;
  flagCode: string;
  governmentType: string;
  population: number;
  militaryTechLevel?: number;
  industrialLevel?: number;
  rank?: number;
  difficulty?: GameDifficulty;
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
  difficulty = "NORMAL",
}: NationHeaderCardProps) {
  const t = useTranslations("overview.header");
  const tDiff = useTranslations("selectNation.difficulty");
  const { locale, toDigits, formatLevel } = useLocaleFormatter();

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
      0,
      locale,
    );

    return {
      flagEmoji: summary.flagEmoji,
      displayName: summary.name,
      formattedPopulation: summary.populationText,
      governmentLabel: summary.governmentLabel,
      militaryTechFormatted: formatLevel(militaryTechLevel),
      industrialTechFormatted: formatLevel(industrialLevel),
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
    locale,
    formatLevel,
  ]);

  const diffVisual =
    DIFFICULTY_VISUAL_CONFIGS[difficulty] ?? DIFFICULTY_VISUAL_CONFIGS.NORMAL;
  const DiffIcon = diffVisual.icon;

  return (
    <div className="bg-card/90 border border-border/80 p-5 rounded-3xl space-y-4 shadow-xl backdrop-blur-xl text-start font-sans relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-4xl shadow-inner select-none shrink-0 ring-1 ring-primary/20">
            {formatted.flagEmoji}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-black text-foreground tracking-tight">
                {formatted.displayName}
              </h2>
              <span className="text-[10px] font-mono font-bold bg-secondary px-2 py-0.5 rounded-md text-muted-foreground border border-border/60">
                {code}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("governmentTypeLabel", { label: formatted.governmentLabel })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-500/15 border border-amber-500/40 px-3.5 py-1.5 rounded-2xl w-fit shrink-0">
          <Trophy size={16} className="text-amber-500" />
          <span className="text-xs font-black font-mono text-amber-400">
            {t("worldRank", {
              rank: toDigits(rank),
            })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-background/60 border border-border/60 p-3 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] text-muted-foreground font-sans font-bold flex items-center gap-1.5">
            <Users size={13} className="text-primary shrink-0" />
            <span>{t("populationLabel")}</span>
          </span>
          <span className="text-xs font-extrabold text-foreground block font-mono">
            {formatted.formattedPopulation}
          </span>
        </div>

        <div className="bg-background/60 border border-amber-500/30 p-3 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] text-muted-foreground font-sans font-bold flex items-center gap-1.5">
            <Swords size={13} className="text-amber-400 shrink-0" />
            <span>{t("militaryTechLabel")}</span>
          </span>
          <span className="text-xs font-black text-amber-400 block font-mono">
            {formatted.militaryTechFormatted}
          </span>
        </div>

        <div className="bg-background/60 border border-primary/30 p-3 rounded-2xl space-y-1 shadow-sm">
          <span className="text-[10px] text-muted-foreground font-sans font-bold flex items-center gap-1.5">
            <Cpu size={13} className="text-primary shrink-0" />
            <span>{t("industrialTechLabel")}</span>
          </span>
          <span className="text-xs font-black text-primary block font-mono">
            {formatted.industrialTechFormatted}
          </span>
        </div>

        <div
          className={`bg-background/60 border ${diffVisual.borderColor} p-3 rounded-2xl space-y-1 shadow-sm`}
          title={tDiff(`${difficulty}.tagline`)}
        >
          <span className="text-[10px] text-muted-foreground font-sans font-bold flex items-center gap-1.5">
            <DiffIcon
              size={13}
              className={`${diffVisual.textColor} shrink-0`}
            />
            <span>{t("difficultyLabel")}</span>
          </span>
          <span
            className={`text-xs font-black ${diffVisual.textColor} block font-sans`}
          >
            {tDiff(`${difficulty}.name`)}
          </span>
        </div>
      </div>
    </div>
  );
}
