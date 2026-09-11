"use client";

import React, { useMemo } from "react";
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import {
  useToast,
  StrategicToast,
  ToastType,
} from "@/presentation/context/toast-context";

function StrategicToastItem({
  toast,
  onClose,
}: {
  toast: StrategicToast;
  onClose: (id: string) => void;
}) {
  const style = useMemo(() => {
    switch (toast.type as ToastType) {
      case "success":
        return {
          border: "border-gdp/50",
          bg: "bg-card/95",
          iconBg: "bg-gdp/15 text-gdp border border-gdp/30",
          icon: CheckCircle2,
        };
      case "error":
        return {
          border: "border-military/50",
          bg: "bg-card/95",
          iconBg: "bg-military/15 text-military border border-military/30",
          icon: XCircle,
        };
      case "warning":
        return {
          border: "border-treasury/50",
          bg: "bg-card/95",
          iconBg: "bg-treasury/15 text-treasury border border-treasury/30",
          icon: AlertTriangle,
        };
      default:
        return {
          border: "border-primary/50",
          bg: "bg-card/95",
          iconBg: "bg-primary/15 text-primary border border-primary/30",
          icon: Info,
        };
    }
  }, [toast.type]);

  const Icon = style.icon;

  return (
    <div
      className={`w-84 backdrop-blur-2xl border ${style.border} ${style.bg} p-4 rounded-2xl shadow-2xl shadow-black/40 flex items-start justify-between gap-3 animate-fade-smooth text-start transition-all`}
    >
      <div className="flex items-start gap-3 overflow-hidden">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${style.iconBg}`}
        >
          <Icon size={16} />
        </div>
        <div className="space-y-0.5 overflow-hidden">
          <span className="text-xs font-bold text-foreground block truncate font-sans">
            {toast.title}
          </span>
          <p className="text-[11px] text-muted-foreground leading-relaxed break-words font-sans">
            {toast.message}
          </p>
        </div>
      </div>

      <button
        onClick={() => onClose(toast.id)}
        className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors shrink-0 cursor-pointer"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function StrategicToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 start-6 z-50 flex flex-col gap-3 pointer-events-auto">
      {toasts.map((toast) => (
        <StrategicToastItem
          key={toast.id}
          toast={toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}
