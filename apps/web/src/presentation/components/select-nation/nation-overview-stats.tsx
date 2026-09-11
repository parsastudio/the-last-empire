import React from "react";
import { Award, Coins, Users, Landmark } from "lucide-react";
import { NationDetail } from "@/presentation/components/select-nation/nation-list-item";

interface NationOverviewStatsProps {
  nation: NationDetail;
}

export function NationOverviewStats({ nation }: NationOverviewStatsProps) {
  const statCards = [
    {
      id: "rank",
      label: "رتبه قدرت جهانی",
      value: `#${nation.rank}`,
      icon: Award,
      iconColor: "text-amber-500",
    },
    {
      id: "gdp",
      label: "تولید ناخالص (GDP)",
      value: nation.gdp,
      icon: Coins,
      iconColor: "text-gdp",
    },
    {
      id: "population",
      label: "جمعیت کل",
      value: nation.population,
      icon: Users,
      iconColor: "text-primary",
    },
    {
      id: "treasury",
      label: "خزانه اولیه ملی",
      value: nation.treasury,
      icon: Landmark,
      iconColor: "text-treasury",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 dir-rtl text-right">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-background/50 border border-border/80 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl space-y-0.5"
          >
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-muted-foreground font-mono">
              <Icon size={12} className={card.iconColor} />
              <span className="truncate">{card.label}</span>
            </div>
            <span className="text-xs sm:text-sm font-bold text-foreground font-mono block truncate">
              {card.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
