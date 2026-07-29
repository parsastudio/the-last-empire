"use client";

import React from "react";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { Cpu, Swords, Fuel, Landmark, ArrowLeft } from "lucide-react";
import { HumanResourceMetrics } from "@/presentation/hooks/game/use-game-resources";

interface PendingDecisionsModalProps {
  isOpen: boolean;
  metrics: HumanResourceMetrics;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export function PendingDecisionsModal({
  isOpen,
  metrics,
  onClose,
  onNavigateTab,
}: PendingDecisionsModalProps) {
  if (!isOpen) return null;

  const nation = metrics.nation;
  const pendingItems = [];

  if (nation && nation.doctrines.doctrinePoints >= 3) {
    pendingItems.push({
      id: "doctrines",
      title: "امتیاز دکترین راهبردی آماده تخصیص",
      desc: `شما ${metrics.nation?.doctrines.doctrinePoints.toFixed(1)} امتیاز دکترین دارید. برای ارتقای توانمندی‌های صنعتی یا نظامی اقدام کنید.`,
      icon: Cpu,
      color: "text-gdp",
      tab: "research",
    });
  }

  if (nation && nation.recruitmentQueue.length === 0) {
    pendingItems.push({
      id: "military-queue",
      title: "صف ساخت و تجهیز ارتش خالی است",
      desc: "هیچ یگان نظامی در حال ساخت نیست. برای تقویت خطوط پادگانی و هوایی نیرو سفارش دهید.",
      icon: Swords,
      color: "text-military",
      tab: "military",
    });
  }

  if (metrics.oil < metrics.oilRequiredPerTurn) {
    pendingItems.push({
      id: "oil-deficit",
      title: "هشدار کسری ذخایر نفت استراتژیک",
      desc: `مصرف نوبتی (${metrics.oilRequiredPerTurn} بشکه) بیشتر از ذخایر موجود است. جهت جلوگیری از افت جریمه نبرد از بورس نفت بخرید.`,
      icon: Fuel,
      color: "text-treasury",
      tab: "market",
    });
  }

  if (metrics.stability < 35) {
    pendingItems.push({
      id: "stability-warning",
      title: "بحران ثبات سیاسی داخلی",
      desc: `ثبات سیاسی کشور به ${metrics.stability}% افت کرده است. از بخش سیاست برای کنترل مالیات یا طرح ضدفساد استفاده کنید.`,
      icon: Landmark,
      color: "text-military",
      tab: "politics",
    });
  }

  const handleAction = (tab: string) => {
    onNavigateTab(tab);
    onClose();
  };

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title="تصمیمات معوق و اطلاعیه‌های حاکمیت"
      subtitle="اتاق هشدار | پایش زنده نیازهای استراتژیک"
      maxWidthClass="max-w-lg"
      onClose={onClose}
    >
      <div className="space-y-3 dir-rtl text-right">
        {pendingItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground italic bg-secondary/30 rounded-2xl border border-border/40 p-4">
            تمامی امور حاکمیتی و نظامی در وضعیت مطلوب قرار دارند و هیچ تصمیم
            معوقی وجود ندارد.
          </div>
        ) : (
          pendingItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-background/50 border border-border/80 p-4 rounded-2xl flex items-center justify-between gap-3 transition-all hover:bg-secondary/40"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={16} className={item.color} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-foreground">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleAction(item.tab)}
                  className="px-3 py-1.5 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>اقدام</span>
                  <ArrowLeft size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </UnifiedModalShell>
  );
}
