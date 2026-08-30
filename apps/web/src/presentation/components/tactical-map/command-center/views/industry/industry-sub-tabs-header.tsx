"use client";

import React from "react";
import { Factory, ShoppingCart } from "lucide-react";

export type IndustrySubTabType = "domestic" | "imports";

interface IndustrySubTabsHeaderProps {
  activeTab: IndustrySubTabType;
  onSelectTab: (tab: IndustrySubTabType) => void;
}

export function IndustrySubTabsHeader({
  activeTab,
  onSelectTab,
}: IndustrySubTabsHeaderProps) {
  const tabs = [
    {
      id: "domestic" as const,
      label: "صنایع و بازسازی بومی",
      icon: Factory,
    },
    {
      id: "imports" as const,
      label: "واردات ماشین‌آلات صنعتی",
      icon: ShoppingCart,
    },
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-secondary/50 border border-border/80 rounded-2xl w-fit dir-rtl font-sans">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isActive
                ? "bg-card text-foreground shadow-md border border-border/80"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent"
            }`}
          >
            <Icon size={14} className={isActive ? "text-gdp" : ""} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
