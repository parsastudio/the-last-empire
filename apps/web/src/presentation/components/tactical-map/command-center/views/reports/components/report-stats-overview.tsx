import React from "react";
import { Swords, Users, Binary, ShieldAlert, FileText } from "lucide-react";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface ReportStatsOverviewProps {
  stats: {
    total: number;
    combatCount: number;
    diplomacyCount: number;
    espionageCount: number;
    criticalCount: number;
  };
}

export function ReportStatsOverview({ stats }: ReportStatsOverviewProps) {
  const cards = [
    {
      id: "total",
      label: "کل رویدادهای ثبت‌شده",
      value: stats.total,
      icon: FileText,
      color: "text-foreground",
      border: "border-border/60",
      bg: "bg-secondary/40",
    },
    {
      id: "combat",
      label: "نبردها و درگیری‌ها",
      value: stats.combatCount,
      icon: Swords,
      color: "text-military",
      border: "border-military/30",
      bg: "bg-military/10",
    },
    {
      id: "diplomacy",
      label: "دیپلماسی و معاهدات",
      value: stats.diplomacyCount,
      icon: Users,
      color: "text-diplomacy",
      border: "border-diplomacy/30",
      bg: "bg-diplomacy/10",
    },
    {
      id: "espionage",
      label: "عملیات‌های ویژه اطلاعاتی",
      value: stats.espionageCount,
      icon: Binary,
      color: "text-treasury",
      border: "border-treasury/30",
      bg: "bg-treasury/10",
    },
    {
      id: "critical",
      label: "وضعیت‌های بحرانی و سقوط",
      value: stats.criticalCount,
      icon: ShieldAlert,
      color: "text-rose-500",
      border: "border-rose-500/30",
      bg: "bg-rose-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-sans dir-rtl text-right">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className={`p-3 rounded-2xl border ${card.border} ${card.bg} space-y-1 transition-all backdrop-blur-sm shadow-sm`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-semibold">
                {card.label}
              </span>
              <Icon size={14} className={card.color} />
            </div>
            <span
              className={`text-base font-black font-mono block ${card.color}`}
            >
              {PersianNumberFormatter.toPersianDigits(card.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
