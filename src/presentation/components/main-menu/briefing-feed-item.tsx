import React from "react";
import {
  AlertCircle,
  ShieldAlert,
  TrendingDown,
  Swords,
  BellRing,
} from "lucide-react";

export interface FeedMessage {
  id: string;
  type: "warning" | "danger" | "info" | "combat";
  text: string;
  time: string;
}

interface BriefingFeedItemProps {
  message: FeedMessage;
}

export function BriefingFeedItem({ message }: BriefingFeedItemProps) {
  const getIcon = () => {
    switch (message.type) {
      case "danger":
        return <ShieldAlert size={14} className="text-rose-500 shrink-0" />;
      case "warning":
        return <AlertCircle size={14} className="text-amber-500 shrink-0" />;
      case "combat":
        return <Swords size={14} className="text-military shrink-0" />;
      default:
        return <BellRing size={14} className="text-primary shrink-0" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-2xl bg-background/60 border border-border/60 backdrop-blur-sm transition-all hover:border-primary/30">
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 space-y-1">
        <p className="text-[11px] font-medium text-foreground leading-relaxed">
          {message.text}
        </p>
        <span className="text-[9px] font-mono text-muted-foreground block">
          {message.time}
        </span>
      </div>
    </div>
  );
}
