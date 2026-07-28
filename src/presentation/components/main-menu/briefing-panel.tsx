import React from "react";
import { Radio } from "lucide-react";
import { BriefingFeedItem } from "./briefing-feed-item";
import { useBriefingFeed } from "./hooks/use-briefing-feed";

export function BriefingPanel() {
  const { messages } = useBriefingFeed();

  return (
    <div className="bg-card/40 backdrop-blur-md border border-border rounded-3xl p-5 space-y-4 max-w-sm w-full shadow-lg flex flex-col h-[400px]">
      <div className="flex items-center justify-between pb-3 border-b border-border/80 shrink-0">
        <div className="flex items-center gap-2">
          <Radio size={14} className="text-primary animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase font-mono">
            گزارش‌های آن‌لاین فرماندهی
          </span>
        </div>
        <span className="w-2 h-2 rounded-full bg-gdp animate-ping" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pl-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent text-right">
        {messages.map((msg) => (
          <BriefingFeedItem key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  );
}
