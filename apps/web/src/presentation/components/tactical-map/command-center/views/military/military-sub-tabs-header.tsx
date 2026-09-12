import React from "react";
import { useTranslations } from "next-intl";
import { LayoutDashboard, Hammer, ShoppingCart } from "lucide-react";
import { useLocaleFormatter } from "@/presentation/hooks/common/use-locale-formatter";

export type MilitarySubTabType = "overview" | "domestic" | "allies";

interface MilitarySubTabsHeaderProps {
  activeSubTab: MilitarySubTabType;
  alliesCount: number;
  onSelectSubTab: (subTab: MilitarySubTabType) => void;
}

export function MilitarySubTabsHeader({
  activeSubTab,
  alliesCount,
  onSelectSubTab,
}: MilitarySubTabsHeaderProps) {
  const t = useTranslations("military.subTabs");
  const { toDigits } = useLocaleFormatter();

  const tabs = [
    {
      id: "overview" as const,
      label: t("overview"),
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: "domestic" as const,
      label: t("domestic"),
      icon: Hammer,
      badge: t("domesticBadge"),
    },
    {
      id: "allies" as const,
      label: t("allies"),
      icon: ShoppingCart,
      badge: t("alliesBadge", { count: toDigits(alliesCount) }),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 p-1.5 bg-background/50 border border-border/70 rounded-2xl">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeSubTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectSubTab(tab.id)}
            className={`py-3 px-4 rounded-xl font-sans text-xs font-bold transition-all cursor-pointer flex items-center justify-between gap-2 ${
              isActive
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 border border-primary/40"
                : "bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/70 border border-border/40"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon size={16} />
              <span>{tab.label}</span>
            </div>
            {tab.badge && (
              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                  isActive
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
