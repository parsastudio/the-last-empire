import React from "react";
import { Play, RotateCcw } from "lucide-react";

interface CommandConsoleProps {
  hasSavedCampaign: boolean;
  onNewCampaign: () => void;
  onLoadCampaign: () => void;
}

export function CommandConsole({
  hasSavedCampaign,
  onNewCampaign,
  onLoadCampaign,
}: CommandConsoleProps) {
  return (
    <div className="flex flex-col gap-3.5 max-w-sm w-full">
      <button
        onClick={onNewCampaign}
        className="w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold transition-all border border-primary/20 shadow-lg hover:shadow-xl hover:translate-y-[-1px] text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
      >
        <Play size={15} fill="currentColor" />
        <span>آغاز کمپین راهبردی جدید</span>
      </button>

      <button
        onClick={onLoadCampaign}
        disabled={!hasSavedCampaign}
        className="w-full py-4 bg-secondary/80 hover:bg-secondary disabled:bg-secondary/30 disabled:opacity-40 disabled:cursor-not-allowed border border-border/80 text-foreground rounded-2xl font-semibold transition-all text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer"
      >
        <RotateCcw size={15} />
        <span>بازیابی آخرین امپراتوری</span>
      </button>
    </div>
  );
}
