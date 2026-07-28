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
    <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 shrink-0">
      <div className="space-y-0.5 text-right">
        <span className="text-[10px] font-mono font-bold text-gdp uppercase tracking-widest block">
          سامانه جامع مدیریت حاکمیت
        </span>
        <h1 className="text-xl font-extrabold text-slate-100">{title}</h1>
        <p className="text-xs text-slate-400">{subtitle}</p>
      </div>

      <button
        onClick={onClose}
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-2xl transition-colors cursor-pointer"
      >
        <X size={20} />
      </button>
    </div>
  );
}
