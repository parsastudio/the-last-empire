import React from "react";
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
  const handleNew = () => {
    TacticalSound.playUiClick();
    onNewCampaign();
  };

  const handleLoad = () => {
    TacticalSound.playUiClick();
    onLoadCampaign();
  };

  return (
    <div className="flex flex-col gap-4 max-w-sm w-full">
      <button
        onClick={handleNew}
        className="w-full py-4.5 px-6 bg-gdp hover:bg-emerald-400 text-primary-foreground rounded-2xl font-black transition-all border border-emerald-400/40 shadow-2xl shadow-gdp/30 hover:shadow-gdp/50 hover:scale-[1.02] active:scale-[0.98] text-xs uppercase tracking-wider flex items-center justify-center gap-3 cursor-pointer ring-1 ring-emerald-300/30"
      >
        <Play
          size={16}
          fill="currentColor"
          className="animate-tactical-pulse"
        />
        <span>شروع امپراتوری جدید</span>
      </button>

      <button
        onClick={handleLoad}
        className="w-full py-4.5 px-6 bg-secondary/90 hover:bg-secondary border border-border/80 text-foreground rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] text-xs tracking-wider flex items-center justify-center gap-3 cursor-pointer backdrop-blur-xl"
      >
        <RotateCcw size={16} className="text-primary" />
        <span>بازخوانی پرونده کمپین</span>
      </button>
    </div>
  );
}
