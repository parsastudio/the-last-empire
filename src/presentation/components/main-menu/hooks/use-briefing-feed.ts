import { useState, useEffect } from "react";
import { FeedMessage } from "../briefing-feed-item";
import { INITIAL_BRIEFING_MESSAGES } from "../config/briefing-messages.config";

export function useBriefingFeed() {
  const [messages, setMessages] = useState<FeedMessage[]>(
    INITIAL_BRIEFING_MESSAGES,
  );

  useEffect(() => {
    let active = true;

    const interval = setInterval(() => {
      if (!active) return;

      const dynamicTexts: { type: FeedMessage["type"]; text: string }[] = [
        {
          type: "combat",
          text: "گزارش ارتش: تکمیل تولید و استقرار تجهیزات موشکی جدید در پایگاه‌ها.",
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

  return { messages };
}
