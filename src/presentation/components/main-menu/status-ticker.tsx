import React from "react";
import { Globe, ShieldAlert, Cpu } from "lucide-react";

export function StatusTicker() {
  return (
    <footer className="w-full border-t border-border bg-background/50 backdrop-blur-md py-4 px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-muted-foreground z-10">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>بخش‌های محاسباتی فعال و آماده نبرد</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Globe size={13} className="text-primary/70" />
          <span>فشار ژئوپلیتیک جهانی: ۵۲٪</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldAlert size={13} className="text-military/80" />
          <span>پروتکل دفاعی: زرد (سطح متوسط)</span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu size={13} className="text-gdp/80" />
          <span>بار پردازشی هسته: ۲.۴۳ گیگاهرتز</span>
        </div>
      </div>
    </footer>
  );
}
