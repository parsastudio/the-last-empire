import React from "react";
import { useTranslations } from "next-intl";
import {
  Radio,
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  Activity,
} from "lucide-react";

export interface FeedMessage {
  id: string;
  type: "warning" | "danger" | "info" | "combat";
  tag?: string;
  text: string;
  time: string;
}

function BriefingFeedItem({ message }: { message: FeedMessage }) {
  const getBadgeStyle = () => {
    switch (message.type) {
      case "danger":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "warning":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      default:
        return "bg-primary/15 text-primary border-primary/30";
    }
  };

  const getIcon = () => {
    switch (message.type) {
      case "danger":
        return (
          <ShieldAlert size={13} className="text-rose-400 shrink-0 mt-0.5" />
        );
      case "warning":
        return (
          <AlertTriangle size={13} className="text-amber-400 shrink-0 mt-0.5" />
        );
      default:
        return (
          <ShieldCheck size={13} className="text-primary shrink-0 mt-0.5" />
        );
    }
  };

  return (
    <div className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-secondary/40 hover:bg-secondary/70 border border-border/70 hover:border-primary/40 backdrop-blur-xl transition-all group text-start">
      {getIcon()}
      <div className="flex-1 space-y-1 overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          {message.tag && (
            <span
              className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded border ${getBadgeStyle()}`}
            >
              {message.tag}
            </span>
          )}
          <span className="text-[8px] font-mono text-muted-foreground/70">
            {message.time}
          </span>
        </div>
        <p className="text-[11px] text-foreground/90 font-medium leading-relaxed break-words">
          {message.text}
        </p>
      </div>
    </div>
  );
}

export function BriefingPanel() {
  const t = useTranslations("menu.briefing");
  const messages = (t.raw("feed") as FeedMessage[]) || [];

  return (
    <div className="bg-card/75 backdrop-blur-2xl border border-border/80 rounded-3xl p-4 space-y-3 w-full shadow-2xl flex flex-col h-[210px] sm:h-[260px] md:h-[290px] text-start font-sans relative overflow-hidden ring-1 ring-white/5">
      <div className="flex items-center justify-between pb-2.5 border-b border-border/70 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-primary/15 text-primary border border-primary/30">
            <Radio size={13} className="animate-pulse" />
          </div>
          <span className="text-[10px] font-mono font-extrabold tracking-widest text-foreground uppercase">
            {t("title")}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-lg">
          <Activity size={10} className="animate-pulse" />
          <span>{t("liveStatus")}</span>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pe-1 scrollbar-thin scrollbar-thumb-border/60 scrollbar-track-transparent">
        {messages.map((msg) => (
          <BriefingFeedItem key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  );
}
