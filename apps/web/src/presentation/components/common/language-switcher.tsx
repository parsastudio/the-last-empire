"use client";

import React, { useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Languages } from "lucide-react";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    TacticalSound.playUiClick();
    const nextLocale = locale === "fa" ? "en" : "fa";
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className="p-1.5 md:p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 bg-secondary/80 border-border/70 text-muted-foreground hover:text-foreground hover:bg-secondary shadow-inner font-mono text-[10px] md:text-xs font-black disabled:opacity-50"
      title={t("language")}
    >
      <Languages size={14} className="text-primary shrink-0" />
      <span>{locale === "fa" ? "EN" : "FA"}</span>
    </button>
  );
}
