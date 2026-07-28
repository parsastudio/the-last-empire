import React, { useState } from "react";
import { SidebarTabType } from "./sidebar-tabs";
import { CommandRail } from "../command-rail/command-rail";
import { CommandCenterModal } from "../command-center/command-center-modal";
import { TurnSummaryModal } from "../reports/turn-summary-modal";
import { EventDecisionModal } from "../modals/event-decision-modal";
import { TradeActionDialog } from "./tabs/market/trade-action-dialog";
import { CombatReport } from "@/domain/reports/combat-report.schema";
import { useSidebarReports } from "./hooks/use-sidebar-reports";
import { TurnStagingLedger } from "./staging/turn-staging-ledger";
import { useToast } from "@/presentation/context/toast-context";

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
  const [activeTab, setActiveTab] = useState<SidebarTabType | null>(null);
  const [isRailCollapsed, setIsRailCollapsed] = useState<boolean>(true);
  const [currentTurn, setCurrentTurn] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [modalReports, setModalReports] = useState<CombatReport[]>([]);
  const { showToast } = useToast();

  const [stagedActions, setStagedActions] = useState<
    Array<{ id: string; typeLabel: string; cost: number }>
  >([
    { id: "1", typeLabel: "سفارش ساخت ۱۰ پیاده‌نظام", cost: 1000 },
    { id: "2", typeLabel: "تزریق بودجه عملیات پنهان", cost: 15000 },
  ]);

  const [tradeDialog, setTradeDialog] = useState<{
    isOpen: boolean;
    resourceName: string;
    unit: string;
    mode: "buy" | "sell";
    unitPrice: number;
    maxAmount: number;
  }>({
    isOpen: false,
    resourceName: "",
    unit: "",
    mode: "buy",
    unitPrice: 100,
    maxAmount: 100,
  });

  const mockAllReports = useSidebarReports(currentTurn);

  if (!isOpen) return null;

  const handleNextTurn = () => {
    setCurrentTurn((prev) => prev + 1);
    setModalReports(mockAllReports);
    setIsModalOpen(true);
    setStagedActions([]);

    showToast(
      "نوبت جدید آغاز شد",
      `محاسبات نوبت ${currentTurn + 1} با موفقیت انجام شد.`,
      "info",
    );

    if ((currentTurn + 1) % 3 === 0) {
      setTimeout(() => {
        setIsEventModalOpen(true);
      }, 500);
    }
  };

  const handleOpenTrade = (
    name: string,
    unit: string,
    mode: "buy" | "sell",
    price: number,
  ) => {
    setTradeDialog({
      isOpen: true,
      resourceName: name,
      unit,
      mode,
      unitPrice: price,
      maxAmount: mode === "buy" ? 200 : 50,
    });
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
      <CommandRail
        activeTab={activeTab}
        isCollapsed={isRailCollapsed}
        currentTurn={currentTurn}
        onSelectTab={setActiveTab}
        onToggleCollapse={() => setIsRailCollapsed((prev) => !prev)}
        onNextTurn={handleNextTurn}
      />

      {!isRailCollapsed && (
        <div className="fixed bottom-20 right-4 w-48 z-40">
          <TurnStagingLedger
            stagedActions={stagedActions}
            onClearStaged={() => setStagedActions([])}
          />
        </div>
      )}

      <CommandCenterModal
        activeTab={activeTab}
        selectedTargetCode={selectedTargetCode}
        mockReports={mockAllReports}
        onClose={() => setActiveTab(null)}
        onFocusCountry={onFocusCountry}
        onSelectReport={(report) => {
          setModalReports([report]);
          setIsModalOpen(true);
        }}
        onOpenTrade={handleOpenTrade}
      />

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
          showToast(
            "تصمیم حاکمیتی ثبت شد",
            `گزینه ${choiceId} اعمال گردید.`,
            "success",
          );
          setIsEventModalOpen(false);
        }}
      />

      <TradeActionDialog
        isOpen={tradeDialog.isOpen}
        resourceName={tradeDialog.resourceName}
        unit={tradeDialog.unit}
        mode={tradeDialog.mode}
        unitPrice={tradeDialog.unitPrice}
        maxAmount={tradeDialog.maxAmount}
        onClose={() => setTradeDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={(amount) => {
          setTradeDialog((prev) => ({ ...prev, isOpen: false }));
        }}
      />
    </>
  );
}
