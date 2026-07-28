import React from "react";
import { LucideIcon } from "lucide-react";

interface QuickActionButtonProps {
  icon: LucideIcon;
  label: string;
  colorClass: string;
  bgHoverClass: string;
  onClick: () => void;
}

export function QuickActionButton({
  icon: Icon,
  label,
  colorClass,
  bgHoverClass,
  onClick,
}: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 ${bgHoverClass} ${colorClass} rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold shrink-0`}
      title={label}
    >
      <Icon size={13} />
      <span>{label}</span>
    </button>
  );
}
