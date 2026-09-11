import React from "react";
import { Globe, ShieldAlert, Cpu } from "lucide-react";

export function StatusTicker() {
  return (
    <footer
      style={{
        paddingBottom: "max(0.35rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
      className="w-full border-t border-border bg-background/60 backdrop-blur-md py-1.5 sm:py-2.5 px-4 sm:px-8 flex items-center justify-between gap-3 text-[9px] sm:text-[10px] font-mono text-muted-foreground z-10 dir-rtl shrink-0"
    >
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gdp opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-gdp" />
        </span>
        <span className="truncate">رادار دفاع هوایی آنلاین ۱۰۰٪</span>
      </div>

      <div className="hidden sm:flex items-center gap-4 md:gap-6 overflow-hidden">
        <div className="flex items-center gap-1.5 truncate">
          <Globe size={12} className="text-primary/70 shrink-0" />
          <span className="truncate">ارتباط ماهواره‌ای: متصل</span>
        </div>
        <div className="flex items-center gap-1.5 truncate">
          <ShieldAlert size={12} className="text-military/80 shrink-0" />
          <span className="truncate">پایش مرزی: فعال</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 truncate">
          <Cpu size={12} className="text-gdp/80 shrink-0" />
          <span className="truncate">لجستیک: پایدار</span>
        </div>
      </div>
    </footer>
  );
}
