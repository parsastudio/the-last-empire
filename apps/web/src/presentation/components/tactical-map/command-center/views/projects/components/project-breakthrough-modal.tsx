"use client";

import React, { useEffect } from "react";
import { Sparkles, Atom, CheckCircle2, Trophy, ArrowLeft } from "lucide-react";
import { NationalProjectConfig } from "@geopolitics/domain";
import { TacticalEffects } from "@/presentation/utils/tactical-effects";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

interface ProjectBreakthroughModalProps {
  isOpen: boolean;
  project: NationalProjectConfig | null;
  onClose: () => void;
}

export function ProjectBreakthroughModal({
  isOpen,
  project,
  onClose,
}: ProjectBreakthroughModalProps) {
  useEffect(() => {
    if (isOpen) {
      TacticalEffects.fireVictoryConfetti(180);
      TacticalSound.playCoinSound();
    }
  }, [isOpen]);

  if (!isOpen || !project) return null;

  return (
    <div
      onClick={onClose}
      onWheel={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      className="fixed inset-0 bg-background/80 backdrop-blur-2xl z-[70] flex items-center justify-center p-4 md:p-6 animate-fade-smooth cursor-pointer dir-rtl"
      dir="rtl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card/95 border border-primary/50 w-full max-w-lg rounded-3xl p-6 shadow-2xl shadow-primary/20 flex flex-col space-y-5 text-foreground backdrop-blur-3xl cursor-default text-right overflow-hidden relative ring-1 ring-white/10"
      >
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-intel via-primary to-gdp animate-pulse" />

        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 text-primary flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
              <Sparkles size={24} className="animate-spin duration-1000" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black text-primary uppercase tracking-widest bg-primary/15 px-2 py-0.5 rounded-md border border-primary/30">
                  SCIENTIFIC BREAKTHROUGH
                </span>
              </div>
              <h3 className="text-base md:text-lg font-black text-foreground tracking-tight">
                جهش علمی و دستاورد نامنتظره ملی!
              </h3>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-primary/15 via-secondary/70 to-intel/15 border border-primary/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-primary flex items-center gap-1.5">
              <Atom size={16} />
              <span>پروژه راهبردی: {project.nameFa}</span>
            </span>
            <span className="text-[10px] font-mono font-bold bg-gdp/20 text-gdp border border-gdp/40 px-2 py-0.5 rounded-lg">
              ۱۰۰٪ تکمیل آنی
            </span>
          </div>
          <span className="text-[11px] font-bold text-foreground block font-mono">
            {project.taglineFa}
          </span>
        </div>

        <div className="space-y-2 text-xs text-foreground/90 leading-relaxed font-sans bg-background/60 border border-border/70 p-4 rounded-2xl shadow-inner">
          <p className="font-medium text-muted-foreground leading-relaxed">
            در جریان آزمایش‌های تحقیقاتی اخیر، دانشمندان و نخبگان علمی کشور به
            یک فرمول انقلابی و راهگشا دست یافتند.
          </p>
          <p className="font-bold text-foreground leading-relaxed">
            این کشف تاریخی موجب شد فرآیند تحقیق بدون نیاز به تأمین گام‌های مالی
            باقی‌مانده، فوراً به نقطه بهره‌برداری کامل برسد و تمامی امتیازات
            تمدنی آن به طور دائم برای امپراتوری شما فعال گردد.
          </p>
        </div>

        <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl space-y-1.5 font-sans">
          <span className="text-[10px] font-mono font-black text-gdp uppercase tracking-wider flex items-center gap-1.5">
            <Trophy size={13} />
            امتیاز فعال‌شده در ارکان حاکمیت:
          </span>
          <p className="text-[11px] text-foreground font-medium leading-relaxed">
            {project.descriptionFa}
          </p>
        </div>

        <div className="pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 px-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl text-xs font-black transition-all shadow-xl shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer border border-primary/40"
          >
            <CheckCircle2 size={16} />
            <span>بهره‌برداری رسمی و تثبیت دستاورد ملی</span>
            <ArrowLeft size={14} className="mr-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
