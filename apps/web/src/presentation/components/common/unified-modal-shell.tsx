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
      style={{
        paddingTop: "max(0.5rem, env(safe-area-inset-top))",
        paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
      }}
      className="fixed inset-0 bg-background/85 backdrop-blur-2xl z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-smooth cursor-pointer dir-rtl pointer-events-auto"
      dir="rtl"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        className={`bg-card/95 border border-border/80 w-full ${maxWidthClass} h-[96vh] sm:h-auto max-h-[96vh] md:max-h-[88vh] rounded-2xl md:rounded-3xl p-3.5 sm:p-5 md:p-6 shadow-2xl shadow-black/95 flex flex-col space-y-2.5 sm:space-y-3.5 md:space-y-4 text-foreground backdrop-blur-3xl cursor-default text-right overflow-hidden relative ring-1 ring-white/10`}
      >
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

        <div className="flex items-center justify-between pb-2 sm:pb-3 md:pb-3.5 border-b border-border/60 shrink-0">
          <div className="space-y-0.5 text-right overflow-hidden pr-1">
            {title && (
              <h2 className="text-sm sm:text-base md:text-xl font-black text-foreground tracking-tight truncate">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-muted-foreground font-sans truncate">
                {subtitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 sm:p-2 md:p-2.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl md:rounded-2xl transition-all cursor-pointer shrink-0 border border-border/60 hover:border-border shadow-inner mr-2"
            title="بستن پنجره"
          >
            <X size={16} className="md:w-[18px] md:h-[18px]" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1 scroll-mask-y scrollbar-thin scrollbar-thumb-border/60 scrollbar-track-transparent">
          {children}
        </div>
      </div>
    </div>
  );
}
