import React from "react";
import { AlertCircle } from "lucide-react";
import {
  EventChoiceButton,
  EventChoiceOption,
} from "./event/event-choice-button";

interface EventDecisionModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  choices: EventChoiceOption[];
  onSelectChoice: (choiceId: string) => void;
}

export function EventDecisionModal({
  isOpen,
  title,
  description,
  choices,
  onSelectChoice,
}: EventDecisionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-smooth">
      <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 text-right dir-rtl">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 font-mono uppercase tracking-wider">
            <AlertCircle size={15} />
            <span>بحران ملی | تصمیم‌گیری راهبردی</span>
          </div>
          <h2 className="text-lg font-extrabold text-foreground leading-tight">
            {title}
          </h2>
        </div>

        <p className="text-xs text-foreground/90 leading-relaxed bg-background/40 border border-border p-4 rounded-2xl">
          {description}
        </p>

        <div className="space-y-2.5">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-mono">
            گزینه‌های حاکمیت
          </span>
          {choices.map((choice) => (
            <EventChoiceButton
              key={choice.id}
              option={choice}
              onSelect={onSelectChoice}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
