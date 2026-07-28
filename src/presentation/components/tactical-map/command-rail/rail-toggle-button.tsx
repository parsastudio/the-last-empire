import React from "react";
import { ChevronRight, ChevronLeft } from "lucide-react";

interface RailToggleButtonProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function RailToggleButton({
  isCollapsed,
  onToggle,
}: RailToggleButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="p-2.5 rounded-2xl bg-secondary/80 hover:bg-secondary border border-border/80 text-muted-foreground hover:text-foreground transition-all cursor-pointer flex items-center justify-center shrink-0"
      title={isCollapsed ? "باز کردن نوار فرماندهی" : "جمع کردن نوار"}
    >
      {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
    </button>
  );
}
