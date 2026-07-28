"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface UnifiedModalShellProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  maxWidthClass?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function UnifiedModalShell({
  isOpen,
  title,
  subtitle,
  maxWidthClass = "max-w-6xl",
  onClose,
  children,
}: UnifiedModalShellProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 animate-fade-smooth cursor-pointer dir-rtl"
      dir="rtl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-card/95 border border-border w-full ${maxWidthClass} max-h-[88vh] rounded-3xl p-6 shadow-2xl flex flex-col space-y-4 text-foreground backdrop-blur-md cursor-default text-right overflow-hidden relative`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-border/80 shrink-0">
          <div className="space-y-0.5 text-right">
            <h2 className="text-lg md:text-xl font-extrabold text-foreground">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-2xl transition-colors cursor-pointer shrink-0"
            title="بستن پنجره"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );
}
