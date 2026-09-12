import React from "react";
import { useTranslations } from "next-intl";
import { Play, RotateCcw } from "lucide-react";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

interface CommandConsoleProps {
  onNewCampaign: () => void;
  onLoadCampaign: () => void;
}

export function CommandConsole({
  onNewCampaign,
  onLoadCampaign,
}: CommandConsoleProps) {
  const t = useTranslations("menu.console");

  const handleNew = () => {
    TacticalSound.playUiClick();
    onNewCampaign();
  };

  const handleLoad = () => {
    TacticalSound.playUiClick();
    onLoadCampaign();
  };

  return (
    <div className="flex flex-col gap-2 sm:gap-3.5 w-full">
      <button
        type="button"
        onClick={handleNew}
        className="w-full py-2.5 sm:py-3.5 md:py-4 px-4 sm:px-6 bg-gdp hover:bg-emerald-400 text-primary-foreground rounded-xl sm:rounded-2xl font-black transition-all border border-emerald-400/40 shadow-xl shadow-gdp/25 hover:scale-[1.01] active:scale-[0.99] text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer ring-1 ring-emerald-300/30"
      >
        <Play
          size={15}
          fill="currentColor"
          className="animate-tactical-pulse shrink-0"
        />
        <span className="truncate">{t("newCampaign")}</span>
      </button>

      <button
        type="button"
        onClick={handleLoad}
        className="w-full py-2.5 sm:py-3.5 md:py-4 px-4 sm:px-6 bg-secondary/90 hover:bg-secondary border border-border/80 text-foreground rounded-xl sm:rounded-2xl font-bold transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] text-xs tracking-wider flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-xl"
      >
        <RotateCcw size={15} className="text-primary shrink-0" />
        <span className="truncate">{t("loadCampaign")}</span>
      </button>
    </div>
  );
}
