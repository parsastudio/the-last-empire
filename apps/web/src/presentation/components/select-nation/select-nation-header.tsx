import React from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { LanguageSwitcher } from "@/presentation/components/common/language-switcher";

interface SelectNationHeaderProps {
  onBack: () => void;
}

export function SelectNationHeader({ onBack }: SelectNationHeaderProps) {
  const t = useTranslations("selectNation.header");

  return (
    <header
      style={{
        paddingTop: "max(0.25rem, env(safe-area-inset-top))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
      className="h-11 sm:h-14 md:h-16 border-b border-border bg-card/50 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between shrink-0"
    >
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onBack}
          className="p-1.5 sm:p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowLeft size={15} className="rtl:rotate-180 shrink-0" />
          <span>{t("back")}</span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[11px] sm:text-xs font-mono font-bold text-gdp">
          {t("badge")}
        </span>
        <LanguageSwitcher />
      </div>
    </header>
  );
}
