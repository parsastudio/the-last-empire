import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Landmark, TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { StabilityBracketUtility } from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { StabilityBracketVisualUtility } from "@/presentation/components/tactical-map/sidebar/utils/stability-bracket-visual.utility";

interface PoliticalStabilityCardProps {
  stability: number;
  stabilityDelta: number;
}

export function PoliticalStabilityCard({
  stability,
  stabilityDelta,
}: PoliticalStabilityCardProps) {
  const t = useTranslations("overview.stabilityCard");
  const { formatPercent, toDigits } = useLocaleFormatter();

  const bracket = useMemo(
    () => StabilityBracketUtility.getBracket(stability),
    [stability],
  );

  const visual = useMemo(
    () => StabilityBracketVisualUtility.getVisual(bracket.type),
    [bracket.type],
  );

  const deltaSign = stabilityDelta >= 0 ? "+" : "";
  const deltaText = `${deltaSign}${toDigits(stabilityDelta)}% ${t("perTurn")}`;

  return (
    <div
      className={`bg-background/60 border ${visual.borderColorClass} p-4 rounded-2xl space-y-3 shadow-lg relative overflow-hidden transition-all group flex flex-col justify-between text-start font-sans`}
    >
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary/60 via-gdp/40 to-transparent" />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Landmark size={15} className="text-diplomacy shrink-0" />
          <span>{t("title")}</span>
        </div>
        <span
          className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold border ${visual.badgeStyleClass}`}
        >
          {t(`brackets.${bracket.type}`)}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-2 text-center space-y-1">
        <span
          className={`text-3xl md:text-4xl font-black font-mono ${visual.textColorClass} tracking-tight drop-shadow-sm`}
        >
          {formatPercent(stability)}
        </span>
        <span className="text-[10px] text-muted-foreground font-sans flex items-center gap-1">
          <Sparkles size={11} className={visual.textColorClass} />
          <span>{t(`rateTexts.${bracket.type}`)}</span>
        </span>
      </div>

      <div className="bg-secondary/50 border border-border/50 p-2 rounded-xl flex items-center justify-between text-[10px] font-mono">
        <span className="text-muted-foreground font-sans flex items-center gap-1">
          {stabilityDelta >= 0 ? (
            <TrendingUp size={11} className="text-gdp" />
          ) : (
            <TrendingDown size={11} className="text-military" />
          )}
          {t("fluctuation")}
        </span>
        <span
          className={`font-extrabold ${
            stabilityDelta >= 0 ? "text-gdp" : "text-military"
          }`}
        >
          {deltaText}
        </span>
      </div>
    </div>
  );
}
