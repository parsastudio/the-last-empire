import React from "react";
import { Swords } from "lucide-react";

interface ReportNarrativeBoxProps {
  summary: string;
  strategicAssessment: string;
}

export function ReportNarrativeBox({
  summary,
  strategicAssessment,
}: ReportNarrativeBoxProps) {
  return (
    <div className="space-y-3 text-right">
      <p className="text-xs text-foreground/90 leading-relaxed bg-background/50 border border-border/80 p-4 rounded-2xl">
        {summary}
      </p>

      <div className="bg-secondary/30 border border-border/60 p-3.5 rounded-2xl space-y-1">
        <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1 font-mono uppercase">
          <Swords size={12} className="text-diplomacy" />
          ارزیابی ستاد کل فرماندهی
        </span>
        <p className="text-xs text-foreground/90 leading-relaxed">
          {strategicAssessment}
        </p>
      </div>
    </div>
  );
}
