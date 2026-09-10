import React from "react";
import { Globe, ShieldAlert, Cpu } from "lucide-react";

export function StatusTicker() {
  return (
    <footer className="w-full border-t border-border bg-background/50 backdrop-blur-md py-4 px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-muted-foreground z-10 dir-rtl">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gdp opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-gdp"></span>
        </span>
        <span>رادار دفاع هوایی آنلاین و آماده‌باش ۱۰۰٪</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Globe size={13} className="text-primary/70" />
          <span>ارتباط ماهواره‌ای اتاق جنگ: امن و متصل</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldAlert size={13} className="text-military/80" />
          <span>پایش زنده مرزها و تحرکات ماهواره‌ای: فعال</span>
        </div>
        <div className="flex items-center gap-2">
          <Cpu size={13} className="text-gdp/80" />
          <span>خطوط تدارکات و لجستیک ارتش: پایدار</span>
        </div>
      </div>
    </footer>
  );
}
