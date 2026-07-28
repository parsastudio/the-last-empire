import React from "react";
import { Calendar, Clock, ChevronLeft } from "lucide-react";
import { FakeSave } from "./config/fake-saves.config";

interface SaveItemCardProps {
  save: FakeSave;
  onSelect: (id: string) => void;
}

export function SaveItemCard({ save, onSelect }: SaveItemCardProps) {
  return (
    <button
      onClick={() => onSelect(save.id)}
      className="w-full bg-background/50 hover:bg-secondary/40 border border-border/80 hover:border-primary/40 p-4 rounded-2xl text-right transition-all flex items-center justify-between gap-4 group cursor-pointer"
    >
      <div className="space-y-2">
        <span className="text-xs font-bold text-foreground block">
          {save.title}
        </span>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar size={11} />
            <span>{save.date}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={11} />
            <span>زمان: {save.playtime}</span>
          </div>
          <div className="font-mono bg-secondary/80 px-1.5 py-0.5 rounded text-[9px]">
            نوبت: {save.turn}
          </div>
        </div>
      </div>
      <ChevronLeft
        size={14}
        className="text-muted-foreground group-hover:translate-x-[-2px] transition-transform shrink-0"
      />
    </button>
  );
}
