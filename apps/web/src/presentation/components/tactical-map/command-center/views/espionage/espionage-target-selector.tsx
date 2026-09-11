import React from "react";
import { useTranslations } from "next-intl";
import { Search, Binary } from "lucide-react";
import { getFlagEmoji } from "@/presentation/utils/flag-emoji";
import { PersianNumberFormatter } from "@geopolitics/domain";

export interface EspionageTargetOption {
  id: string;
  name: string;
  flagCode: string;
  rank: number;
  gdp: number;
  militaryTechLevel: number;
}

interface EspionageTargetSelectorProps {
  targets: EspionageTargetOption[];
  selectedTargetId: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectTarget: (id: string) => void;
}

export function EspionageTargetSelector({
  targets,
  selectedTargetId,
  searchQuery,
  onSearchChange,
  onSelectTarget,
}: EspionageTargetSelectorProps) {
  const t = useTranslations("espionage.selector");

  return (
    <div className="space-y-3 bg-background/30 p-4 border border-border/60 rounded-3xl">
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <Binary size={14} className="text-primary" />
          <span className="text-xs font-bold text-foreground">
            {t("title")}
          </span>
        </div>
        <span className="text-[10px] font-mono bg-secondary px-2 py-0.5 rounded-lg text-muted-foreground">
          {t("targetCount", {
            count: PersianNumberFormatter.toPersianDigits(targets.length),
          })}
        </span>
      </div>

      <div className="relative">
        <Search
          size={14}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="text"
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-secondary/50 border border-border rounded-xl py-2 pr-9 pl-3 text-xs text-foreground text-right focus:outline-none focus:border-primary"
        />
      </div>

      <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
        {targets.map((target) => {
          const isSelected = target.id === selectedTargetId;
          const flag = getFlagEmoji(target.flagCode);

          return (
            <button
              key={target.id}
              onClick={() => onSelectTarget(target.id)}
              className={`w-full p-3 rounded-2xl border text-right transition-all flex items-center justify-between text-xs cursor-pointer ${
                isSelected
                  ? "bg-secondary border-primary font-bold shadow-sm"
                  : "bg-background/40 border-border/60 hover:bg-secondary/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="text-xl select-none"
                  role="img"
                  aria-label={target.name}
                >
                  {flag}
                </span>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="block font-bold">{target.name}</span>
                    <span className="text-[9px] font-mono text-muted-foreground">
                      #{PersianNumberFormatter.toPersianDigits(target.rank)}
                    </span>
                  </div>
                  <span className="text-[9px] text-gdp font-mono block">
                    {PersianNumberFormatter.formatCurrency(target.gdp, true)}
                  </span>
                </div>
              </div>

              <div className="text-left font-mono text-[9px] text-muted-foreground space-y-0.5">
                <span>
                  {t("tech", {
                    level: PersianNumberFormatter.toPersianDigits(
                      target.militaryTechLevel,
                    ),
                  })}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
