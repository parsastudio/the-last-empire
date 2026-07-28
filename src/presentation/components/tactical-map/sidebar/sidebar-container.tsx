import React, { useState } from "react";
import { SidebarTabs, SidebarTabType } from "./sidebar-tabs";
import { NextTurnButton } from "./next-turn-button";
import { OverviewTab } from "./tabs/overview-tab";
import { MilitaryTab } from "./tabs/military/military-tab";
import { PoliticsTab } from "./tabs/politics/politics-tab";
import { DiplomacyTab } from "./tabs/diplomacy-tab";
import { ResearchTab } from "./tabs/research/research-tab";
import { AbilitiesTab } from "./tabs/abilities/abilities-tab";

interface SidebarContainerProps {
  isOpen: boolean;
}

export function SidebarContainer({ isOpen }: SidebarContainerProps) {
  const [activeTab, setActiveTab] = useState<SidebarTabType>("overview");
  const [currentTurn, setCurrentTurn] = useState<number>(1);

  if (!isOpen) return null;

  const handleNextTurn = () => {
    setCurrentTurn((prev) => prev + 1);
    alert(
      `نوبت ${currentTurn} پایان یافت. موتور بازی در حال پردازش اقتصاد، ارتش و هوش مصنوعی است...`,
    );
  };

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
        <NextTurnButton currentTurn={currentTurn} onNextTurn={handleNextTurn} />
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
        {activeTab === "abilities" && (
          <AbilitiesTab currentGovernment={realSchemaNation.government.type} />
        )}
        {activeTab === "diplomacy" && <DiplomacyTab />}
        {activeTab === "research" && <ResearchTab />}
      </div>
    </aside>
  );
}
