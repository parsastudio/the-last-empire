import React from "react";
import { useTranslations } from "next-intl";
import { Swords, Users, Binary, ShieldAlert } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface ReportStatsOverviewProps {
  stats: {
    combatCount: number;
    diplomacyCount: number;
    espionageCount: number;
    criticalCount: number;
  };
  turnLabel: string;
}

export function ReportStatsOverview({
  stats,
  turnLabel,
}: ReportStatsOverviewProps) {
  const t = useTranslations("reports.stats");

  const cards = [
    {
      id: "combat",
      label: t("combat", { turn: turnLabel }),
      value: stats.combatCount,
      icon: Swords,
      color: "text-military",
      border: "border-military/30",
      bg: "bg-military/10",
    },
    {
      id: "diplomacy",
      label: t("diplomacy", { turn: turnLabel }),
      value: stats.diplomacyCount,
      icon: Users,
      color: "text-diplomacy",
      border: "border-diplomacy/30",
      bg: "bg-diplomacy/10",
    },
    {
      id: "espionage",
      label: t("espionage", { turn: turnLabel }),
      value: stats.espionageCount,
      icon: Binary,
      color: "text-treasury",
      border: "border-treasury/30",
      bg: "bg-treasury/10",
    },
    {
      id: "critical",
      label: t("critical", { turn: turnLabel }),
      value: stats.criticalCount,
      icon: ShieldAlert,
      color: "text-rose-500",
      border: "border-rose-500/30",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-sans dir-rtl text-right">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`p-3 rounded-2xl border ${card.border} ${card.bg} space-y-1 transition-all backdrop-blur-sm shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-bold">
                {card.label}
              </span>
              <Icon size={14} className={card.color} />
            </div>
            <span
              className={`text-lg font-black font-mono block ${card.color}`}
            >
              {PersianNumberFormatter.toPersianDigits(card.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
