import React from "react";
import { X } from "lucide-react";
import { StrategicToast } from "@/presentation/context/toast-context";
import { useToastItemStyle } from "./hooks/use-toast-item-style";

interface StrategicToastItemProps {
  toast: StrategicToast;
  onClose: (id: string) => void;
}

export function StrategicToastItem({
  toast,
  onClose,
}: StrategicToastItemProps) {
  const style = useToastItemStyle(toast.type);
  const Icon = style.icon;

  return (
    <div
      className={`w-80 backdrop-blur-xl border ${style.border} ${style.bg} p-3.5 rounded-2xl shadow-2xl flex items-start justify-between gap-3 animate-fade-smooth dir-rtl text-right`}
    >
      <div className="flex items-start gap-2.5 overflow-hidden">
        <div
          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}
        >
          <Icon size={16} />
        </div>
        <div className="space-y-0.5 overflow-hidden">
          <span className="text-xs font-bold text-foreground block truncate">
            {toast.title}
          </span>
          <p className="text-[11px] text-muted-foreground leading-snug break-words">
            {toast.message}
          </p>
        </div>
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="p-1 text-muted-foreground hover:text-foreground rounded-lg transition-colors shrink-0 cursor-pointer"
      >
        <X size={13} />
      </button>
    </div>
  );
}
