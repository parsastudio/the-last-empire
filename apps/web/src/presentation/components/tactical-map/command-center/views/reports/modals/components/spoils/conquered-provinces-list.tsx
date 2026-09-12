import React from "react";
import { useTranslations } from "next-intl";
import { Flag } from "lucide-react";
import { ProvinceNameFormatter } from "@/presentation/utils/province-name-formatter";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

interface ConqueredProvincesListProps {
  provincesNames?: string[];
}

export function ConqueredProvincesList({
  provincesNames,
}: ConqueredProvincesListProps) {
  const t = useTranslations("reports.spoils.provinces");
  const { locale } = useLocaleFormatter();

  if (!provincesNames || provincesNames.length === 0) return null;

  return (
    <div className="bg-card/90 border border-border/80 p-3 rounded-2xl space-y-2 w-full text-start font-sans">
      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
        <Flag size={13} className="text-primary" />
        <span>{t("title")}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {provincesNames.map((name, idx) => (
          <span
            key={idx}
            className="bg-secondary/70 border border-border/70 px-2.5 py-1 rounded-xl text-xs font-bold font-sans text-foreground flex items-center gap-1.5 shadow-sm"
          >
            <span>📍</span>
            <span>{ProvinceNameFormatter.format(name, locale)}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
