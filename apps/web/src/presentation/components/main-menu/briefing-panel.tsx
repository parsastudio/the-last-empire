import React from "react";
import {
  Radio,
  AlertCircle,
  ShieldAlert,
  Swords,
  BellRing,
} from "lucide-react";
import { INITIAL_BRIEFING_MESSAGES } from "@/presentation/components/main-menu/config/briefing-messages.config";

export interface FeedMessage {
  id: string;
  type: "warning" | "danger" | "info" | "combat";
  text: string;
  time: string;
}

function BriefingFeedItem({ message }: { message: FeedMessage }) {
  const getIcon = () => {
    switch (message.type) {
      case "danger":
        return <ShieldAlert size={13} className="text-military shrink-0" />;
      case "warning":
        return <AlertCircle size={13} className="text-treasury shrink-0" />;
      case "combat":
        return <Swords size={13} className="text-military shrink-0" />;
      default:
        return <BellRing size={13} className="text-primary shrink-0" />;
    }
  };

  return (
    <div className="flex items-start gap-2.5 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-background/60 border border-border/60 backdrop-blur-sm transition-all hover:border-primary/30">
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 space-y-0.5 overflow-hidden text-right">
        <p className="text-[10px] sm:text-[11px] font-medium text-foreground leading-relaxed truncate">
          {message.text}
        </p>
        <span className="text-[8px] sm:text-[9px] font-mono text-muted-foreground block">
          {message.time}
        </span>
      </div>
    </div>
  );
}

export function BriefingPanel() {
  return (
    <div className="bg-card/40 backdrop-blur-md border border-border rounded-2xl sm:rounded-3xl p-3 sm:p-4 space-y-2 sm:space-y-3 w-full shadow-lg flex flex-col h-[150px] sm:h-[180px] md:h-[240px]">
      <div className="flex items-center justify-between pb-2 border-b border-border/80 shrink-0">
        <div className="flex items-center gap-2">
          <Radio size={13} className="text-primary animate-pulse" />
          <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-muted-foreground uppercase font-mono">
            گزارش‌های آن‌لاین فرماندهی
          </span>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-gdp animate-ping" />
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-1.5 pr-1 pl-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent text-right">
        {INITIAL_BRIEFING_MESSAGES.map((msg) => (
          <BriefingFeedItem key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  );
}
