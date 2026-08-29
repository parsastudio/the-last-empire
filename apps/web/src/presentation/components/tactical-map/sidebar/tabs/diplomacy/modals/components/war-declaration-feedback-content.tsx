import React from "react";
import { Swords, ShoppingCart, AlertTriangle, Radio } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";
import { ReactiveDefenseEvent } from "@geopolitics/game-engine";

interface WarDeclarationFeedbackContentProps {
  targetName: string;
  defense?: ReactiveDefenseEvent;
  onClose: () => void;
}

export function WarDeclarationFeedbackContent({
  targetName,
  defense,
  onClose,
}: WarDeclarationFeedbackContentProps) {
  return (
    <div className="py-2 flex flex-col items-center justify-center gap-4 text-right dir-rtl font-sans">
      <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-500/60 text-rose-400 flex items-center justify-center shadow-xl shadow-rose-500/25 animate-pulse">
        <Swords size={32} />
      </div>

      <div className="space-y-1.5 text-center px-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/15 border border-rose-500/30 rounded-full text-[10px] font-mono text-rose-400 font-bold uppercase tracking-wider">
          <Radio size={12} className="animate-ping" />
          <span>وضعیت جنگی فعال • وضعیت قرمز</span>
        </div>
        <h3 className="text-base font-black text-foreground">
          ابلاغ بیانیه رسمی اعلان جنگ به {targetName}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed font-medium">
          تمامی معاهدات بین‌المللی لغو گردید، سفارتخانه‌ها تعطیل و فرمان آتش
          سراسری به ستاد کل ارتش صادر شد.
        </p>
      </div>

      {defense?.type === "PURCHASED" && (
        <div className="w-full bg-gradient-to-r from-amber-950/60 via-card to-amber-950/40 border border-amber-500/50 p-4 rounded-2xl space-y-2 shadow-lg text-right">
          <div className="flex items-center gap-2 text-xs font-black text-amber-400">
            <ShoppingCart size={16} />
            <span>گزارش اطلاعات: خرید ضربتی تسلیحات توسط حریف!</span>
          </div>
          <p className="text-[11px] text-foreground/90 leading-relaxed font-sans font-medium">
            دولت {targetName} به دلیل احساس خطر از شکاف قدرت نظامی، با دریافت
            تسهیلات اضطراری (
            {PersianNumberFormatter.formatCurrency(defense.cost || 0)}) اقدام به
            واردات فوری{" "}
            <strong className="text-amber-400 font-bold font-mono">
              {PersianNumberFormatter.toPersianDigits(
                defense.quantity?.toLocaleString("en-US") || "۰",
              )}{" "}
              {defense.unitName}
            </strong>{" "}
            از کشور {defense.sellerName}{" "}
            {getFlagEmoji(defense.sellerFlagCode || "")} نمود.
          </p>
        </div>
      )}

      {defense?.type === "MAX_DEBT" && (
        <div className="w-full bg-secondary/60 border border-border/70 p-3 rounded-2xl flex items-center gap-2.5 text-[11px] text-muted-foreground text-right">
          <AlertTriangle size={15} className="text-amber-400 shrink-0" />
          <span>
            دولت {targetName} به سقف بدهی مجاز رسیده و توان دریافت وام اضطراری
            جهت تسلیح بیشتر را ندارد.
          </span>
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-xs transition-all cursor-pointer shadow-lg shadow-rose-600/20 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
      >
        <Swords size={15} />
        <span>تایید و ورود به جبهه نبرد</span>
      </button>
    </div>
  );
}
