import React from "react";
import { Play, RotateCcw } from "lucide-react";

interface CommandConsoleProps {
  onNewCampaign: () => void;
  onLoadCampaign: () => void;
}

export function CommandConsole({
  onNewCampaign,
  onLoadCampaign,
}: CommandConsoleProps) {
  return (
    <div className="flex flex-col gap-4 max-w-sm w-full">
      <button
        onClick={onNewCampaign}
        className="w-full py-4.5 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-2xl font-black transition-all border border-gdp/30 shadow-xl shadow-gdp/20 hover:shadow-2xl hover:scale-[1.01] active:scale-[0.99] text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 cursor-pointer"
      >
        <Play size={16} fill="currentColor" />
        <span>شروع امپراتوری جدید</span>
      </button>

      <button
        onClick={onLoadCampaign}
        className="w-full py-4.5 bg-secondary/80 hover:bg-secondary border border-border text-foreground rounded-2xl font-bold transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] text-xs tracking-wider flex items-center justify-center gap-2.5 cursor-pointer backdrop-blur-md"
      >
        <RotateCcw size={16} className="text-primary" />
        <span>بازخوانی پرونده کمپین</span>
      </button>
    </div>
  );
}
