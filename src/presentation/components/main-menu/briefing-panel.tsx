import React, { useEffect, useState } from "react";
import { Radio } from "lucide-react";
import { BriefingFeedItem, FeedMessage } from "./briefing-feed-item";

const INITIAL_MESSAGES: FeedMessage[] = [
  {
    id: "1",
    type: "combat",
    text: "فرمانده!۵۰ جنگنده پیشرفته جدید به خطوط پروازی تحویل داده شد.",
    time: "لحظاتی پیش",
  },
  {
    id: "2",
    type: "danger",
    text: "وزارت اقتصاد: نرخ تورم صعودی شده و اعتراض اصناف شکل گرفته است.",
    time: "۲ دقیقه پیش",
  },
  {
    id: "3",
    type: "warning",
    text: "گزارش ذخایر: میزان نفت خام در مخازن استراتژیک به حد هشدار رسیده.",
    time: "۵ دقیقه پیش",
  },
  {
    id: "4",
    type: "info",
    text: "پایش مرزی: تحرکات نظامی مشکوک در مرزهای زمینی همسایه رصد شد.",
    time: "۸ دقیقه پیش",
  },
  {
    id: "5",
    type: "combat",
    text: "پدافند هوایی: یک فروند پهپاد متخاصم در آسمان منطقه مرزی رهگیری شد.",
    time: "۱۲ دقیقه پیش",
  },
  {
    id: "6",
    type: "warning",
    text: "بانک مرکزی: شاخص اعتبار ملی به دلیل کسری بودجه نیازمند بازبینی است.",
    time: "۱۵ دقیقه پیش",
  },
  {
    id: "7",
    type: "info",
    text: "دیپلماسی: درخواست رسمی کشور همسایه برای امضای پیمان عدم تخاصم دریافت شد.",
    time: "۲۰ دقیقه پیش",
  },
  {
    id: "8",
    type: "danger",
    text: "گزارش امنیت داخلی: شاخص ثبات سیاسی در پایتخت به زیر حد بحرانی افتاد.",
    time: "۲۵ دقیقه پیش",
  },
  {
    id: "9",
    type: "warning",
    text: "هزینه‌های نگهداری ارتش افزایش یافته و فشار بر خزانه ملی بیشتر شده است.",
    time: "۳۰ دقیقه پیش",
  },
  {
    id: "10",
    type: "combat",
    text: "مقر فرماندهی عملیات: آماده‌باش کامل به یگان‌های پیاده‌نظام ابلاغ گردید.",
    time: "۳۵ دقیقه پیش",
  },
  {
    id: "11",
    type: "info",
    text: "پروژه عمرانی: سطح زیرساخت‌های صنعتی کشور یک پله ارتقا یافت.",
    time: "۴۰ دقیقه پیش",
  },
  {
    id: "12",
    type: "danger",
    text: "نرخ بیکاری و نارضایتی عمومی در بخش‌های کارگری رو به افزایش است.",
    time: "۴۵ دقیقه پیش",
  },
  {
    id: "13",
    type: "warning",
    text: "صندوق بین‌المللی پول شرایط جدید بازپرداخت وام‌های دولتی را اعلام کرد.",
    time: "۵۰ دقیقه پیش",
  },
  {
    id: "14",
    type: "info",
    text: "بازار آزاد: قیمت جهانی فولاد و نفت در معاملات این نوبت نوسان ثبت کرد.",
    time: "۱ ساعت پیش",
  },
  {
    id: "15",
    type: "combat",
    text: "نیروی دریایی: گشت‌زنی در آب‌های سرزمینی و خطوط مواصلاتی برقرار است.",
    time: "۱ ساعت پیش",
  },
  {
    id: "16",
    type: "danger",
    text: "بحران فساد اداری در دستگاه‌های اجرایی نیازمند اجرای طرح ضدفساد است.",
    time: "۱ ساعت پیش",
  },
  {
    id: "17",
    type: "warning",
    text: "کاهش سطح رضایت عمومی به دلیل افزایش تعرفه‌های گمرکی و مالیات.",
    time: "۲ ساعت پیش",
  },
  {
    id: "18",
    type: "info",
    text: "امتیاز دکترین جدید نظامی آماده تخصیص در بخش پژوهش‌های راهبردی است.",
    time: "۲ ساعت پیش",
  },
  {
    id: "19",
    type: "danger",
    text: "گزارش اطلاعاتی: احتمال اعلام جنگ از سوی دولت‌های رقیب قوت گرفت.",
    time: "۳ ساعت پیش",
  },
  {
    id: "20",
    type: "combat",
    text: "صف نیروی انسانی در مراکز استخدام نظامی برای جذب نیروی تازه تکمیل شد.",
    time: "۳ ساعت پیش",
  },
];

export function BriefingPanel() {
  const [messages, setMessages] = useState<FeedMessage[]>(INITIAL_MESSAGES);

  useEffect(() => {
    const interval = setInterval(() => {
      const dynamicTexts = [
        {
          type: "combat" as const,
          text: "گزارش ارتش: تکمیل تولید و استقرار تجهیزات موشکی جدید در پایگاه‌ها.",
        },
        {
          type: "warning" as const,
          text: "وزارت اقتصاد: نوسان قیمت در بازار آزاد منابع انرژی و فولاد.",
        },
        {
          type: "danger" as const,
          text: "هشدار امنیتی: افت شاخص ثبات سیاسی و افزایش خطر نارضایتی عمومی.",
        },
        {
          type: "info" as const,
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

    return () => clearInterval(interval);
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
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
      </div>

      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pl-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent text-right">
        {messages.map((msg) => (
          <BriefingFeedItem key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  );
}
