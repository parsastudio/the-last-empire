import React from "react";
import { useTranslations } from "next-intl";
import { Globe, ShieldAlert, Cpu, Radio } from "lucide-react";

export function StatusTicker() {
  const t = useTranslations("menu.ticker");

  return (
    <footer
      style={{
        paddingBottom: "max(0.4rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
      className="w-full border-t border-border/80 bg-background/80 backdrop-blur-xl py-2 px-4 sm:px-8 flex items-center justify-between gap-4 text-[9px] sm:text-[10px] font-mono text-muted-foreground z-10 shrink-0"
    >
      <div className="flex items-center gap-2 shrink-0">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="font-bold text-foreground/90">{t("radar")}</span>
      </div>

      <div className="hidden sm:flex items-center gap-6 overflow-hidden">
        <div className="flex items-center gap-1.5 text-primary/80">
          <Radio size={12} className="animate-pulse" />
          <span>{t("satellite")}</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400/80">
          <ShieldAlert size={12} />
          <span>{t("border")}</span>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-gdp/80">
          <Cpu size={12} />
          <span>{t("logistics")}</span>
        </div>
      </div>
    </footer>
  );
}
