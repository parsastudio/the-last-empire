import React, { useState, useEffect } from "react";
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
        return <ShieldAlert size={14} className="text-military shrink-0" />;
      case "warning":
        return <AlertCircle size={14} className="text-treasury shrink-0" />;
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

export function BriefingPanel() {
  const [messages, setMessages] = useState<FeedMessage[]>(
    INITIAL_BRIEFING_MESSAGES,
  );

  useEffect(() => {
    let active = true;

    const interval = setInterval(() => {
      if (!active) return;

      const dynamicTexts: { type: FeedMessage["type"]; text: string }[] = [
        {
          type: "info",
          text: "گزارش ارتش: تکمیل تولید و استقرار تجهیزات جدید در پایگاه‌ها.",
        },
        {
          type: "warning",
          text: "وزارت اقتصاد: نوسان قیمت در بازار آزاد منابع انرژی و فولاد.",
        },
        {
          type: "danger",
          text: "هشدار امنیتی: افت شاخص ثبات سیاسی و افزایش خطر نارضایتی عمومی.",
        },
        {
          type: "info",
          text: "پژوهشکده ملی: پیشرفت تازه در تحقیقات فناوری‌های دفاعی و صنعتی.",
        },
      ];

      const randomItem =
        dynamicTexts[Math.floor(Math.random() * dynamicTexts.length)];
      if (!randomItem) return;

      const newMessage: FeedMessage = {
        id: `msg-${Date.now()}`,
        type: randomItem.type,
        text: randomItem.text,
        time: "همین الان",
      };

      setMessages((prev) => [newMessage, ...prev.slice(0, 19)]);
    }, 6000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

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
