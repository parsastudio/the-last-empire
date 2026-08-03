import React from "react";
import { DomainEvent } from "@/domain/events/domain-event.schema";
import { UnifiedModalShell } from "@/presentation/components/common/unified-modal-shell";
import { PersianNumberFormatter } from "@/presentation/utils/persian-number-formatter";

interface DeltaInspectorModalProps {
  isOpen: boolean;
  event: DomainEvent | null;
  onClose: () => void;
}

export function DeltaInspectorModal({
  isOpen,
  event,
  onClose,
}: DeltaInspectorModalProps) {
  if (!isOpen || !event) return null;

  return (
    <UnifiedModalShell
      isOpen={isOpen}
      title={`بازرسی دلتای رویداد #${PersianNumberFormatter.toPersianDigits(event.metadata.sequence)}`}
      subtitle={`نوع اکشن: ${event.type} | نوبت: ${PersianNumberFormatter.toPersianDigits(event.metadata.turn)}`}
      maxWidthClass="max-w-xl"
      onClose={onClose}
    >
      <div className="space-y-4 text-right dir-rtl font-sans">
        <div className="bg-secondary/40 border border-border/60 p-3.5 rounded-2xl space-y-2 font-mono text-xs">
          <span className="text-muted-foreground font-sans text-[10px] block">
            جزئیات تغییرات دقیق دامنه (Delta Patches):
          </span>
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
            {event.deltaPatches.length === 0 ? (
              <span className="text-muted-foreground italic text-[11px]">
                هیچ تغییر ساختاری ثبت نشده است.
              </span>
            ) : (
              event.deltaPatches.map((patch, idx) => (
                <div
                  key={`${patch.path}-${idx}`}
                  className="bg-background/60 p-2 rounded-xl border border-border/40 flex items-center justify-between text-[11px]"
                >
                  <span className="text-primary font-mono">{patch.path}</span>
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-secondary rounded text-[9px] font-bold text-amber-500 uppercase">
                      {patch.op}
                    </span>
                    <span className="font-bold text-foreground">
                      {JSON.stringify(patch.value)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </UnifiedModalShell>
  );
}
