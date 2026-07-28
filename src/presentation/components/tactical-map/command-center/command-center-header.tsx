import React from "react";
import { X } from "lucide-react";

interface CommandCenterHeaderProps {
  title: string;
  subtitle: string;
  onClose: () => void;
}

export function CommandCenterHeader({
  title,
  subtitle,
  onClose,
}: CommandCenterHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-border shrink-0">
      <div className="space-y-0.5 text-right">
        <span className="text-[10px] font-mono font-bold text-gdp uppercase tracking-widest block">
          سامانه جامع مدیریت حاکمیت
        </span>
        <h1 className="text-xl font-extrabold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>

      <button
        onClick={onClose}
        className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-2xl transition-colors cursor-pointer"
      >
        <X size={20} />
      </button>
    </div>
  );
}
