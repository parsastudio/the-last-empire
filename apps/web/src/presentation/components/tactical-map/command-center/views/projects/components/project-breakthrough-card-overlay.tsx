"use client";

import React from "react";
import { Sparkles, Zap, Check } from "lucide-react";

interface ProjectBreakthroughCardOverlayProps {
  projectName: string;
  onDismiss: () => void;
}

export function ProjectBreakthroughCardOverlay({
  projectName,
  onDismiss,
}: ProjectBreakthroughCardOverlayProps) {
  return (
    <div
      onClick={onDismiss}
      className="p-4 md:p-5 rounded-3xl bg-gradient-to-r from-intel/20 via-card to-gdp/20 border-2 border-intel shadow-xl shadow-intel/25 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-smooth relative overflow-hidden ring-2 ring-intel/40 cursor-pointer font-sans dir-rtl text-right select-none"
    >
      <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-intel via-primary to-gdp animate-pulse" />

      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-2xl bg-intel/25 border border-intel/50 text-intel flex items-center justify-center shadow-lg shadow-intel/30 shrink-0">
          <Sparkles size={22} className="animate-spin duration-700" />
        </div>

        <div className="space-y-1 truncate">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black text-intel uppercase tracking-widest bg-intel/15 px-2 py-0.5 rounded-md border border-intel/30">
              جهش بزرگ علمی ⚡
            </span>
            <h4 className="text-sm md:text-base font-black text-foreground truncate">
              شاهکار دانشمندان: جهش علمی پیش از موعد!
            </h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed truncate">
            پروژه <strong className="text-foreground">«{projectName}»</strong>{" "}
            پیش از موعد و بدون نیاز به گام‌های بعدی، همین حالا فعال شد.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="py-2.5 px-5 bg-gradient-to-r from-intel to-primary hover:from-intel/90 hover:to-primary/90 text-white rounded-2xl text-xs font-black transition-all cursor-pointer shadow-lg shadow-intel/25 hover:scale-105 active:scale-95 flex items-center gap-1.5 shrink-0 border border-intel/40"
      >
        <Zap size={14} />
        <span>عالیه، دریافت دستاورد 🎉</span>
        <Check size={13} strokeWidth={3} className="mr-0.5" />
      </button>
    </div>
  );
}
