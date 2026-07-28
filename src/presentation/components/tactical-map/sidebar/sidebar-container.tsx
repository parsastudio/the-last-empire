import React, { useState } from "react";
import { SidebarTabs, SidebarTabType } from "./sidebar-tabs";
import { NextTurnButton } from "./next-turn-button";
import { OverviewTab } from "./tabs/overview-tab";
import { MilitaryTab } from "./tabs/military/military-tab";
import { PoliticsTab } from "./tabs/politics/politics-tab";
import { DiplomacyTab } from "./tabs/diplomacy-tab";
import { ResearchTab } from "./tabs/research/research-tab";
import { AbilitiesTab } from "./tabs/abilities/abilities-tab";
import { ReportsSidebarTab } from "../reports/reports-sidebar-tab";
import { TurnSummaryModal } from "../reports/turn-summary-modal";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { CombatReportEngine } from "@/engine/reports/combat-report-engine";

interface SidebarContainerProps {
  isOpen: boolean;
  externalActiveTab?: SidebarTabType | null;
  selectedTargetCode?: string | null;
  onFocusCountry?: (code: string) => void;
}

export function SidebarContainer({
  isOpen,
  externalActiveTab,
  selectedTargetCode,
  onFocusCountry,
}: SidebarContainerProps) {
  const [activeTab, setActiveTab] = useState<SidebarTabType>("overview");
  const [prevExternalTab, setPrevExternalTab] = useState<SidebarTabType | null>(
    null,
  );
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalReports, setModalReports] = useState<CombatReport[]>([]);

  if (externalActiveTab && externalActiveTab !== prevExternalTab) {
    setPrevExternalTab(externalActiveTab);
    setActiveTab(externalActiveTab);
  }

  const reportEngine = new CombatReportEngine();

  const mockDefeatReport = reportEngine.createReport({
    attackerId: "IRN",
    attackerNameFa: "ایران",
    defenderId: "USA",
    defenderNameFa: "ایالات متحده آمریکا",
    turn: currentTurn,
    attackerCasualties: {
      infantryEngaged: 450,
      infantryLost: 135,
      airForceEngaged: 40,
      airForceLost: 18,
      droneMissileEngaged: 60,
      droneMissileLost: 45,
    },
    defenderCasualties: {
      infantryEngaged: 1000,
      infantryLost: 80,
      airForceEngaged: 250,
      airForceLost: 12,
      droneMissileEngaged: 80,
      droneMissileLost: 10,
    },
    conqueredPixelsCount: 0,
    capitulatedPixelsCount: 0,
    governmentType: "DICTATORSHIP",
  });

  const mockVictoryReport = reportEngine.createReport({
    attackerId: "IRN",
    attackerNameFa: "ایران",
    defenderId: "ISR",
    defenderNameFa: "اسرائیل",
    turn: currentTurn,
    attackerCasualties: {
      infantryEngaged: 450,
      infantryLost: 45,
      airForceEngaged: 40,
      airForceLost: 6,
      droneMissileEngaged: 60,
      droneMissileLost: 15,
    },
    defenderCasualties: {
      infantryEngaged: 200,
      infantryLost: 110,
      airForceEngaged: 75,
      airForceLost: 28,
      droneMissileEngaged: 35,
      droneMissileLost: 25,
    },
    conqueredPixelsCount: 48,
    capitulatedPixelsCount: 12,
    governmentType: "DICTATORSHIP",
  });

  const mockAllReports = [mockDefeatReport, mockVictoryReport];

  if (!isOpen) return null;

  const handleNextTurn = () => {
    setCurrentTurn((prev) => prev + 1);
    setModalReports(mockAllReports);
    setIsModalOpen(true);
  };

  const handleSelectReportInSidebar = (report: CombatReport) => {
    setModalReports([report]);
    setIsModalOpen(true);
  };

  const realSchemaNation = {
    name: "ایران",
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
    <>
      <aside
        className="absolute top-0 right-0 h-screen w-[22vw] min-w-[320px] max-w-[420px] bg-card/90 backdrop-blur-xl border-l border-border z-40 flex flex-col shadow-2xl select-none"
        dir="rtl"
      >
        <div className="p-4 border-b border-border shrink-0 space-y-3">
          <NextTurnButton
            currentTurn={currentTurn}
            onNextTurn={handleNextTurn}
          />
          <SidebarTabs activeTab={activeTab} onChangeTab={setActiveTab} />
        </div>

        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {activeTab === "overview" && (
            <OverviewTab nation={realSchemaNation} />
          )}
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
            <AbilitiesTab
              currentGovernment={realSchemaNation.government.type}
            />
          )}
          {activeTab === "reports" && (
            <ReportsSidebarTab
              reports={mockAllReports}
              onSelectReport={handleSelectReportInSidebar}
            />
          )}
          {activeTab === "diplomacy" && (
            <DiplomacyTab
              selectedTargetCode={selectedTargetCode}
              onFocusCountry={onFocusCountry}
            />
          )}
          {activeTab === "research" && <ResearchTab />}
        </div>
      </aside>

      <TurnSummaryModal
        isOpen={isModalOpen}
        reports={modalReports}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
