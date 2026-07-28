import React from "react";
import { ChevronLeft } from "lucide-react";
import { EventImpactBadge } from "./event-impact-badge";

export interface EventChoiceOption {
  id: string;
  description: string;
  effectsSummary: { label: string; value: string; isPositive: boolean }[];
}

interface EventChoiceButtonProps {
  option: EventChoiceOption;
  onSelect: (optionId: string) => void;
}

export function EventChoiceButton({
  option,
  onSelect,
}: EventChoiceButtonProps) {
  return (
    <button
      onClick={() => onSelect(option.id)}
      className="w-full bg-background/60 hover:bg-secondary/60 border border-border/80 hover:border-primary/40 p-4 rounded-2xl text-right transition-all flex flex-col gap-2 group cursor-pointer dir-rtl"
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-xs font-bold text-foreground leading-relaxed">
          {option.description}
        </span>
        <ChevronLeft
          size={16}
          className="text-muted-foreground group-hover:-translate-x-1 transition-transform shrink-0"
        />
      </div>

      <div className="flex flex-wrap gap-1.5 pt-1">
        {option.effectsSummary.map((eff, idx) => (
          <EventImpactBadge
            key={idx}
            label={eff.label}
            value={eff.value}
            isPositive={eff.isPositive}
          />
        ))}
      </div>
    </button>
  );
}
