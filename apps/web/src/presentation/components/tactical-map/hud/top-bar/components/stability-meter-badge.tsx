import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Landmark } from "lucide-react";
import { StabilityBracketUtility } from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";
import { StabilityBracketVisualUtility } from "@/presentation/components/tactical-map/sidebar/utils/stability-bracket-visual.utility";

interface StabilityMeterBadgeProps {
  stability: number;
}

export function StabilityMeterBadge({ stability }: StabilityMeterBadgeProps) {
  const t = useTranslations("overview.stabilityCard");
  const { toDigits, formatPercent } = useLocaleFormatter();

  const bracket = useMemo(
    () => StabilityBracketUtility.getBracket(stability),
    [stability],
  );

  const visual = useMemo(
    () => StabilityBracketVisualUtility.getVisual(bracket.type),
    [bracket.type],
  );

  const isCrisis = stability < 25;
  const isProsperous = stability >= 75;

  const tooltipText = `${t("title")}: ${toDigits(stability)}% (${t(`brackets.${bracket.type}`)} • ${t(`rateTexts.${bracket.type}`)})`;

  return (
    <div
      className={`flex items-center gap-2 border px-3.5 py-1.5 rounded-2xl font-mono text-xs transition-all cursor-default shrink-0 shadow-sm backdrop-blur-md ${
        isCrisis
          ? "bg-rose-950/40 border-rose-500/50 shadow-rose-500/10 animate-pulse"
          : isProsperous
            ? "bg-emerald-950/25 border-emerald-500/40"
            : "bg-secondary/60 border-border/80"
      }`}
      title={tooltipText}
    >
      <Landmark
        size={14}
        className="text-diplomacy shrink-0 drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]"
      />
      <div className="flex items-center gap-2">
        <span className={`font-black ${visual.textColorClass}`}>
          {formatPercent(stability)}
        </span>
        <div className="w-12 h-1.5 bg-background/90 rounded-full overflow-hidden border border-border/60 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCrisis
                ? "bg-rose-500"
                : isProsperous
                  ? "bg-emerald-400"
                  : "bg-gdp"
            }`}
            style={{ width: `${Math.min(100, Math.max(0, stability))}%` }}
          />
        </div>
      </div>
    </div>
  );
}
