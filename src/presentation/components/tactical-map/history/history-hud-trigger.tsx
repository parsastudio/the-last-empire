import React from "react";
import { History } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface HistoryHudTriggerProps {
  eventsCount: number;
  isReplaying: boolean;
  onToggleReplay: () => void;
}

export function HistoryHudTrigger({
  eventsCount,
  isReplaying,
  onToggleReplay,
}: HistoryHudTriggerProps) {
  return (
    <button
      onClick={onToggleReplay}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
        isReplaying
          ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
          : "bg-secondary text-muted-foreground hover:text-foreground border-border/60 hover:bg-secondary/60"
      }`}
      title="مشاهده تاریخچه و بازپخش رویدادها"
    >
      <History size={13} className={isReplaying ? "animate-spin" : ""} />
      <span className="font-sans text-[11px]">
        {isReplaying ? "در حال بازپخش..." : "تاریخچه رویدادها"}
      </span>
      {eventsCount > 0 && (
        <span className="text-[9px] font-mono bg-background/80 px-1.5 py-0.2 rounded text-foreground font-bold">
          {PersianNumberFormatter.toPersianDigits(eventsCount)}
        </span>
      )}
    </button>
  );
}
