import React from "react";
import { ArrowRight } from "lucide-react";

interface SelectNationHeaderProps {
  onBack: () => void;
}

export function SelectNationHeader({ onBack }: SelectNationHeaderProps) {
  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowRight size={15} />
          <span>بازگشت به منوی اصلی</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono font-bold text-gdp">
          انتخاب حاکمیت و ساختار سیاسی
        </span>
      </div>
    </header>
  );
}
