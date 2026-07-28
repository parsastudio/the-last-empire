import React from "react";
import { EventDecisionModal } from "../../modals/event-decision-modal";
import { useToast } from "@/presentation/context/toast-context";

interface TurnEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TurnEventDialog({ isOpen, onClose }: TurnEventDialogProps) {
  const { showToast } = useToast();

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
    <EventDecisionModal
      isOpen={isOpen}
      title={sampleEvent.title}
      description={sampleEvent.description}
      choices={sampleEvent.choices}
      onSelectChoice={(choiceId) => {
        showToast(
          "تصمیم حاکمیتی ثبت شد",
          `گزینه ${choiceId} اعمال گردید.`,
          "success",
        );
        onClose();
      }}
    />
  );
}
