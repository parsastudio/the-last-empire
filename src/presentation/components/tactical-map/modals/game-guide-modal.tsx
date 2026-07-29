import React, { useState } from "react";
import { Swords, Landmark, Coins, Flame } from "lucide-react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";

interface GameGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GameGuideModal({ isOpen, onClose }: GameGuideModalProps) {
  const [activeTab, setActiveTab] = useState<
    "combat" | "politics" | "economy" | "proxy"
  >("combat");

  if (!isOpen) return null;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="راهنما و دفترچه راهنمای استراتژیک"
      subtitle="آموزش جامع قوانین نبرد، اقتصاد و دیپلماسی در آخرین امپراتوری"
      maxWidthClass="max-w-2xl"
      onClose={onClose}
    >
      <div className="space-y-4 dir-rtl text-right">
        <div className="grid grid-cols-4 gap-1.5 bg-secondary/80 border border-border p-1 rounded-2xl text-xs font-bold">
          <button
            onClick={() => setActiveTab("combat")}
            className={`py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "combat"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Swords size={14} />
            <span>نبرد و ارتش</span>
          </button>
          <button
            onClick={() => setActiveTab("politics")}
            className={`py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "politics"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Landmark size={14} />
            <span>سیاست</span>
          </button>
          <button
            onClick={() => setActiveTab("economy")}
            className={`py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "economy"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Coins size={14} />
            <span>اقتصاد</span>
          </button>
          <button
            onClick={() => setActiveTab("proxy")}
            className={`py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "proxy"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Flame size={14} />
            <span>جنگ نیابتی</span>
          </button>
        </div>

        <div className="bg-background/40 border border-border/80 p-5 rounded-2xl space-y-3 text-xs leading-relaxed">
          {activeTab === "combat" && (
            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Swords size={16} className="text-military" />
                اصول نبرد و تصرف قلمرو
              </h4>
              <p className="text-muted-foreground">
                برای تهاجم نظامی ابتدا باید به کشور هدف اعلام جنگ رسمی کنید.
                نیروهای پیاده‌نظام خطوط نبرد را اشغال می‌کنند، نیروی هوایی پوشش
                نبرد را تامین می‌کند و یگان‌های پهپادی باعث تضعیف خطوط دفاعی
                دشمن می‌شوند.
              </p>
            </div>
          )}

          {activeTab === "politics" && (
            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Landmark size={16} className="text-diplomacy" />
                ثبات سیاسی و کنترل مالیات
              </h4>
              <p className="text-muted-foreground">
                افزایش بیش از حد مالیات باعث افت شدید ثبات سیاسی داخلی و احتمال
                بروز کودتا یا شورش کارگری خواهد شد. با اجرای پروژه‌های ضدفساد
                می‌توانید پرت مالیاتی را به حداقل برسانید.
              </p>
            </div>
          )}

          {activeTab === "economy" && (
            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Coins size={16} className="text-gdp" />
                بورس نفت و فولاد
              </h4>
              <p className="text-muted-foreground">
                یگان‌های نظامی رزمی هوایی برای پرواز نیاز به سوخت نفت خام دارند.
                در صورت کسری ذخایر استراتژیک می‌توانید از بخش بورس جهانی اقدام
                به خرید مستقیم نفت یا فولاد نمایید.
              </p>
            </div>
          )}

          {activeTab === "proxy" && (
            <div className="space-y-2">
              <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Flame size={16} className="text-military" />
                عملیات نیابتی و تخریب از درون
              </h4>
              <p className="text-muted-foreground">
                با اختصاص بودجه نفوذ به کشورهای متخاصم می‌توانید ثبات داخلی
                آن‌ها را بدون اعلام جنگ مستقیم تضعیف کنید. افت ثبات به زیر ۱۰٪
                باعث وقوع کودتا و فروپاشی نظام آن‌ها می‌شود.
              </p>
            </div>
          )}
        </div>
      </div>
    </UnifiedModalShell>
  );
}
