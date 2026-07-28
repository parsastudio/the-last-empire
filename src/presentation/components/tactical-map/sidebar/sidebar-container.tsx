import React, { useState } from "react";
import { SidebarTabs, SidebarTabType } from "./sidebar-tabs";
import { NextTurnButton } from "./next-turn-button";
import { OverviewTab } from "./tabs/overview-tab";
import { MilitaryTab } from "./tabs/military/military-tab";
import { PoliticsTab } from "./tabs/politics/politics-tab";
import { DiplomacyTab } from "./tabs/diplomacy-tab";
import { ResearchTab } from "./tabs/research/research-tab";
import { AbilitiesTab } from "./tabs/abilities/abilities-tab";
import { MarketTab } from "./tabs/market/market-tab";
import { ReportsSidebarTab } from "../reports/reports-sidebar-tab";
import { TurnSummaryModal } from "../reports/turn-summary-modal";
import { EventDecisionModal } from "../modals/event-decision-modal";
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
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
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

    if ((currentTurn + 1) % 3 === 0) {
      setTimeout(() => {
        setIsEventModalOpen(true);
      }, 500);
    }
  };

  const handleSelectReportInSidebar = (report: CombatReport) => {
    setModalReports([report]);
    setIsModalOpen(true);
  };

  const sampleEvent = {
    title: "بحران کمبود انرژی و سوخت استراتژیک",
    description:
      "ذخایر نفت خام کشور به دلیل مصرف بالای جنگنده‌ها کاهش یافته است. صنایع کشور نیازمند تصمیم‌گیری فوری دولتی هستند.",
    choices: [
      {
        id: "c1",
        description: "سهمیه‌بندی سوخت صنایع و تخصیص به ارتش",
        effectsSummary: [
          { label: "ثبات", value: "-۵٪", isPositive: false },
          { label: "خزانه", value: "+$۱۰,۰۰۰", isPositive: true },
        ],
      },
      {
        id: "c2",
        description: "تزریق سوبسید سنگین مالی به نیروگاه‌ها",
        effectsSummary: [
          { label: "ثبات", value: "+۵٪", isPositive: true },
          { label: "خزانه", value: "-$۳۰,۰۰۰", isPositive: false },
        ],
      },
    ],
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
          {activeTab === "market" && <MarketTab />}
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

      <EventDecisionModal
        isOpen={isEventModalOpen}
        title={sampleEvent.title}
        description={sampleEvent.description}
        choices={sampleEvent.choices}
        onSelectChoice={(choiceId) => {
          alert(`تصمیم انتخابی شما (${choiceId}) اعمال گردید.`);
          setIsEventModalOpen(false);
        }}
      />
    </>
  );
}
