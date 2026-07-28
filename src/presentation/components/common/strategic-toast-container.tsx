"use client";

import React from "react";
import { useToast } from "@/presentation/context/toast-context";
import { StrategicToastItem } from "./strategic-toast-item";

export function StrategicToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2.5 pointer-events-auto dir-rtl">
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
