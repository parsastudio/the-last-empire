import React, { useState } from "react";
import { SidebarTabs, SidebarTabType } from "./sidebar-tabs";
import { OverviewTab } from "./tabs/overview-tab";
import { MilitaryTab } from "./tabs/military-tab";
import { PoliticsTab } from "./tabs/politics-tab";
import { DiplomacyTab } from "./tabs/diplomacy-tab";
import { ResearchTab } from "./tabs/research-tab";

interface SidebarContainerProps {
  isOpen: boolean;
}

export function SidebarContainer({ isOpen }: SidebarContainerProps) {
  const [activeTab, setActiveTab] = useState<SidebarTabType>("overview");

  if (!isOpen) return null;

  const realSchemaNation = {
    name: "جمهوری اسلامی ایران",
    code: "IRN",
    flagCode: "ir",
    gdp: 450000000000,
    taxRate: 15,
    tariffRate: 10,
    treasury: 350000,
    nationalDebt: 0,
    population: 88000000,
    warExhaustion: 0,
    industrialLevel: 1,
    government: {
      type: "DICTATORSHIP",
      stability: 80,
      corruption: 5,
      socialFreedom: 80,
      turnsInPower: 5,
    },
    resources: {
      oil: 5000,
      steel: 2000,
      manpower: 500,
    },
    military: {
      infantry: 450,
      airForce: 40,
      droneMissile: 60,
      experience: 10,
      techLevel: 3,
    },
    globalReputation: 50,
    globalAggression: 0,
  };

  return (
    <aside
      className="absolute top-0 right-0 h-screen w-[22vw] min-w-[320px] max-w-[420px] bg-card/90 backdrop-blur-xl border-l border-border z-40 flex flex-col shadow-2xl select-none"
      dir="rtl"
    >
      <div className="p-4 border-b border-border shrink-0 space-y-3">
        <span className="text-[10px] font-bold text-gdp uppercase tracking-widest font-mono block">
          مرکز فرماندهی کل قوا
        </span>
        <SidebarTabs activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {activeTab === "overview" && <OverviewTab nation={realSchemaNation} />}
        {activeTab === "military" && (
          <MilitaryTab military={realSchemaNation.military} />
        )}
        {activeTab === "politics" && (
          <PoliticsTab
            taxRate={realSchemaNation.taxRate}
            governmentType={realSchemaNation.government.type}
          />
        )}
        {activeTab === "diplomacy" && <DiplomacyTab />}
        {activeTab === "research" && <ResearchTab />}
      </div>
    </aside>
  );
}
