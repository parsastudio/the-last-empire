import React from "react";
import { Ban } from "lucide-react";

interface BattlePhaseSkippedBannerProps {
  iconEmoji: string;
  title: string;
  subtitle: string;
  skippedBadge: string;
  skippedTitle: string;
  skippedDesc: string;
}

export function BattlePhaseSkippedBanner({
  iconEmoji,
  title,
  subtitle,
  skippedBadge,
  skippedTitle,
  skippedDesc,
}: BattlePhaseSkippedBannerProps) {
  return (
    <div className="space-y-4 font-sans text-start animate-fade-smooth">
      <div className="bg-secondary/40 border border-border/80 p-4 rounded-3xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-secondary/80 flex items-center justify-center text-xl border border-border">
            {iconEmoji}
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">{title}</h3>
            <span className="text-[10px] text-muted-foreground">
              {subtitle}
            </span>
          </div>
        </div>
        <span className="px-3.5 py-1.5 rounded-2xl text-xs font-black border bg-secondary/80 text-muted-foreground border-border/70 flex items-center gap-1.5 shadow-sm">
          <Ban size={14} />
          <span>{skippedBadge}</span>
        </span>
      </div>

      <div className="p-8 bg-card/60 border border-border/60 rounded-3xl flex flex-col items-center justify-center text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-secondary/80 flex items-center justify-center text-2xl shadow-inner border border-border/40">
          🚫
        </div>
        <span className="text-sm font-bold text-foreground block">
          {skippedTitle}
        </span>
        <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
          {skippedDesc}
        </p>
      </div>
    </div>
  );
}
