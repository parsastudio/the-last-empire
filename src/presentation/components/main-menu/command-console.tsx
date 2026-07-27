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
    <div className="flex flex-col gap-3.5 max-w-sm w-full">
      <button
        onClick={onNewCampaign}
        className="w-full py-4 bg-gdp hover:bg-gdp/90 text-primary-foreground rounded-2xl font-bold transition-all border border-gdp/20 shadow-lg shadow-gdp/10 hover:shadow-xl hover:translate-y-[-1px] text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
      >
        <Play size={15} fill="currentColor" />
        <span>شروع بازی جدید</span>
      </button>

      <button
        onClick={onLoadCampaign}
        className="w-full py-4 bg-primary hover:bg-primary/90 border border-border text-primary-foreground rounded-2xl font-semibold transition-all shadow-md hover:shadow-lg hover:translate-y-[-1px] text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer"
      >
        <RotateCcw size={15} />
        <span>بارگذاری بازی</span>
      </button>
    </div>
  );
}
