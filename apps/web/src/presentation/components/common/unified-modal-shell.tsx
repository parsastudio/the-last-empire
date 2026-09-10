"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { useModalKeyboardShortcut } from "./hooks/use-modal-keyboard-shortcut";
import { TacticalSound } from "@/presentation/utils/tactical-sound";

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
  useModalKeyboardShortcut(isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      TacticalSound.playModalOpen();
    }
  }, [isOpen]);

  const handleClose = () => {
    TacticalSound.playModalClose();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={handleClose}
      onWheel={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseUp={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
      className="fixed inset-0 bg-background/80 backdrop-blur-2xl z-50 flex items-center justify-center p-4 md:p-6 animate-fade-smooth cursor-pointer dir-rtl pointer-events-auto"
      dir="rtl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className={`bg-card/95 border border-border/80 w-full ${maxWidthClass} max-h-[88vh] rounded-3xl p-6 shadow-2xl shadow-black/80 flex flex-col space-y-4 text-foreground backdrop-blur-3xl cursor-default text-right overflow-hidden relative ring-1 ring-white/5`}
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="flex items-center justify-between pb-3.5 border-b border-border/60 shrink-0">
          <div className="space-y-0.5 text-right">
            {title && (
              <h2 className="text-lg md:text-xl font-black text-foreground tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground font-sans">
                {subtitle}
              </p>
            )}
          </div>

          <button
            onClick={handleClose}
            className="p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-2xl transition-all cursor-pointer shrink-0 border border-border/60 hover:border-border"
            title="بستن پنجره"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );
}
