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
import { MOCK_SCHEMA_NATION } from "./config/mock-nation.config";
import { useSidebarReports } from "./hooks/use-sidebar-reports";

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

  const mockAllReports = useSidebarReports(currentTurn);

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
            <OverviewTab nation={MOCK_SCHEMA_NATION} />
          )}
          {activeTab === "military" && (
            <MilitaryTab military={MOCK_SCHEMA_NATION.military} />
          )}
          {activeTab === "politics" && (
            <PoliticsTab
              taxRate={MOCK_SCHEMA_NATION.taxRate}
              governmentType={MOCK_SCHEMA_NATION.government.type}
            />
          )}
          {activeTab === "abilities" && (
            <AbilitiesTab
              currentGovernment={MOCK_SCHEMA_NATION.government.type}
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
