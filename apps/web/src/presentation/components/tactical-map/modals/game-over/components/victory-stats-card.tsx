import React from "react";
import { useTranslations } from "next-intl";
import { Award, Coins, Users, Globe2 } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface VictoryStatsCardProps {
  turnsPlayed: number;
  finalGdp: string;
  finalPopulation: string;
  conqueredPixels: string;
}

export function VictoryStatsCard({
  turnsPlayed,
  finalGdp,
  finalPopulation,
  conqueredPixels,
}: VictoryStatsCardProps) {
  const t = useTranslations("gameOver.stats");

  return (
    <div className="grid grid-cols-2 gap-2.5 font-mono text-xs dir-rtl">
      <div className="bg-secondary/50 p-3.5 rounded-2xl space-y-1 border border-border/60">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
          <Award size={13} className="text-amber-500" />
          <span>{t("turnsPlayed")}</span>
        </div>
        <span className="font-bold text-foreground block">
          {t("turnUnit", {
            count: PersianNumberFormatter.toPersianDigits(turnsPlayed),
          })}
        </span>
      </div>

      <div className="bg-secondary/50 p-3.5 rounded-2xl space-y-1 border border-border/60">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
          <Coins size={13} className="text-gdp" />
          <span>{t("finalGdp")}</span>
        </div>
        <span className="font-bold text-foreground block">{finalGdp}</span>
      </div>

      <div className="bg-secondary/50 p-3.5 rounded-2xl space-y-1 border border-border/60">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
          <Users size={13} className="text-primary" />
          <span>{t("finalPopulation")}</span>
        </div>
        <span className="font-bold text-foreground block">
          {finalPopulation}
        </span>
      </div>

      <div className="bg-secondary/50 p-3.5 rounded-2xl space-y-1 border border-border/60">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-sans font-bold">
          <Globe2 size={13} className="text-military" />
          <span>{t("conqueredTerritory")}</span>
        </div>
        <span className="font-bold text-foreground block">
          {conqueredPixels}
        </span>
      </div>
    </div>
  );
}
