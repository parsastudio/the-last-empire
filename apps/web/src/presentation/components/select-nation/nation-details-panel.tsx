import React from "react";
import { useTranslations } from "next-intl";
import { Zap, ShieldCheck } from "lucide-react";
import { NationDetail } from "@/presentation/components/select-nation/nation-list-item";
import { NationOverviewStats } from "@/presentation/components/select-nation/nation-overview-stats";
import {
  GovernmentTypeSelector,
  GovernmentOption,
} from "@/presentation/components/select-nation/government-type-selector";
import { GameDifficultySelector } from "@/presentation/components/select-nation/game-difficulty-selector";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { GameDifficulty } from "@geopolitics/domain";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface NationDetailsPanelProps {
  nation: NationDetail;
  governmentOptions: GovernmentOption[];
  selectedGovernment: string;
  selectedDifficulty: GameDifficulty;
  onSelectGovernment: (type: string) => void;
  onSelectDifficulty: (difficulty: GameDifficulty) => void;
  onStartCampaign: () => void;
}

export function NationDetailsPanel({
  nation,
  governmentOptions,
  selectedGovernment,
  selectedDifficulty,
  onSelectGovernment,
  onSelectDifficulty,
  onStartCampaign,
}: NationDetailsPanelProps) {
  const t = useTranslations("selectNation");
  const { toDigits } = useLocaleFormatter();
  const flagEmoji = getFlagEmoji(nation.code);

  return (
    <div className="flex flex-col bg-card/90 backdrop-blur-3xl border border-border/80 rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 md:p-6 overflow-y-auto scroll-mask-y scrollbar-thin scrollbar-thumb-border/60 scrollbar-track-transparent shadow-2xl h-full min-h-0 space-y-3.5 sm:space-y-6 text-start transition-all relative ring-1 ring-white/5">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[14rem] sm:text-[18rem] select-none pointer-events-none opacity-[0.03] blur-sm">
        {flagEmoji}
      </div>

      <div className="flex items-center justify-between pb-3 sm:pb-5 border-b border-border/80 relative z-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-secondary/80 border border-border/80 flex items-center justify-center text-3xl sm:text-4xl shadow-inner select-none shrink-0 ring-1 ring-primary/20">
            {flagEmoji}
          </div>
          <div className="space-y-0.5 sm:space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-xl md:text-2xl font-black text-foreground tracking-tight">
                {nation.name}
              </h1>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-primary/15 text-primary border border-primary/30 px-2 py-0.5 rounded-md shadow-inner">
                {nation.id}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs font-semibold text-gdp flex items-center gap-1">
              <ShieldCheck size={13} />
              <span>{nation.power}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 bg-secondary/80 border border-border px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl font-mono text-[11px] sm:text-xs font-bold text-muted-foreground shadow-inner">
          <span>#{toDigits(nation.rank)}</span>
        </div>
      </div>

      <div className="relative z-10 space-y-3.5 sm:space-y-5">
        <NationOverviewStats nation={nation} />

        <div className="space-y-1.5 sm:space-y-2">
          <span className="text-[11px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono">
            {t("dossier.title")}
          </span>
          <div className="text-[11px] sm:text-xs text-foreground/90 leading-relaxed bg-background/60 border border-border/60 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-inner font-sans">
            {nation.desc}
          </div>
        </div>

        <GovernmentTypeSelector
          options={governmentOptions}
          selectedType={selectedGovernment}
          onSelect={onSelectGovernment}
        />

        <GameDifficultySelector
          selectedDifficulty={selectedDifficulty}
          onSelect={onSelectDifficulty}
        />
      </div>

      <div className="pt-3 sm:pt-4 border-t border-border/80 relative z-10 shrink-0">
        <button
          type="button"
          onClick={onStartCampaign}
          className="w-full py-3 sm:py-4 px-6 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-xl sm:rounded-2xl font-black transition-all shadow-lg shadow-gdp/20 hover:shadow-gdp/35 hover:scale-[1.005] active:scale-[0.995] text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-gdp/30"
        >
          <Zap size={16} fill="currentColor" className="animate-pulse" />
          <span>{t("startButton", { name: nation.name })}</span>
        </button>
      </div>
    </div>
  );
}
