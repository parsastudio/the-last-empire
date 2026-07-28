import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { StrategicToast } from "@/presentation/context/toast-context";

interface StrategicToastItemProps {
  toast: StrategicToast;
  onClose: (id: string) => void;
}

export function StrategicToastItem({
  toast,
  onClose,
}: StrategicToastItemProps) {
  const getStyle = () => {
    switch (toast.type) {
      case "success":
        return {
          border: "border-gdp/40",
          bg: "bg-card/90",
          iconBg: "bg-gdp/15 text-gdp",
          icon: CheckCircle2,
        };
      case "error":
        return {
          border: "border-military/40",
          bg: "bg-card/90",
          iconBg: "bg-military/15 text-military",
          icon: XCircle,
        };
      case "warning":
        return {
          border: "border-treasury/40",
          bg: "bg-card/90",
          iconBg: "bg-treasury/15 text-treasury",
          icon: AlertTriangle,
        };
      default:
        return {
          border: "border-primary/40",
          bg: "bg-card/90",
          iconBg: "bg-primary/15 text-primary",
          icon: Info,
        };
    }
  };

  const style = getStyle();
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
