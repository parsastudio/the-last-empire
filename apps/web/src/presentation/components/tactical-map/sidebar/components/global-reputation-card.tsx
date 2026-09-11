import React from "react";
import { useTranslations } from "next-intl";
import { Globe, ShieldAlert } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface GlobalReputationCardProps {
  reputation: number;
}

export function GlobalReputationCard({
  reputation,
}: GlobalReputationCardProps) {
  const t = useTranslations("overview.reputation");

  const reputationStyle =
    reputation > 0
      ? {
          border: "border-gdp/30 hover:border-gdp/60",
          topLine: "from-gdp/60 via-emerald-500/40",
          text: "text-gdp",
          badgeBg: "bg-gdp/15 text-gdp border-gdp/30",
        }
      : reputation < 0
        ? {
            border: "border-military/30 hover:border-military/60",
            topLine: "from-military/60 via-rose-500/40",
            text: "text-military",
            badgeBg: "bg-military/15 text-military border-military/30",
          }
        : {
            border: "border-border hover:border-border/80",
            topLine: "from-border via-secondary",
            text: "text-foreground",
            badgeBg: "bg-secondary text-muted-foreground border-border",
          };

  return (
    <div
      className={`bg-background/60 border ${reputationStyle.border} p-4 rounded-2xl space-y-3 shadow-lg relative overflow-hidden transition-all group flex flex-col justify-between`}
    >
      <div
        className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${reputationStyle.topLine} to-transparent`}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          {reputation < 0 ? (
            <ShieldAlert size={15} className="text-military shrink-0" />
          ) : (
            <Globe size={15} className="text-gdp shrink-0" />
          )}
          <span>{t("title")}</span>
        </div>
        <span
          className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-bold border ${reputationStyle.badgeBg}`}
        >
          {reputation > 0
            ? t("favorable")
            : reputation < 0
              ? t("isolated")
              : t("neutral")}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-2 text-center space-y-1">
        <span
          className={`text-3xl md:text-4xl font-black font-mono ${reputationStyle.text} tracking-tight drop-shadow-sm`}
        >
          {reputation > 0 ? "+" : ""}
          {PersianNumberFormatter.toPersianDigits(reputation)}
        </span>
        <span className="text-[10px] text-muted-foreground font-sans">
          {t("scoreSubtitle")}
        </span>
      </div>

      <div className="bg-secondary/50 border border-border/50 p-2 rounded-xl flex items-center justify-between text-[10px] font-mono">
        <span className="text-muted-foreground font-sans">
          {t("publicStatus")}
        </span>
        <span className={`font-extrabold ${reputationStyle.text}`}>
          {reputation > 20
            ? t("popularPower")
            : reputation < -20
              ? t("globalThreat")
              : t("normalStatus")}
        </span>
      </div>
    </div>
  );
}
