import React from "react";
import { EventDecisionModal } from "../../modals/event-decision-modal";
import { useToast } from "@/presentation/context/toast-context";
import { useGameActions } from "@/presentation/hooks/game/use-game-actions";

interface TurnEventDialogProps {
  isOpen: boolean;
  nationId?: string;
  onClose: () => void;
}

export function TurnEventDialog({
  isOpen,
  nationId = "NATION_118",
  onClose,
}: TurnEventDialogProps) {
  const { showToast } = useToast();
  const { dispatchAction } = useGameActions();

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

  const handleSelectChoice = async (choiceId: string) => {
    if (choiceId === "c1") {
      await dispatchAction(
        {
          id: `event-choice-${Date.now()}`,
          nationId,
          type: "SET_TAX_RATE",
          newRate: 20,
        },
        "سهمیه‌بندی سوخت صنایع و تنظیم مجدد مالیات اعمال گردید.",
      );
    } else {
      showToast(
        "تصمیم حاکمیتی ثبت شد",
        "تزریق سوبسید به نیروگاه‌ها با موفقیت صورت گرفت.",
        "success",
      );
    }
    onClose();
  };

  return (
    <EventDecisionModal
      isOpen={isOpen}
      title={sampleEvent.title}
      description={sampleEvent.description}
      choices={sampleEvent.choices}
      onSelectChoice={handleSelectChoice}
    />
  );
}
