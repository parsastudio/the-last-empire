import React from "react";
import { NationHeaderCard } from "./nation-header-card";
import { EconomyStatsSection } from "./economy-stats-section";
import { ResourcesSection } from "./resources-section";
import { MilitaryForcesSection } from "./military-forces-section";
import { GovernmentStatusSection } from "./government-status-section";

interface SidebarContainerProps {
  isOpen: boolean;
}

export function SidebarContainer({ isOpen }: SidebarContainerProps) {
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
      <div className="p-5 border-b border-border shrink-0">
        <span className="text-[10px] font-bold text-gdp uppercase tracking-widest font-mono block mb-2">
          مرکز فرماندهی کل قوا
        </span>
        <NationHeaderCard
          name={realSchemaNation.name}
          code={realSchemaNation.code}
          flagCode={realSchemaNation.flagCode}
          governmentType={realSchemaNation.government.type}
          population={realSchemaNation.population}
        />
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <EconomyStatsSection
          gdp={realSchemaNation.gdp}
          treasury={realSchemaNation.treasury}
          taxRate={realSchemaNation.taxRate}
          nationalDebt={realSchemaNation.nationalDebt}
          tariffRate={realSchemaNation.tariffRate}
        />

        <ResourcesSection
          oil={realSchemaNation.resources.oil}
          steel={realSchemaNation.resources.steel}
          manpower={realSchemaNation.resources.manpower}
          industrialLevel={realSchemaNation.industrialLevel}
        />

        <MilitaryForcesSection
          infantry={realSchemaNation.military.infantry}
          airForce={realSchemaNation.military.airForce}
          droneMissile={realSchemaNation.military.droneMissile}
          techLevel={realSchemaNation.military.techLevel}
          experience={realSchemaNation.military.experience}
        />

        <GovernmentStatusSection
          stability={realSchemaNation.government.stability}
          corruption={realSchemaNation.government.corruption}
          warExhaustion={realSchemaNation.warExhaustion}
          reputation={realSchemaNation.globalReputation}
          globalAggression={realSchemaNation.globalAggression}
          socialFreedom={realSchemaNation.government.socialFreedom}
        />
      </div>
    </aside>
  );
}
