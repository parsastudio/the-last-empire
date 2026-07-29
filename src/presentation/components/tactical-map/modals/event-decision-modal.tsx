import React, { useEffect } from "react";
import { AlertCircle, X } from "lucide-react";
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
  onClose?: () => void;
}

export function EventDecisionModal({
  isOpen,
  title,
  description,
  choices,
  onSelectChoice,
  onClose,
}: EventDecisionModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-background/70 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-smooth cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 text-right dir-rtl cursor-default relative"
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-2xl transition-colors cursor-pointer"
            title="بستن پنجره"
          >
            <X size={18} />
          </button>
        )}

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
